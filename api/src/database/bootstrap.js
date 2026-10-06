import { promises as fs } from 'node:fs';
import path from 'node:path';
import { query, transaction } from '../config/db.js';
import { hashPassword } from '../services/auth.service.js';

export async function ensureAdmin() {
    const { rows } = await query("select 1 from staff where role = 'Admin' limit 1");
    if (rows.length) return;
    const phone = process.env.STAFF_PHONE || '0622882278';
    const [firstName, ...rest] = (process.env.STAFF_NAME || 'Pendo Mbolela').split(' ');
    await query(
        `insert into staff (first_name, last_name, phone, role, status, password_hash)
         values ($1, $2, $3, 'Admin', 'Active', $4)
         on conflict (phone) do update set role = 'Admin', status = 'Active'`,
        [firstName, rest.join(' ') || '-', phone, hashPassword(process.env.STAFF_PASSWORD || '12345')],
    );
    console.log(`Created admin account for ${phone}`);
}

// One-time move of data saved by the earlier JSON-file version of the API.
export async function importLegacyStore() {
    const file = path.join(process.env.DATA_DIR || path.resolve('data'), 'store.json');
    let store;
    try {
        store = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
        return;
    }
    const { rows } = await query("select 1 from settings where key = 'legacy_import'");
    if (rows.length) return;

    await transaction(async (db) => {
        const customerIds = new Map();
        for (const customer of store.customers || []) {
            const { rows: [row] } = await db.query(
                `insert into customers (first_name, last_name, phone, area, place, password_hash, created_at)
                 values ($1, $2, $3, $4, $5, $6, $7)
                 on conflict (phone) do update set phone = excluded.phone returning id`,
                [customer.firstName, customer.lastName, customer.phone, customer.area || null, customer.place || null, customer.passwordHash || null, customer.createdAt || new Date().toISOString()],
            );
            customerIds.set(customer.phone, row.id);
        }
        let maxOrder = 0;
        for (const order of store.orders || []) {
            const customerId = customerIds.get(order.customerPhone);
            if (!customerId) continue;
            const { rows: existing } = await db.query('select 1 from orders where code = $1', [order.id]);
            if (existing.length) continue;
            const { rows: [row] } = await db.query(
                `insert into orders (code, customer_id, status, event_date, days, area, place, notes, source, created_at)
                 values ($1, $2, $3, $4, $5, $6, $7, $8, 'rent_now', $9) returning id`,
                [order.id, customerId, order.status || 'New request', order.eventDate, order.days, order.area || null, order.place || null, order.notes || null, order.createdAt || new Date().toISOString()],
            );
            for (const [position, item] of (order.items || []).entries()) {
                await db.query('insert into order_items (order_id, name, custom, quantity, position) values ($1, $2, $3, $4, $5)',
                    [row.id, item.name, item.custom || null, item.quantity, position]);
            }
            maxOrder = Math.max(maxOrder, Number(String(order.id).replace(/\D/g, '')) || 0);
        }
        if (maxOrder) await db.query("select setval('order_number_seq', greatest($1, (select last_value from order_number_seq)))", [maxOrder]);
        for (const item of store.inventory || []) {
            await db.query(
                `insert into inventory_items (sku, name, category, rate, quantity, status, created_at, updated_at)
                 values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (sku) do nothing`,
                [item.sku, item.name, item.category, item.rate, item.quantity, item.status || 'Available', item.createdAt || new Date().toISOString(), item.updatedAt || new Date().toISOString()],
            );
        }
        await db.query("insert into settings (key, value) values ('legacy_import', $1)", [{
            at: new Date().toISOString(),
            customers: (store.customers || []).length,
            orders: (store.orders || []).length,
            inventory: (store.inventory || []).length,
        }]);
        console.log(`Imported ${(store.customers || []).length} customers, ${(store.orders || []).length} orders, ${(store.inventory || []).length} inventory items from the JSON store.`);
    });
}
