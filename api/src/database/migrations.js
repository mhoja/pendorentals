import { pool } from '../config/db.js';

// Append new migrations to the end; never edit one that has shipped.
const migrations = [
    {
        id: 1,
        name: 'initial schema',
        sql: `
            create table staff (
                id serial primary key,
                first_name text not null,
                last_name text not null,
                phone text not null unique,
                email text,
                role text not null check (role in ('Admin', 'Store manager', 'Inventory staff', 'Delivery staff')),
                status text not null default 'Active' check (status in ('Active', 'Invited', 'Inactive')),
                password_hash text,
                last_active_at timestamptz,
                created_at timestamptz not null default now()
            );

            create table customers (
                id serial primary key,
                first_name text not null,
                last_name text not null,
                phone text not null unique,
                email text,
                area text,
                place text,
                notes text,
                password_hash text,
                created_at timestamptz not null default now()
            );

            create table sessions (
                token_hash text primary key,
                kind text not null check (kind in ('staff', 'customer')),
                subject_id integer not null,
                expires_at timestamptz not null,
                created_at timestamptz not null default now()
            );
            create index sessions_expires_idx on sessions (expires_at);

            create table inventory_items (
                id uuid primary key default gen_random_uuid(),
                sku text not null unique,
                name text not null,
                category text not null,
                rate integer not null check (rate >= 0),
                quantity integer not null check (quantity >= 0),
                status text not null default 'Available' check (status in ('Available', 'Maintenance')),
                created_at timestamptz not null default now(),
                updated_at timestamptz not null default now()
            );

            create sequence order_number_seq start 1050;
            create table orders (
                id serial primary key,
                code text not null unique,
                customer_id integer not null references customers (id),
                status text not null default 'New request'
                    check (status in ('New request', 'Confirmed', 'Ready for pickup', 'Out for delivery', 'Completed', 'Cancelled')),
                event_date date not null,
                days integer not null check (days between 1 and 60),
                area text,
                place text,
                notes text,
                delivery_required boolean not null default false,
                delivery_fee integer not null default 0 check (delivery_fee >= 0),
                delivery_status text not null default 'Not needed'
                    check (delivery_status in ('Not needed', 'Scheduled', 'In transit', 'Delivered', 'Failed')),
                driver_id integer references staff (id) on delete set null,
                discount integer not null default 0 check (discount >= 0),
                source text not null default 'staff' check (source in ('staff', 'rent_now')),
                created_by integer references staff (id) on delete set null,
                created_at timestamptz not null default now(),
                updated_at timestamptz not null default now()
            );
            create index orders_customer_idx on orders (customer_id);
            create index orders_event_idx on orders (event_date);

            create table order_items (
                id serial primary key,
                order_id integer not null references orders (id) on delete cascade,
                inventory_item_id uuid references inventory_items (id) on delete set null,
                name text not null,
                custom text,
                quantity integer not null check (quantity > 0),
                rate integer check (rate >= 0),
                position integer not null default 0
            );
            create index order_items_order_idx on order_items (order_id);

            create sequence invoice_number_seq start 126;
            create table invoices (
                id serial primary key,
                code text not null unique,
                order_id integer references orders (id) on delete set null,
                customer_id integer not null references customers (id),
                issued_on date not null default current_date,
                due_on date not null,
                amount integer not null check (amount > 0),
                status text not null default 'Unpaid' check (status in ('Unpaid', 'Partially paid', 'Paid', 'Cancelled')),
                notes text,
                created_by integer references staff (id) on delete set null,
                created_at timestamptz not null default now()
            );

            create sequence receipt_number_seq start 159;
            create table payments (
                id serial primary key,
                code text not null unique,
                invoice_id integer references invoices (id) on delete set null,
                order_id integer references orders (id) on delete set null,
                customer_id integer not null references customers (id),
                amount integer not null check (amount > 0),
                method text not null check (method in ('M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Cash', 'Bank transfer', 'Card')),
                reference text,
                paid_on date not null default current_date,
                status text not null default 'Paid' check (status in ('Paid', 'Refunded')),
                tithe_percent numeric(5, 2) not null default 0,
                tithe_amount integer not null default 0,
                received_by integer references staff (id) on delete set null,
                created_at timestamptz not null default now()
            );
            create index payments_paid_on_idx on payments (paid_on);

            create table expenses (
                id serial primary key,
                spent_on date not null,
                category text not null,
                description text not null,
                vendor text,
                method text not null,
                amount integer not null check (amount > 0),
                status text not null default 'Approved' check (status in ('Approved', 'Pending')),
                created_by integer references staff (id) on delete set null,
                created_at timestamptz not null default now()
            );

            create table settings (
                key text primary key,
                value jsonb not null,
                updated_at timestamptz not null default now()
            );

            create table sms_log (
                id serial primary key,
                phone text not null,
                message text not null,
                kind text not null,
                status text not null,
                error text,
                provider_ref text,
                order_id integer references orders (id) on delete set null,
                created_at timestamptz not null default now()
            );
            create index sms_log_created_idx on sms_log (created_at desc);
        `,
    },
    {
        id: 2,
        name: 'inventory categories and dimensions',
        sql: `
            create table inventory_categories (
                id serial primary key,
                name text not null unique,
                dimensions jsonb not null default '[]'::jsonb,
                position integer not null default 0,
                created_at timestamptz not null default now()
            );

            insert into inventory_categories (name, position, dimensions) values
                ('Tents', 1, '[{"key":"length","label":"Length","unit":"m"},{"key":"width","label":"Width","unit":"m"},{"key":"height","label":"Height","unit":"m"},{"key":"capacity","label":"Capacity","unit":"guests"}]'),
                ('Chairs', 2, '[{"key":"seat_height","label":"Seat height","unit":"cm"}]'),
                ('Tables', 3, '[{"key":"length","label":"Length","unit":"cm"},{"key":"width","label":"Width","unit":"cm"},{"key":"seats","label":"Seats","unit":"people"}]'),
                ('Seat covers', 4, '[]'),
                ('Lighting', 5, '[{"key":"power","label":"Power","unit":"W"}]'),
                ('Carpets', 6, '[{"key":"length","label":"Length","unit":"m"},{"key":"width","label":"Width","unit":"m"}]'),
                ('Sound (PA & mics)', 7, '[{"key":"power","label":"Power","unit":"W"}]'),
                ('Screens & cameras', 8, '[{"key":"size","label":"Screen size","unit":"in"}]'),
                ('Light boxes', 9, '[{"key":"length","label":"Length","unit":"cm"},{"key":"height","label":"Height","unit":"cm"}]'),
                ('Utensils', 10, '[{"key":"capacity","label":"Capacity","unit":"L"}]'),
                ('Décor', 11, '[]'),
                ('Other', 12, '[]')
            on conflict (name) do nothing;

            -- Categories already used by items but missing from the list are added too.
            insert into inventory_categories (name, position)
            select distinct category, 100 from inventory_items
            where category not in (select name from inventory_categories);

            alter table inventory_items add column dimensions jsonb not null default '{}'::jsonb;
        `,
    },
    {
        id: 3,
        name: 'service areas',
        sql: `
            create table service_areas (
                id serial primary key,
                name text not null unique,
                position integer not null default 0,
                created_at timestamptz not null default now()
            );

            insert into service_areas (name, position) values
                ('Kayenze', 1), ('Geita Town', 2), ('Katoro', 3), ('Kalangalala', 4), ('Nyankumbu', 5), ('Nyarugusu', 6)
            on conflict (name) do nothing;

            -- Areas already used by customers or orders are kept in the list too.
            insert into service_areas (name, position)
            select distinct area, 100 from (select area from customers union select area from orders) used
            where area is not null and btrim(area) <> '' and area <> 'Other area'
              and area not in (select name from service_areas);
        `,
    },
];

export async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('select pg_advisory_lock(746211)');
        await client.query(`create table if not exists schema_migrations (
            id integer primary key, name text not null, applied_at timestamptz not null default now())`);
        const { rows } = await client.query('select id from schema_migrations');
        const applied = new Set(rows.map((row) => row.id));
        for (const migration of migrations) {
            if (applied.has(migration.id)) continue;
            await client.query('begin');
            try {
                await client.query(migration.sql);
                await client.query('insert into schema_migrations (id, name) values ($1, $2)', [migration.id, migration.name]);
                await client.query('commit');
                console.log(`Applied migration ${migration.id}: ${migration.name}`);
            } catch (error) {
                await client.query('rollback');
                throw error;
            }
        }
    } finally {
        await client.query('select pg_advisory_unlock(746211)').catch(() => {});
        client.release();
    }
}
