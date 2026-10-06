import { query } from '../config/db.js';
import { hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { HttpError, cleanText, isEmail, isPhone, normalizePhone, prettyPhone } from '../utils/helpers.js';
import { getSettings } from '../services/settings.service.js';
import { sendSms } from '../services/sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

const CUSTOMER_SELECT = `
    select c.*,
           count(distinct o.id) filter (where o.status <> 'Cancelled') as order_count,
           max(o.event_date) as last_order,
           coalesce((select sum(p.amount) from payments p where p.customer_id = c.id and p.status = 'Paid'), 0) as spent
      from customers c
      left join orders o on o.customer_id = c.id`;

const shape = (row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    phone: prettyPhone(row.phone),
    email: row.email || '',
    area: row.area || '',
    place: row.place || '',
    notes: row.notes || '',
    orders: row.order_count,
    lastOrder: row.last_order,
    spent: row.spent,
    hasLogin: Boolean(row.password_hash),
    createdAt: row.created_at,
});

function validate(body, { partial }) {
    const value = {};
    const fields = {};
    const has = (key) => !partial || body[key] !== undefined;
    if (has('firstName')) { value.first_name = cleanText(body.firstName, 40); if (!value.first_name) fields.firstName = 'Enter a first name.'; }
    if (has('lastName')) { value.last_name = cleanText(body.lastName, 40); if (!value.last_name) fields.lastName = 'Enter a last name.'; }
    if (has('phone')) { value.phone = normalizePhone(body.phone); if (!isPhone(value.phone)) fields.phone = 'Enter a valid phone number.'; }
    if (body.email !== undefined) { value.email = cleanText(body.email, 120) || null; if (value.email && !isEmail(value.email)) fields.email = 'Enter a valid email.'; }
    for (const [key, max] of [['area', 40], ['place', 80], ['notes', 500]]) {
        if (body[key] !== undefined) value[key] = cleanText(body[key], max) || null;
    }
    if (Object.keys(fields).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields });
    return value;
}

// GET /api/customers
export async function listCustomers(_request, response) {
    const { rows } = await query(`${CUSTOMER_SELECT} group by c.id order by c.created_at desc`);
    response.json({ customers: rows.map(shape) });
}

// POST /api/customers
export async function createCustomer(request, response) {
    const value = validate(request.body || {}, { partial: false });
    const { rows: existing } = await query('select 1 from customers where phone = $1', [value.phone]);
    if (existing.length) throw new HttpError(409, 'A customer with this phone number already exists.', { fields: { phone: 'Already registered.' } });
    const sendLogin = request.body?.sendLogin !== false;
    const password = sendLogin ? newTemporaryPassword() : null;
    const keys = [...Object.keys(value), 'password_hash'];
    const values = [...Object.values(value), password ? hashPassword(password) : null];
    const { rows: [inserted] } = await query(
        `insert into customers (${keys.join(', ')}) values (${keys.map((_, index) => `$${index + 1}`).join(', ')}) returning id`,
        values,
    );
    let sms = null;
    if (password) {
        const settings = await getSettings();
        sms = await sendSms(value.phone, `Karibu ${value.first_name}! Your ${settings.businessName} account is ready. Sign in at ${publicUrl} - Username: ${value.phone}, Password: ${password}. Help: ${settings.phone}`, { kind: 'customer_invite' });
    }
    const { rows: [row] } = await query(`${CUSTOMER_SELECT} where c.id = $1 group by c.id`, [inserted.id]);
    response.status(201).json({ customer: shape(row), sms: sms && { status: sms.status }, temporaryPassword: password && sms?.status !== 'sent' ? password : undefined });
}

// PATCH /api/customers/:id
export async function updateCustomer(request, response) {
    const id = Number(request.params.id);
    const value = validate(request.body || {}, { partial: true });
    if (value.phone) {
        const { rows } = await query('select 1 from customers where phone = $1 and id <> $2', [value.phone, id]);
        if (rows.length) throw new HttpError(409, 'Another customer already uses this phone number.', { fields: { phone: 'Already registered.' } });
    }
    const keys = Object.keys(value);
    if (!keys.length) throw new HttpError(400, 'Nothing to update.');
    const { rowCount } = await query(`update customers set ${keys.map((key, index) => `${key} = $${index + 2}`).join(', ')} where id = $1`, [id, ...keys.map((key) => value[key])]);
    if (!rowCount) throw new HttpError(404, 'Customer not found.');
    const { rows: [row] } = await query(`${CUSTOMER_SELECT} where c.id = $1 group by c.id`, [id]);
    response.json({ customer: shape(row) });
}

// DELETE /api/customers/:id
export async function deleteCustomer(request, response) {
    const id = Number(request.params.id);
    const { rows: [usage] } = await query('select (select count(*) from orders where customer_id = $1) + (select count(*) from payments where customer_id = $1) as n', [id]);
    if (usage.n > 0) throw new HttpError(409, 'This customer has orders or payments and cannot be deleted.');
    const { rowCount } = await query('delete from customers where id = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'Customer not found.');
    await query("delete from sessions where kind = 'customer' and subject_id = $1", [id]);
    response.json({ ok: true });
}
