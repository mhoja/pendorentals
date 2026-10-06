import { query, transaction } from '../config/db.js';
import { createSession, hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { HttpError, cleanText, formatDate, isIsoDate, isPhone, normalizePhone, personName, prettyPhone, todayIso } from '../utils/helpers.js';
import { loadOrder, nextCode } from '../services/orders.service.js';
import { getSettings } from '../services/settings.service.js';
import { OTHER_AREA, isKnownArea } from '../services/areas.service.js';
import { sendSms } from '../services/sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

export const RENTAL_CATALOG = [
    'Tents', 'Chairs', 'Tables', 'Seat covers', 'Lights', 'Red carpet', 'Carpet',
    'PA system', 'Microphone', 'LED screen', 'Camera', 'Light box', 'Utensils (cooking vessels)',
];

function itemsSummary(items) {
    const parts = items.map((item) => `${item.custom || item.name.replace(' (cooking vessels)', '')} x${item.quantity}`);
    return parts.length > 4 ? `${parts.slice(0, 4).join(', ')} +${parts.length - 4} more` : parts.join(', ');
}

function validateRequest(body) {
    const errors = {};
    const value = {
        firstName: personName(body.firstName),
        lastName: personName(body.lastName),
        phone: normalizePhone(body.phone),
        area: cleanText(body.area, 40),
        place: cleanText(body.place, 80),
        notes: cleanText(body.notes, 300),
        eventDate: String(body.eventDate || ''),
        days: Number(body.days),
        items: [],
    };
    if (!value.firstName) errors.firstName = 'Enter your first name.';
    if (!value.lastName) errors.lastName = 'Enter your last name.';
    if (!isPhone(value.phone)) errors.phone = 'Enter a valid phone number, e.g. 0712 345 678.';
    if (value.area === OTHER_AREA && !value.place) errors.place = 'Tell us where the event is.';
    if (!isIsoDate(value.eventDate)) errors.eventDate = 'Choose the event date.';
    else if (value.eventDate < todayIso()) errors.eventDate = 'The event date cannot be in the past.';
    if (!Number.isInteger(value.days) || value.days < 1 || value.days > 30) errors.days = 'Choose between 1 and 30 days.';

    for (const raw of (Array.isArray(body.items) ? body.items : []).slice(0, 30)) {
        const quantity = Number(raw?.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) continue;
        if (raw?.name === 'Other') {
            const custom = cleanText(raw.custom, 60);
            if (custom.length < 2) {
                errors.items = 'Tell us which item you need for “Other”.';
                continue;
            }
            if (!value.items.some((item) => item.custom?.toLowerCase() === custom.toLowerCase())) value.items.push({ name: 'Other', custom, quantity });
            continue;
        }
        const name = RENTAL_CATALOG.find((entry) => entry === raw?.name);
        if (name && !value.items.some((item) => item.name === name)) value.items.push({ name, custom: null, quantity });
    }
    if (value.items.length === 0 && !errors.items) errors.items = 'Choose at least one item to rent.';
    return { errors, value };
}

// GET /api/health
export async function healthCheck(_request, response) {
    await query('select 1');
    response.json({ status: 'ok' });
}

// GET /api/business
export async function getBusinessInfo(_request, response) {
    const settings = await getSettings();
    response.json({
        name: settings.businessName,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address: [settings.address, settings.region].filter(Boolean).join(', '),
        receiptFooter: settings.receiptFooter,
        receiptPrefix: settings.receiptPrefix,
    });
}

// POST /api/rental-requests
export async function createRentalRequest(request, response) {
    const { errors, value } = validateRequest(request.body || {});
    if (!value.area || !(await isKnownArea(value.area))) errors.area = 'Choose your area.';
    if (Object.keys(errors).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields: errors });

    const { orderCode, customer, temporaryPassword, session } = await transaction(async (db) => {
        let { rows: [customerRow] } = await db.query('select * from customers where phone = $1 for update', [value.phone]);
        let password = null;
        if (!customerRow) {
            password = newTemporaryPassword();
            ({ rows: [customerRow] } = await db.query(
                `insert into customers (first_name, last_name, phone, area, place, password_hash)
                 values ($1, $2, $3, $4, $5, $6) returning *`,
                [value.firstName, value.lastName, value.phone, value.area, value.place, hashPassword(password)],
            ));
        }
        const code = await nextCode(db, 'order_number_seq', 'ORD-', 4);
        const { rows: [order] } = await db.query(
            `insert into orders (code, customer_id, event_date, days, area, place, notes, source)
             values ($1, $2, $3, $4, $5, $6, $7, 'rent_now') returning id`,
            [code, customerRow.id, value.eventDate, value.days, value.area, value.place || null, value.notes || null],
        );
        for (const [position, item] of value.items.entries()) {
            await db.query(
                'insert into order_items (order_id, name, custom, quantity, position) values ($1, $2, $3, $4, $5)',
                [order.id, item.name, item.custom, item.quantity, position],
            );
        }
        const created = await createSession(db, 'customer', customerRow);
        return { orderCode: code, orderId: order.id, customer: customerRow, temporaryPassword: password, session: created };
    });

    const settings = await getSettings();
    const place = value.place ? `${value.place}, ${value.area}` : value.area;
    const login = temporaryPassword
        ? `Track it at ${publicUrl} - Username: ${value.phone}, Password: ${temporaryPassword}.`
        : `Track it at ${publicUrl} with your phone number.`;
    const message = `Hi ${value.firstName}, thank you for choosing ${settings.businessName}! We received your request ${orderCode}: ${itemsSummary(value.items)}. Event: ${formatDate(value.eventDate)} (${value.days} day${value.days === 1 ? '' : 's'}) at ${place}. We will call you to confirm the price. ${login} Help: ${settings.phone}`;
    const order = await loadOrder(orderCode);
    const sms = await sendSms(value.phone, message, { kind: 'rental_request', orderId: order.dbId });

    response.status(201).json({
        order: { ...order, sms: sms.status },
        account: {
            phone: prettyPhone(customer.phone),
            isNew: Boolean(temporaryPassword),
            temporaryPassword: temporaryPassword && sms.status !== 'sent' ? temporaryPassword : undefined,
        },
        sms: { status: sms.status },
        session,
    });
}
