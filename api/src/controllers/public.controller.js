import { query, transaction } from '../config/db.js';
import { createSession, hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { HttpError, cleanText, greetName, isIsoDate, isPhone, normalizePhone, personName, prettyPhone, todayIso } from '../utils/helpers.js';
import { MAX_ORDER_DAYS, loadOrder, nextCode, smsDate, smsDays, smsItems } from '../services/orders.service.js';
import { getSettings, sendTemplate } from '../services/settings.service.js';
import { OTHER_AREA, isKnownArea } from '../services/areas.service.js';
import { notifyOrderRequest } from '../services/notifications.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

export const RENTAL_CATALOG = [
    'Tents', 'Chairs', 'Tables', 'Seat covers', 'Lights', 'Red carpet', 'Carpet',
    'PA system', 'Microphone', 'LED screen', 'Camera', 'Light box', 'Utensils (cooking vessels)',
];

// One line per requested item with its quantity (prices are confirmed later).
function itemsSummary(items) {
    const lines = items.map((item) => `- ${item.custom || item.name.replace(' (cooking vessels)', '')} x${item.quantity}`);
    return lines.length > 8 ? [...lines.slice(0, 8), `+${lines.length - 8} more`].join('\n') : lines.join('\n');
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Inventory customers can pick from, with today's daily rate. Items in maintenance or out of stock are left out.
async function rentableItems(ids = null) {
    const { rows } = await query(
        `select id, name, category, rate, quantity from inventory_items
          where status = 'Available' and quantity > 0 ${ids ? 'and id = any($1::uuid[])' : ''}
          order by category, name`,
        ids ? [ids] : [],
    );
    return rows;
}

// GET /api/rental-catalog — what customers can rent and the price per day.
export async function getRentalCatalog(_request, response) {
    const items = await rentableItems();
    response.json({ items: items.map(({ id, name, category, rate, quantity }) => ({ id, name, category, rate, quantity })) });
}

// Items picked from inventory carry their rate, so the request arrives priced. "Other" items still need a price.
async function validateRequest(body) {
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
    if (!Number.isInteger(value.days) || value.days < 1 || value.days > MAX_ORDER_DAYS) errors.days = `Choose between 1 and ${MAX_ORDER_DAYS} days.`;

    const rawItems = (Array.isArray(body.items) ? body.items : []).slice(0, 30);
    const ids = rawItems.map((raw) => raw?.inventoryItemId).filter((id) => typeof id === 'string' && UUID.test(id));
    const stock = ids.length ? await rentableItems(ids) : [];
    for (const raw of rawItems) {
        const quantity = Number(raw?.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) continue;
        if (raw?.inventoryItemId) {
            const entry = stock.find((row) => row.id === raw.inventoryItemId);
            if (!entry) {
                errors.items = 'One of the items is no longer available. Remove it and choose again.';
                continue;
            }
            if (!value.items.some((item) => item.inventoryItemId === entry.id)) {
                value.items.push({ name: entry.name, custom: null, quantity, inventoryItemId: entry.id, rate: entry.rate });
            }
            continue;
        }
        if (raw?.name === 'Other') {
            const custom = cleanText(raw.custom, 60);
            if (custom.length < 2) {
                errors.items = 'Tell us which item you need for “Other”.';
                continue;
            }
            if (!value.items.some((item) => item.custom?.toLowerCase() === custom.toLowerCase())) value.items.push({ name: 'Other', custom, quantity, inventoryItemId: null, rate: null });
            continue;
        }
        const name = RENTAL_CATALOG.find((entry) => entry === raw?.name);
        if (name && !value.items.some((item) => item.name === name)) value.items.push({ name, custom: null, quantity, inventoryItemId: null, rate: null });
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
    const { errors, value } = await validateRequest(request.body || {});
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
            `insert into orders (code, customer_id, event_date, days, area, place, notes, source, request_state)
             values ($1, $2, $3, $4, $5, $6, $7, 'rent_now', 'pending') returning id`,
            [code, customerRow.id, value.eventDate, value.days, value.area, value.place || null, value.notes || null],
        );
        for (const [position, item] of value.items.entries()) {
            await db.query(
                'insert into order_items (order_id, inventory_item_id, name, custom, quantity, rate, position) values ($1, $2, $3, $4, $5, $6, $7)',
                [order.id, item.inventoryItemId, item.name, item.custom, item.quantity, item.rate, position],
            );
        }
        const created = await createSession(db, 'customer', customerRow);
        return { orderCode: code, orderId: order.id, customer: customerRow, temporaryPassword: password, session: created };
    });

    const settings = await getSettings();
    const place = value.place ? `${value.place}, ${value.area}` : value.area;
    const order = await loadOrder(orderCode);
    const sms = await sendTemplate(settings, 'requestReceived', value.phone, (lang) => ({
        firstName: greetName(value.firstName),
        order: orderCode,
        itemList: order.total === null ? itemsSummary(value.items) : smsItems(order, { lang, budget: 300 }),
        date: smsDate(value.eventDate, lang),
        days: smsDays(value.days, lang),
        place,
        login: lang === 'sw'
            ? (temporaryPassword ? `\nFuatilia: ${publicUrl} - Namba: ${value.phone}, Nenosiri: ${temporaryPassword}.` : `\nFuatilia: ${publicUrl} kwa namba yako ya simu.`)
            : (temporaryPassword ? `\nTrack it at ${publicUrl} - Username: ${value.phone}, Password: ${temporaryPassword}.` : `\nTrack it at ${publicUrl} with your phone number.`),
        phone: settings.phone,
    }), { kind: 'rental_request', orderId: order.dbId });
    await notifyOrderRequest(order).catch((error) => console.error('Could not notify staff', error.message));

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

// POST /api/my/rental-requests — a signed-in customer requests a rental from inside their account.
export async function createMyRentalRequest(request, response) {
    const { rows: [customerRow] } = await query('select * from customers where id = $1', [request.user.id]);
    if (!customerRow) throw new HttpError(404, 'Customer account not found.');
    const { errors, value } = await validateRequest({
        ...(request.body || {}),
        firstName: customerRow.first_name,
        lastName: customerRow.last_name,
        phone: customerRow.phone,
    });
    if (!value.area || !(await isKnownArea(value.area))) errors.area = 'Choose your area.';
    if (Object.keys(errors).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields: errors });

    const orderCode = await transaction(async (db) => {
        const code = await nextCode(db, 'order_number_seq', 'ORD-', 4);
        const { rows: [order] } = await db.query(
            `insert into orders (code, customer_id, event_date, days, area, place, notes, source, request_state)
             values ($1, $2, $3, $4, $5, $6, $7, 'rent_now', 'pending') returning id`,
            [code, customerRow.id, value.eventDate, value.days, value.area, value.place || null, value.notes || null],
        );
        for (const [position, item] of value.items.entries()) {
            await db.query(
                'insert into order_items (order_id, inventory_item_id, name, custom, quantity, rate, position) values ($1, $2, $3, $4, $5, $6, $7)',
                [order.id, item.inventoryItemId, item.name, item.custom, item.quantity, item.rate, position],
            );
        }
        return code;
    });

    const settings = await getSettings();
    const place = value.place ? `${value.place}, ${value.area}` : value.area;
    const order = await loadOrder(orderCode);
    const sms = await sendTemplate(settings, 'requestReceived', value.phone, (lang) => ({
        firstName: greetName(value.firstName),
        order: orderCode,
        itemList: order.total === null ? itemsSummary(value.items) : smsItems(order, { lang, budget: 300 }),
        date: smsDate(value.eventDate, lang),
        days: smsDays(value.days, lang),
        place,
        login: lang === 'sw' ? `\nFuatilia: ${publicUrl} kwa namba yako ya simu.` : `\nTrack it at ${publicUrl} with your phone number.`,
        phone: settings.phone,
    }), { kind: 'rental_request', orderId: order.dbId });
    await notifyOrderRequest(order).catch((error) => console.error('Could not notify staff', error.message));

    const { dbId, customer: _customer, ...shown } = order;
    response.status(201).json({ order: shown, sms: { status: sms.status, phone: prettyPhone(customerRow.phone) } });
}
