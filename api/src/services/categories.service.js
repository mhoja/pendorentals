import { query } from '../config/db.js';
import { HttpError, cleanText } from '../utils/helpers.js';

export const DIMENSION_UNITS = ['m', 'cm', 'mm', 'ft', 'in', 'kg', 'L', 'W', 'guests', 'people', 'seats', 'pcs'];

export async function listCategories(db = { query }) {
    const { rows } = await db.query(
        `select c.*, (select count(*) from inventory_items i where i.category = c.name) as item_count
           from inventory_categories c order by c.position, c.name`,
    );
    return rows.map((row) => ({ id: row.id, name: row.name, dimensions: row.dimensions, itemCount: row.item_count }));
}

export async function findCategory(name, db = { query }) {
    const { rows } = await db.query('select * from inventory_categories where name = $1', [name]);
    return rows[0] || null;
}

const toKey = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);

// Validates the list of dimension fields a category offers.
export function validateDimensionFields(raw) {
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw) || raw.length > 8) throw new HttpError(400, 'A category can have up to 8 dimension fields.');
    const fields = [];
    for (const entry of raw) {
        const label = cleanText(entry?.label, 30);
        if (!label) throw new HttpError(400, 'Each dimension needs a name, e.g. Length.');
        const unit = DIMENSION_UNITS.includes(entry?.unit) ? entry.unit : '';
        const key = toKey(entry?.key || label) || `field_${fields.length + 1}`;
        if (fields.some((field) => field.key === key)) throw new HttpError(400, `“${label}” is listed twice.`);
        fields.push({ key, label, unit });
    }
    return fields;
}

// Validates an item's dimension values against its category's fields. All values are optional.
export function validateDimensionValues(raw, category) {
    if (raw === undefined || raw === null) return {};
    if (typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, 'Dimensions must be a set of values.');
    const values = {};
    for (const field of category?.dimensions || []) {
        const value = raw[field.key];
        if (value === undefined || value === null || value === '') continue;
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0 || number > 1e7) throw new HttpError(400, `${field.label} must be a positive number.`);
        values[field.key] = Math.round(number * 100) / 100;
    }
    return values;
}
