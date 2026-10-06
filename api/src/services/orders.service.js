import { query } from '../config/db.js';
import { HttpError, cleanText, isIsoDate, isWhole, prettyPhone } from '../utils/helpers.js';

export const ORDER_STATUSES = ['New request', 'Confirmed', 'Ready for pickup', 'Out for delivery', 'Completed', 'Cancelled'];
export const DELIVERY_STATUSES = ['Not needed', 'Scheduled', 'In transit', 'Delivered', 'Failed'];
export const ACTIVE_STATUSES = ['Confirmed', 'Ready for pickup', 'Out for delivery'];

export async function nextCode(db, sequence, prefix, pad) {
    const { rows } = await db.query(`select nextval('${sequence}') as n`);
    return `${prefix}${String(rows[0].n).padStart(pad, '0')}`;
}

export function computeTotals(order, items) {
    const priced = items.length > 0 && items.every((item) => item.rate !== null && item.rate !== undefined);
    const subtotal = items.reduce((sum, item) => sum + (item.rate || 0) * item.quantity * order.days, 0);
    const total = priced ? Math.max(0, subtotal + (order.delivery_fee || 0) - (order.discount || 0)) : null;
    return { priced, subtotal, total };
}

function shapeOrder(row, items, payments, invoice) {
    const { priced, subtotal, total } = computeTotals(row, items);
    const paid = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0);
    return {
        id: row.code,
        dbId: row.id,
        status: row.status,
        eventDate: row.event_date,
        days: row.days,
        area: row.area,
        place: row.place,
        notes: row.notes,
        source: row.source,
        deliveryRequired: row.delivery_required,
        deliveryFee: row.delivery_fee,
        deliveryStatus: row.delivery_status,
        driver: row.driver_id ? { id: row.driver_id, name: row.driver_name } : null,
        discount: row.discount,
        customer: {
            id: row.customer_id,
            name: `${row.c_first} ${row.c_last}`,
            firstName: row.c_first,
            phone: prettyPhone(row.c_phone),
            rawPhone: row.c_phone,
        },
        customerName: `${row.c_first} ${row.c_last}`,
        customerPhone: row.c_phone,
        items: items.map((item) => ({
            id: item.id,
            inventoryItemId: item.inventory_item_id,
            name: item.name,
            custom: item.custom || undefined,
            quantity: item.quantity,
            rate: item.rate,
            lineTotal: item.rate === null ? null : item.rate * item.quantity * row.days,
        })),
        priced,
        subtotal,
        total,
        paid,
        balance: total === null ? null : Math.max(0, total - paid),
        invoice: invoice ? { id: invoice.id, code: invoice.code, status: invoice.status, amount: invoice.amount, dueOn: invoice.due_on } : null,
        sms: row.sms_status || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// Loads orders matching an optional SQL condition, with items, payments and latest invoice.
export async function loadOrders(where = 'true', params = [], db = { query }) {
    const { rows } = await db.query(
        `select o.*, c.first_name as c_first, c.last_name as c_last, c.phone as c_phone,
                d.first_name || ' ' || d.last_name as driver_name,
                (select status from sms_log s where s.order_id = o.id order by s.id asc limit 1) as sms_status
           from orders o
           join customers c on c.id = o.customer_id
           left join staff d on d.id = o.driver_id
          where ${where}
          order by o.created_at desc`,
        params,
    );
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const [items, payments, invoices] = await Promise.all([
        db.query('select * from order_items where order_id = any($1) order by position, id', [ids]),
        db.query('select order_id, amount, status from payments where order_id = any($1)', [ids]),
        db.query(`select distinct on (order_id) * from invoices where order_id = any($1) and status <> 'Cancelled'
                  order by order_id, id desc`, [ids]),
    ]);
    return rows.map((row) => shapeOrder(
        row,
        items.rows.filter((item) => item.order_id === row.id),
        payments.rows.filter((payment) => payment.order_id === row.id),
        invoices.rows.find((invoice) => invoice.order_id === row.id),
    ));
}

export async function loadOrder(code, db) {
    const [order] = await loadOrders('o.code = $1', [code], db);
    if (!order) throw new HttpError(404, 'Order not found.');
    return order;
}

// Validates an items array from staff: [{ inventoryItemId?, name, custom?, quantity, rate? }]
export async function validateOrderItems(rawItems, db = { query }) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) throw new HttpError(400, 'Add at least one item.', { fields: { items: 'Add at least one item.' } });
    if (rawItems.length > 60) throw new HttpError(400, 'Too many items on one order.');
    const inventoryIds = rawItems.map((item) => item?.inventoryItemId).filter(Boolean);
    const { rows: inventory } = inventoryIds.length
        ? await db.query('select id, name, rate from inventory_items where id = any($1::uuid[])', [inventoryIds])
        : { rows: [] };
    return rawItems.map((raw, index) => {
        const quantity = Number(raw?.quantity);
        if (!isWhole(quantity, 1, 100000)) throw new HttpError(400, `Item ${index + 1}: enter a quantity.`);
        const rate = raw?.rate === null || raw?.rate === undefined || raw?.rate === '' ? null : Number(raw.rate);
        if (rate !== null && !isWhole(rate, 0, 100000000)) throw new HttpError(400, `Item ${index + 1}: enter a whole TSh rate.`);
        if (raw?.inventoryItemId) {
            const stock = inventory.find((entry) => entry.id === raw.inventoryItemId);
            if (!stock) throw new HttpError(400, `Item ${index + 1}: inventory item not found.`);
            return { inventoryItemId: stock.id, name: stock.name, custom: null, quantity, rate: rate ?? stock.rate };
        }
        const name = cleanText(raw?.name, 60);
        if (name.length < 2) throw new HttpError(400, `Item ${index + 1}: enter a name.`);
        const custom = raw?.custom ? cleanText(raw.custom, 60) : null;
        return { inventoryItemId: null, name, custom, quantity, rate };
    });
}

export async function replaceOrderItems(db, orderId, items) {
    await db.query('delete from order_items where order_id = $1', [orderId]);
    for (const [position, item] of items.entries()) {
        await db.query(
            'insert into order_items (order_id, inventory_item_id, name, custom, quantity, rate, position) values ($1, $2, $3, $4, $5, $6, $7)',
            [orderId, item.inventoryItemId, item.name, item.custom, item.quantity, item.rate, position],
        );
    }
}

export function validateSchedule(body, { partial = false } = {}) {
    const value = {};
    if (!partial || body.eventDate !== undefined) {
        if (!isIsoDate(body.eventDate)) throw new HttpError(400, 'Choose the event date.', { fields: { eventDate: 'Choose the event date.' } });
        value.event_date = body.eventDate;
    }
    if (!partial || body.days !== undefined) {
        const days = Number(body.days);
        if (!isWhole(days, 1, 60)) throw new HttpError(400, 'Days must be between 1 and 60.', { fields: { days: 'Between 1 and 60 days.' } });
        value.days = days;
    }
    return value;
}
