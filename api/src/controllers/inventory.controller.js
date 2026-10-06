import { query, transaction } from '../config/db.js';
import { HttpError, cleanText } from '../utils/helpers.js';
import { listCategories, validateDimensionValues } from '../services/categories.service.js';

const shape = (row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    rate: row.rate,
    quantity: row.quantity,
    status: row.status,
    dimensions: row.dimensions || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

// `categories` is the list from the database; `currentCategory` is the item's category when editing.
function validate(raw, categories, { partial = false, currentCategory = null } = {}) {
    const errors = {};
    const value = {};
    const has = (key) => !partial || raw[key] !== undefined;
    if (has('name')) {
        value.name = cleanText(raw.name, 60);
        if (value.name.length < 2) errors.name = 'Enter the item name.';
    }
    if (has('category')) {
        value.category = categories.some((category) => category.name === raw.category) ? raw.category : '';
        if (!value.category) errors.category = 'Choose a category.';
    }
    if (raw.dimensions !== undefined) {
        const category = categories.find((entry) => entry.name === (value.category || currentCategory));
        try {
            value.dimensions = validateDimensionValues(raw.dimensions, category);
        } catch (error) {
            errors.dimensions = error.message;
        }
    }
    if (has('rate')) {
        value.rate = Number(raw.rate);
        if (!Number.isInteger(value.rate) || value.rate < 0 || value.rate > 100000000) errors.rate = 'Enter the daily rate in TSh.';
    }
    if (has('quantity')) {
        value.quantity = Number(raw.quantity);
        if (!Number.isInteger(value.quantity) || value.quantity < 0 || value.quantity > 1000000) errors.quantity = 'Enter how many you have.';
    }
    if (has('status')) value.status = ['Available', 'Maintenance'].includes(raw.status) ? raw.status : 'Available';
    if (raw.sku !== undefined && String(raw.sku).trim() !== '') {
        value.sku = String(raw.sku).trim().toUpperCase().slice(0, 20);
        if (!/^[A-Z0-9-]{2,20}$/.test(value.sku)) errors.sku = 'Use letters, numbers and dashes only.';
    }
    return { errors, value };
}

async function nextSku(db, category) {
    const prefix = category.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'ITM';
    const { rows } = await db.query("select sku from inventory_items where sku ~ '^[A-Z]{3}-[0-9]+$'");
    let number = rows.reduce((max, row) => Math.max(max, Number(row.sku.split('-')[1]) || 0), 1000) + 1;
    while (rows.some((row) => row.sku === `${prefix}-${number}`)) number += 1;
    return `${prefix}-${number}`;
}

// GET /api/inventory
export async function listInventory(_request, response) {
    const [{ rows }, categories] = await Promise.all([query('select * from inventory_items order by created_at desc, name'), listCategories()]);
    response.json({ items: rows.map(shape), categories });
}

// POST /api/inventory
export async function createInventoryItems(request, response) {
    const rows = Array.isArray(request.body?.items) ? request.body.items : [];
    if (rows.length === 0 || rows.length > 50) throw new HttpError(400, 'Add between 1 and 50 items at a time.');
    const categories = await listCategories();
    const checked = rows.map((row) => validate(row || {}, categories));
    const rowErrors = checked.map((row) => row.errors);
    if (rowErrors.some((errors) => Object.keys(errors).length)) {
        throw new HttpError(400, 'Please fix the highlighted rows.', { rows: rowErrors });
    }
    const created = await transaction(async (db) => {
        const items = [];
        for (const { value } of checked) {
            const sku = value.sku || await nextSku(db, value.category);
            const { rows: existing } = await db.query('select 1 from inventory_items where sku = $1', [sku]);
            if (existing.length) throw new HttpError(409, `SKU ${sku} is already used.`);
            const { rows: [item] } = await db.query(
                `insert into inventory_items (sku, name, category, rate, quantity, status, dimensions)
                 values ($1, $2, $3, $4, $5, $6, $7) returning *`,
                [sku, value.name, value.category, value.rate, value.quantity, value.status || 'Available', value.dimensions || {}],
            );
            items.push(shape(item));
        }
        return items;
    });
    response.status(201).json({ items: created });
}

// PATCH /api/inventory/:id
export async function updateInventoryItem(request, response) {
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) throw new HttpError(404, 'This item no longer exists.');
    const { rows: [existing] } = await query('select category from inventory_items where id = $1', [request.params.id]);
    if (!existing) throw new HttpError(404, 'This item no longer exists.');
    const body = request.body || {};
    // Changing category without new dimensions clears values that belonged to the old category.
    if (body.category && body.category !== existing.category && body.dimensions === undefined) body.dimensions = {};
    const { errors, value } = validate(body, await listCategories(), { partial: true, currentCategory: existing.category });
    if (Object.keys(errors).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields: errors });
    if (value.sku) {
        const { rows } = await query('select 1 from inventory_items where sku = $1 and id <> $2', [value.sku, request.params.id]);
        if (rows.length) throw new HttpError(409, `SKU ${value.sku} is already used.`);
    }
    const fields = Object.keys(value);
    if (fields.length === 0) throw new HttpError(400, 'Nothing to update.');
    const { rows: [item] } = await query(
        `update inventory_items set ${fields.map((field, index) => `${field} = $${index + 2}`).join(', ')}, updated_at = now()
          where id = $1 returning *`,
        [request.params.id, ...fields.map((field) => value[field])],
    );
    if (!item) throw new HttpError(404, 'This item no longer exists.');
    response.json({ item: shape(item) });
}

// DELETE /api/inventory/:id
export async function deleteInventoryItem(request, response) {
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) throw new HttpError(404, 'This item no longer exists.');
    const { rowCount } = await query('delete from inventory_items where id = $1', [request.params.id]);
    if (!rowCount) throw new HttpError(404, 'This item no longer exists.');
    response.json({ ok: true });
}
