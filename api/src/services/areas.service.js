import { query } from '../config/db.js';

// "Other area" is not stored: it means the customer types the place themselves.
export const OTHER_AREA = 'Other area';

export async function listAreas(db = { query }) {
    const { rows } = await db.query(
        `select a.id, a.name,
                (select count(*) from customers c where c.area = a.name)::int as customer_count,
                (select count(*) from orders o where o.area = a.name)::int as order_count
           from service_areas a order by a.position, a.name`,
    );
    return rows.map((row) => ({ id: row.id, name: row.name, customerCount: row.customer_count, orderCount: row.order_count }));
}

export async function isKnownArea(name, db = { query }) {
    if (name === OTHER_AREA) return true;
    const { rows } = await db.query('select 1 from service_areas where name = $1', [name]);
    return rows.length > 0;
}
