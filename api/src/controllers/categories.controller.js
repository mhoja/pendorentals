import { query, transaction } from '../config/db.js';
import { HttpError, cleanText } from '../utils/helpers.js';
import { DIMENSION_UNITS, listCategories, validateDimensionFields } from '../services/categories.service.js';

const findById = async (id) => (await listCategories()).find((category) => category.id === id);

// GET /api/inventory-categories
export async function listInventoryCategories(_request, response) {
    response.json({ categories: await listCategories(), units: DIMENSION_UNITS });
}

// POST /api/inventory-categories
export async function createInventoryCategory(request, response) {
    const name = cleanText(request.body?.name, 40);
    if (name.length < 2) throw new HttpError(400, 'Enter a category name.', { fields: { name: 'Enter a category name.' } });
    const dimensions = validateDimensionFields(request.body?.dimensions) || [];
    const { rows: taken } = await query('select 1 from inventory_categories where lower(name) = lower($1)', [name]);
    if (taken.length) throw new HttpError(409, `“${name}” already exists.`, { fields: { name: 'Already exists.' } });
    const { rows: [row] } = await query(
        `insert into inventory_categories (name, dimensions, position)
         values ($1, $2, (select coalesce(max(position), 0) + 1 from inventory_categories)) returning id`,
        [name, JSON.stringify(dimensions)],
    );
    response.status(201).json({ category: await findById(row.id) });
}

// PATCH /api/inventory-categories/:id
export async function updateInventoryCategory(request, response) {
    const id = Number(request.params.id);
    const current = await findById(id);
    if (!current) throw new HttpError(404, 'Category not found.');
    const name = request.body?.name !== undefined ? cleanText(request.body.name, 40) : current.name;
    if (name.length < 2) throw new HttpError(400, 'Enter a category name.', { fields: { name: 'Enter a category name.' } });
    const dimensions = validateDimensionFields(request.body?.dimensions) ?? current.dimensions;
    if (name.toLowerCase() !== current.name.toLowerCase()) {
        const { rows: taken } = await query('select 1 from inventory_categories where lower(name) = lower($1) and id <> $2', [name, id]);
        if (taken.length) throw new HttpError(409, `“${name}” already exists.`, { fields: { name: 'Already exists.' } });
    }
    await transaction(async (db) => {
        await db.query('update inventory_categories set name = $2, dimensions = $3 where id = $1', [id, name, JSON.stringify(dimensions)]);
        // Items keep their category when it is renamed.
        if (name !== current.name) await db.query('update inventory_items set category = $2 where category = $1', [current.name, name]);
    });
    response.json({ category: await findById(id) });
}

// DELETE /api/inventory-categories/:id
export async function deleteInventoryCategory(request, response) {
    const current = await findById(Number(request.params.id));
    if (!current) throw new HttpError(404, 'Category not found.');
    if (current.itemCount > 0) {
        throw new HttpError(409, `${current.itemCount} item${current.itemCount === 1 ? ' uses' : 's use'} “${current.name}”. Move them to another category first.`);
    }
    await query('delete from inventory_categories where id = $1', [current.id]);
    response.json({ ok: true });
}
