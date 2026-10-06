import { query } from '../config/db.js';
import { HttpError, cleanText, isIsoDate, isWhole } from '../utils/helpers.js';

export const EXPENSE_CATEGORIES = ['Equipment maintenance', 'Delivery & transport', 'Supplies', 'Marketing', 'Rent & utilities', 'Salaries & wages', 'Other'];
const METHODS = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank transfer', 'Business card'];

const SELECT = `select e.*, s.first_name || ' ' || s.last_name as created_by_name from expenses e left join staff s on s.id = e.created_by`;
const shape = (row) => ({
    id: row.id,
    date: row.spent_on,
    category: row.category,
    description: row.description,
    vendor: row.vendor || '',
    method: row.method,
    amount: row.amount,
    status: row.status,
    createdBy: row.created_by_name || '—',
    createdAt: row.created_at,
});

function validate(body, { partial }) {
    const value = {};
    const fields = {};
    const has = (key) => !partial || body[key] !== undefined;
    if (has('date')) { if (!isIsoDate(body.date)) fields.date = 'Choose the date.'; else value.spent_on = body.date; }
    if (has('category')) { if (!EXPENSE_CATEGORIES.includes(body.category)) fields.category = 'Choose a category.'; else value.category = body.category; }
    if (has('description')) { value.description = cleanText(body.description, 120); if (value.description.length < 2) fields.description = 'Describe the expense.'; }
    if (body.vendor !== undefined) value.vendor = cleanText(body.vendor, 80) || null;
    if (has('method')) { if (!METHODS.includes(body.method)) fields.method = 'Choose how it was paid.'; else value.method = body.method; }
    if (has('amount')) { const amount = Number(body.amount); if (!isWhole(amount, 1, 1e10)) fields.amount = 'Enter the amount.'; else value.amount = amount; }
    if (body.status !== undefined) value.status = body.status === 'Pending' ? 'Pending' : 'Approved';
    if (Object.keys(fields).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields });
    return value;
}

// GET /api/expenses
export async function listExpenses(_request, response) {
    const { rows } = await query(`${SELECT} order by e.spent_on desc, e.id desc`);
    response.json({ expenses: rows.map(shape), categories: EXPENSE_CATEGORIES, methods: METHODS });
}

// POST /api/expenses
export async function createExpense(request, response) {
    const value = { ...validate(request.body || {}, { partial: false }), created_by: request.user.id };
    const keys = Object.keys(value);
    const { rows: [inserted] } = await query(
        `insert into expenses (${keys.join(', ')}) values (${keys.map((_, index) => `$${index + 1}`).join(', ')}) returning id`,
        keys.map((key) => value[key]),
    );
    const { rows: [row] } = await query(`${SELECT} where e.id = $1`, [inserted.id]);
    response.status(201).json({ expense: shape(row) });
}

// PATCH /api/expenses/:id
export async function updateExpense(request, response) {
    const id = Number(request.params.id);
    const value = validate(request.body || {}, { partial: true });
    const keys = Object.keys(value);
    if (!keys.length) throw new HttpError(400, 'Nothing to update.');
    const { rowCount } = await query(`update expenses set ${keys.map((key, index) => `${key} = $${index + 2}`).join(', ')} where id = $1`, [id, ...keys.map((key) => value[key])]);
    if (!rowCount) throw new HttpError(404, 'Expense not found.');
    const { rows: [row] } = await query(`${SELECT} where e.id = $1`, [id]);
    response.json({ expense: shape(row) });
}

// DELETE /api/expenses/:id
export async function deleteExpense(request, response) {
    const { rowCount } = await query('delete from expenses where id = $1', [Number(request.params.id)]);
    if (!rowCount) throw new HttpError(404, 'Expense not found.');
    response.json({ ok: true });
}
