// Loads realistic sample data for Pendo Rentals. Safe to re-run: it only seeds an empty database.
// Usage: npm run seed
import 'dotenv/config';
import { pool, query, transaction } from '../config/db.js';
import { migrate } from './migrations.js';
import { ensureAdmin } from './bootstrap.js';
import { hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { nextCode } from '../services/orders.service.js';
import { addDays, todayIso } from '../utils/helpers.js';

const today = todayIso();

const INVENTORY = [
    ['TEN-2001', 'Wedding tent 10×20 m', 'Tents', 250000, 3, { length: 20, width: 10, height: 5, capacity: 200 }],
    ['TEN-2002', 'Stretch tent 8×12 m', 'Tents', 180000, 4, { length: 12, width: 8, height: 4, capacity: 100 }],
    ['TEN-2003', 'Gazebo 3×3 m', 'Tents', 35000, 10, { length: 3, width: 3, height: 2.5, capacity: 15 }],
    ['CHA-2001', 'Plastic chair (white)', 'Chairs', 500, 600, { seat_height: 45 }],
    ['CHA-2002', 'Chiavari chair (gold)', 'Chairs', 2500, 200, { seat_height: 46 }],
    ['TAB-2001', 'Round table (10 seats)', 'Tables', 6000, 60, { length: 180, width: 180, seats: 10 }],
    ['TAB-2002', 'Rectangular table', 'Tables', 5000, 40, { length: 240, width: 75, seats: 8 }],
    ['SEA-2001', 'Chair cover with sash', 'Seat covers', 700, 500, {}],
    ['LIG-2001', 'Festoon string lights (20 m)', 'Lighting', 15000, 30, { power: 60 }],
    ['LIG-2002', 'LED flood light', 'Lighting', 10000, 20, { power: 200 }],
    ['CAR-2001', 'Red carpet (per metre)', 'Carpets', 3000, 100, { length: 1, width: 1.5 }],
    ['SOU-2001', 'PA system with 2 speakers', 'Sound (PA & mics)', 120000, 3, { power: 2000 }],
    ['SOU-2002', 'Wireless microphone', 'Sound (PA & mics)', 15000, 8, {}],
    ['SCR-2001', 'LED screen 3×2 m', 'Screens & cameras', 400000, 1, { size: 140 }],
    ['LIG-2003', 'Light box letters "LOVE"', 'Light boxes', 50000, 2, { length: 120, height: 90 }],
    ['UTE-2001', 'Cooking pot (large)', 'Utensils', 8000, 15, { capacity: 50 }],
];

const CUSTOMERS = [
    ['Neema', 'Joseph', '0754321987', 'Katoro', 'Katoro Social Hall'],
    ['Baraka', 'Mwita', '0688123456', 'Kayenze', 'Kayenze Primary School'],
    ['Asha', 'Ali', '0699888777', 'Geita Town', 'Geita Gold Hotel'],
    ['Rehema', 'Said', '0711222333', 'Nyankumbu', ''],
    ['John', 'Masanja', '0767454545', 'Kalangalala', 'Kalangalala Church'],
    ['Grace', 'Kisanga', '0715990011', 'Geita Town', 'Uwanja wa CCM'],
    ['Peter', 'Mollel', '0682334455', 'Nyarugusu', ''],
    ['Zawadi', 'Mushi', '0744667788', 'Kayenze', 'Home – Kayenze B'],
];

const STAFF = [
    ['Grace', 'Chen', '0754210455', 'Store manager'],
    ['Daniel', 'Kim', '0765330812', 'Inventory staff'],
    ['Juma', 'Mussa', '0688451093', 'Delivery staff'],
];

// [customerIndex, status, eventOffsetDays, days, items[[sku, qty]], delivery fee, discount, delivery status, payments[[amount|'full', method, daysAgo]]]
const ORDERS = [
    [0, 'Completed', -20, 2, [['TEN-2001', 1], ['CHA-2002', 150], ['TAB-2001', 15], ['SEA-2001', 150]], 40000, 20000, 'Delivered', [['full', 'M-Pesa', 22]]],
    [1, 'Completed', -12, 1, [['TEN-2002', 1], ['CHA-2001', 100], ['TAB-2002', 10]], 20000, 0, 'Delivered', [[150000, 'Cash', 14], ['full', 'M-Pesa', 11]]],
    [2, 'Completed', -6, 1, [['SOU-2001', 1], ['SOU-2002', 2], ['LIG-2002', 4]], 0, 10000, 'Not needed', [['full', 'Bank transfer', 6]]],
    [4, 'Out for delivery', 0, 2, [['TEN-2003', 4], ['CHA-2001', 80], ['UTE-2001', 4]], 25000, 0, 'In transit', [[100000, 'M-Pesa', 2]]],
    [5, 'Ready for pickup', 1, 1, [['TAB-2001', 8], ['CHA-2002', 80], ['LIG-2001', 6], ['CAR-2001', 30]], 0, 0, 'Not needed', [[200000, 'Tigo Pesa', 1]]],
    [3, 'Confirmed', 4, 2, [['TEN-2001', 1], ['SCR-2001', 1], ['LIG-2003', 1]], 50000, 50000, 'Scheduled', [[300000, 'M-Pesa', 0]]],
    [6, 'Confirmed', 9, 1, [['TEN-2002', 2], ['CHA-2001', 200]], 30000, 0, 'Scheduled', []],
    [7, 'New request', 14, 1, [['Tents', 1], ['Chairs', 100]], 0, 0, 'Not needed', []],
    [0, 'New request', 21, 3, [['Tents', 2], ['Other:Flower arch', 1]], 0, 0, 'Not needed', []],
    [1, 'Cancelled', 3, 1, [['TAB-2002', 6]], 0, 0, 'Not needed', []],
];

const EXPENSES = [
    [-25, 'Rent & utilities', 'Warehouse rent – Kayenze', 'Msafiri Properties', 'Bank transfer', 400000, 'Approved'],
    [-18, 'Equipment maintenance', 'Tent canvas repair', 'Geita Canvas Works', 'Cash', 85000, 'Approved'],
    [-15, 'Delivery & transport', 'Fuel for delivery truck', 'Puma Energy Geita', 'M-Pesa', 120000, 'Approved'],
    [-10, 'Salaries & wages', 'Casual labour – setup crew', 'Crew', 'Cash', 150000, 'Approved'],
    [-7, 'Supplies', 'Tent pegs and ropes', 'Geita Hardware', 'Cash', 45000, 'Approved'],
    [-3, 'Marketing', 'Instagram & radio advert', 'Storm FM', 'M-Pesa', 60000, 'Approved'],
    [-1, 'Delivery & transport', 'Driver allowance', 'Staff', 'M-Pesa', 30000, 'Pending'],
];

async function seed() {
    await migrate();
    await ensureAdmin();
    const { rows: [counts] } = await query(
        `select (select count(*) from inventory_items) as inventory, (select count(*) from orders) as orders,
                (select count(*) from expenses) as expenses`,
    );
    if (counts.inventory > 0 || counts.orders > 0 || counts.expenses > 0) {
        console.log(`Database already has data (${counts.inventory} items, ${counts.orders} orders, ${counts.expenses} expenses). Seed skipped.`);
        return;
    }

    await transaction(async (db) => {
        const { rows: [admin] } = await db.query("select id from staff where role = 'Admin' order by id limit 1");
        const stock = {};
        for (const [sku, name, category, rate, quantity, dimensions] of INVENTORY) {
            const { rows: [item] } = await db.query(
                `insert into inventory_items (sku, name, category, rate, quantity, dimensions)
                 values ($1, $2, $3, $4, $5, $6) returning id, name, rate`,
                [sku, name, category, rate, quantity, dimensions],
            );
            stock[sku] = item;
        }
        await db.query("update inventory_items set status = 'Maintenance' where sku = 'LIG-2002'");

        const staffIds = {};
        for (const [firstName, lastName, phone, role] of STAFF) {
            const { rows: [row] } = await db.query(
                `insert into staff (first_name, last_name, phone, role, status, password_hash)
                 values ($1, $2, $3, $4, 'Active', $5) on conflict (phone) do update set role = excluded.role returning id`,
                [firstName, lastName, phone, role, hashPassword(newTemporaryPassword())],
            );
            staffIds[role] = row.id;
        }

        const customerIds = [];
        for (const [index, [firstName, lastName, phone, area, place]] of CUSTOMERS.entries()) {
            const { rows: [row] } = await db.query(
                `insert into customers (first_name, last_name, phone, area, place, password_hash, created_at)
                 values ($1, $2, $3, $4, $5, $6, now() - ($7 || ' days')::interval)
                 on conflict (phone) do update set phone = excluded.phone returning id`,
                [firstName, lastName, phone, area, place || null, hashPassword(newTemporaryPassword()), 40 - index * 4],
            );
            customerIds.push(row.id);
        }

        for (const [customerIndex, status, offset, days, items, deliveryFee, discount, deliveryStatus, payments] of ORDERS) {
            const [, , , area, place] = CUSTOMERS[customerIndex];
            const priced = items.every(([sku]) => stock[sku]);
            const code = await nextCode(db, 'order_number_seq', 'ORD-', 4);
            const { rows: [order] } = await db.query(
                `insert into orders (code, customer_id, status, event_date, days, area, place, delivery_required, delivery_fee,
                                     delivery_status, driver_id, discount, source, created_by, created_at)
                 values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now() - ($15 || ' days')::interval) returning id`,
                [code, customerIds[customerIndex], status, addDays(today, offset), days, area, place || null, deliveryFee > 0, deliveryFee,
                    deliveryStatus, deliveryFee > 0 ? staffIds['Delivery staff'] : null, discount, priced ? 'staff' : 'rent_now',
                    priced ? admin.id : null, Math.max(1, 10 - offset)],
            );
            let subtotal = 0;
            for (const [position, [sku, quantity]] of items.entries()) {
                const item = stock[sku];
                const [isOther, custom] = sku.startsWith('Other:') ? [true, sku.slice(6)] : [false, null];
                await db.query(
                    'insert into order_items (order_id, inventory_item_id, name, custom, quantity, rate, position) values ($1, $2, $3, $4, $5, $6, $7)',
                    [order.id, item?.id || null, item?.name || (isOther ? 'Other' : sku), custom, quantity, item?.rate ?? null, position],
                );
                subtotal += (item?.rate || 0) * quantity * days;
            }
            if (!priced || status === 'Cancelled') continue;

            const total = subtotal + deliveryFee - discount;
            const invoiceCode = await nextCode(db, 'invoice_number_seq', 'INV-', 6);
            const issuedOn = addDays(today, Math.min(-1, offset - 7));
            const { rows: [invoice] } = await db.query(
                `insert into invoices (code, order_id, customer_id, issued_on, due_on, amount, created_by)
                 values ($1, $2, $3, $4, $5, $6, $7) returning id`,
                [invoiceCode, order.id, customerIds[customerIndex], issuedOn, addDays(issuedOn, 7), total, admin.id],
            );
            let paid = 0;
            for (const [amountSpec, method, daysAgo] of payments) {
                const amount = amountSpec === 'full' ? total - paid : amountSpec;
                paid += amount;
                const receipt = await nextCode(db, 'receipt_number_seq', 'RCT-', 4);
                await db.query(
                    `insert into payments (code, invoice_id, order_id, customer_id, amount, method, reference, paid_on,
                                           tithe_percent, tithe_amount, received_by)
                     values ($1, $2, $3, $4, $5, $6, $7, $8, 10, $9, $10)`,
                    [receipt, invoice.id, order.id, customerIds[customerIndex], amount, method,
                        method === 'Cash' ? null : `QX${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                        addDays(today, -daysAgo), Math.round(amount * 0.1), admin.id],
                );
            }
            await db.query(
                `update invoices set status = case when $2 >= amount then 'Paid' when $2 > 0 then 'Partially paid' else 'Unpaid' end where id = $1`,
                [invoice.id, paid],
            );
        }

        for (const [offset, category, description, vendor, method, amount, status] of EXPENSES) {
            await db.query(
                `insert into expenses (spent_on, category, description, vendor, method, amount, status, created_by)
                 values ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [addDays(today, offset), category, description, vendor, method, amount, status, admin.id],
            );
        }
    });

    const { rows: [summary] } = await query(
        `select (select count(*) from inventory_items) as items, (select count(*) from customers) as customers,
                (select count(*) from orders) as orders, (select count(*) from invoices) as invoices,
                (select count(*) from payments) as payments, (select count(*) from expenses) as expenses,
                (select count(*) from staff) as staff`,
    );
    console.log('Seeded:', summary);
}

seed()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
