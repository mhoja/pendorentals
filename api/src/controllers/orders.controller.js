import { query, transaction } from '../config/db.js';
import { MANAGERS, hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { HttpError, cleanText, formatDate, formatTSh, isPhone, isWhole, normalizePhone, personName } from '../utils/helpers.js';
import { DELIVERY_STATUSES, ORDER_STATUSES, loadOrder, loadOrders, nextCode, replaceOrderItems, validateOrderItems, validateSchedule } from '../services/orders.service.js';
import { fillTemplate, getSettings } from '../services/settings.service.js';
import { sendSms } from '../services/sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

// An order can't be confirmed or processed until every item has a rate.
const PRICED_STATUSES = ['Confirmed', 'Ready for pickup', 'Out for delivery', 'Completed'];
function requirePrices(status, items) {
    const priced = items.length > 0 && items.every((item) => item.rate !== null && item.rate !== undefined);
    if (PRICED_STATUSES.includes(status) && !priced) {
        throw new HttpError(400, `Set a rate for every item before marking the order ${status.toLowerCase()}.`, { fields: { status: 'Set a rate for every item first.' } });
    }
}

function validateOrderBody(body, { partial }) {
    const value = validateSchedule(body, { partial });
    const text = { area: 40, place: 80, notes: 500 };
    for (const [key, max] of Object.entries(text)) {
        if (body[key] !== undefined) value[key] = cleanText(body[key], max) || null;
    }
    if (body.deliveryRequired !== undefined) value.delivery_required = Boolean(body.deliveryRequired);
    if (body.deliveryFee !== undefined) {
        const fee = Number(body.deliveryFee || 0);
        if (!isWhole(fee, 0, 100000000)) throw new HttpError(400, 'Enter a whole TSh delivery fee.');
        value.delivery_fee = fee;
    }
    if (body.discount !== undefined) {
        const discount = Number(body.discount || 0);
        if (!isWhole(discount, 0, 100000000)) throw new HttpError(400, 'Enter a whole TSh discount.');
        value.discount = discount;
    }
    if (body.status !== undefined) {
        if (!ORDER_STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown order status.');
        value.status = body.status;
    }
    if (body.deliveryStatus !== undefined) {
        if (!DELIVERY_STATUSES.includes(body.deliveryStatus)) throw new HttpError(400, 'Unknown delivery status.');
        value.delivery_status = body.deliveryStatus;
    }
    if (body.driverId !== undefined) value.driver_id = body.driverId ? Number(body.driverId) : null;
    return value;
}

async function resolveCustomer(db, body) {
    if (body.customerId) {
        const { rows: [customer] } = await db.query('select * from customers where id = $1', [Number(body.customerId)]);
        if (!customer) throw new HttpError(400, 'Customer not found.');
        return { customer, temporaryPassword: null };
    }
    const raw = body.customer || {};
    const phone = normalizePhone(raw.phone);
    const firstName = personName(raw.firstName);
    const lastName = personName(raw.lastName);
    const fields = {};
    if (!firstName) fields.firstName = 'Enter a first name.';
    if (!lastName) fields.lastName = 'Enter a last name.';
    if (!isPhone(phone)) fields.phone = 'Enter a valid phone number.';
    if (Object.keys(fields).length) throw new HttpError(400, 'Check the customer details.', { fields });
    const { rows: [existing] } = await db.query('select * from customers where phone = $1', [phone]);
    if (existing) return { customer: existing, temporaryPassword: null };
    const password = newTemporaryPassword();
    const { rows: [customer] } = await db.query(
        'insert into customers (first_name, last_name, phone, area, place, password_hash) values ($1, $2, $3, $4, $5, $6) returning *',
        [firstName, lastName, phone, cleanText(raw.area, 40) || null, cleanText(raw.place, 80) || null, hashPassword(password)],
    );
    return { customer, temporaryPassword: password };
}

// GET /api/orders
export async function listOrders(request, response) {
    const conditions = [];
    const params = [];
    if (request.user.role === 'Delivery staff') {
        params.push(request.user.id);
        conditions.push(`(o.driver_id = $${params.length} or o.delivery_required)`);
    }
    if (request.query.status && ORDER_STATUSES.includes(request.query.status)) {
        params.push(request.query.status);
        conditions.push(`o.status = $${params.length}`);
    }
    if (request.query.customerId && isWhole(Number(request.query.customerId), 1)) {
        params.push(Number(request.query.customerId));
        conditions.push(`o.customer_id = $${params.length}`);
    }
    const orders = await loadOrders(conditions.join(' and ') || 'true', params);
    const { rows: drivers } = await query("select id, first_name || ' ' || last_name as name from staff where role in ('Delivery staff', 'Admin', 'Store manager') and status <> 'Inactive' order by first_name");
    response.json({ orders, drivers, statuses: ORDER_STATUSES, deliveryStatuses: DELIVERY_STATUSES });
}

// GET /api/orders/:code
export async function getOrder(request, response) {
    response.json({ order: await loadOrder(request.params.code) });
}

// POST /api/orders
export async function createOrder(request, response) {
    const body = request.body || {};
    const value = validateOrderBody(body, { partial: false });
    const items = await validateOrderItems(body.items);
    if (!value.status) value.status = items.every((item) => item.rate !== null) ? 'Confirmed' : 'New request';
    requirePrices(value.status, items);
    const { code, customer, temporaryPassword } = await transaction(async (db) => {
        const { customer: owner, temporaryPassword: password } = await resolveCustomer(db, body);
        const orderCode = await nextCode(db, 'order_number_seq', 'ORD-', 4);
        const columns = { ...value, code: orderCode, customer_id: owner.id, source: 'staff', created_by: request.user.id };
        if (!columns.area) columns.area = owner.area;
        const keys = Object.keys(columns);
        const { rows: [order] } = await db.query(
            `insert into orders (${keys.join(', ')}) values (${keys.map((_, index) => `$${index + 1}`).join(', ')}) returning id`,
            keys.map((key) => columns[key]),
        );
        await replaceOrderItems(db, order.id, items);
        return { code: orderCode, customer: owner, temporaryPassword: password };
    });
    const order = await loadOrder(code);
    let sms = null;
    if (body.notifyCustomer !== false) {
        const settings = await getSettings();
        const login = temporaryPassword ? ` Track it at ${publicUrl} - Username: ${customer.phone}, Password: ${temporaryPassword}.` : '';
        const totalText = order.total !== null ? ` Total: ${formatTSh(order.total)}.` : ' We will confirm the price shortly.';
        sms = await sendSms(customer.phone, `Hi ${customer.first_name}, ${settings.businessName} has created your booking ${code} for ${formatDate(order.eventDate)} (${order.days} day${order.days === 1 ? '' : 's'}).${totalText}${login} Help: ${settings.phone}`, { kind: 'order_created', orderId: order.dbId });
    }
    response.status(201).json({ order, sms: sms && { status: sms.status }, temporaryPassword: temporaryPassword && sms?.status !== 'sent' ? temporaryPassword : undefined });
}

// PATCH /api/orders/:code
export async function updateOrder(request, response) {
    const body = request.body || {};
    const isManager = MANAGERS.includes(request.user.role);
    const allowed = isManager ? null : ['deliveryStatus', 'status'];
    if (allowed && Object.keys(body).some((key) => !allowed.includes(key) && key !== 'notifyCustomer')) {
        throw new HttpError(403, 'You can only update delivery and order status.');
    }
    if (!isManager && body.status && !['Out for delivery', 'Completed'].includes(body.status)) {
        throw new HttpError(403, 'You can only mark orders as out for delivery or completed.');
    }
    const before = await loadOrder(request.params.code);
    const value = validateOrderBody(body, { partial: true });
    const items = body.items !== undefined ? await validateOrderItems(body.items) : null;
    const statusAfter = value.status || before.status;
    if (value.status || items) requirePrices(statusAfter, items || before.items);
    await transaction(async (db) => {
        const keys = Object.keys(value);
        if (keys.length) {
            await db.query(
                `update orders set ${keys.map((key, index) => `${key} = $${index + 2}`).join(', ')}, updated_at = now() where id = $1`,
                [before.dbId, ...keys.map((key) => value[key])],
            );
        }
        if (items) {
            await replaceOrderItems(db, before.dbId, items);
            await db.query('update orders set updated_at = now() where id = $1', [before.dbId]);
        }
    });
    const order = await loadOrder(request.params.code);

    let sms = null;
    const statusChanged = value.status && value.status !== before.status;
    if (statusChanged && body.notifyCustomer !== false) {
        const settings = await getSettings();
        const templateKey = { Confirmed: 'bookingConfirmed', 'Out for delivery': 'outForDelivery', Completed: 'completed' }[value.status];
        const enabled = { Confirmed: settings.customerConfirm, 'Out for delivery': settings.customerDelivery, Completed: settings.customerThanks }[value.status];
        if (templateKey && enabled) {
            const message = fillTemplate(settings.smsTemplates[templateKey], {
                firstName: order.customer.firstName,
                order: order.id,
                date: formatDate(order.eventDate),
                total: order.total === null ? 'to be confirmed' : formatTSh(order.total),
                place: order.place ? `${order.place}, ${order.area}` : order.area || 'your venue',
                phone: settings.phone,
            });
            sms = await sendSms(order.customerPhone, message, { kind: 'order_status', orderId: order.dbId });
        }
    }
    response.json({ order, sms: sms && { status: sms.status } });
}
