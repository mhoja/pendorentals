import { query, transaction } from '../config/db.js';
import { HttpError, cleanText } from '../utils/helpers.js';
import { OTHER_AREA, listAreas } from '../services/areas.service.js';
import { getSettings, saveSettings } from '../services/settings.service.js';

const findById = async (id) => (await listAreas()).find((area) => area.id === id);

function cleanName(raw) {
    const name = cleanText(raw, 40);
    if (name.length < 2) throw new HttpError(400, 'Enter an area name.', { fields: { name: 'Enter an area name.' } });
    if (name.toLowerCase() === OTHER_AREA.toLowerCase()) throw new HttpError(400, '“Other area” is built in.', { fields: { name: 'Choose another name.' } });
    return name;
}

// GET /api/areas — public, Rent Now uses it too.
export async function listServiceAreas(_request, response) {
    response.json({ areas: await listAreas(), other: OTHER_AREA });
}

// POST /api/areas
export async function createServiceArea(request, response) {
    const name = cleanName(request.body?.name);
    const { rows: taken } = await query('select 1 from service_areas where lower(name) = lower($1)', [name]);
    if (taken.length) throw new HttpError(409, `“${name}” already exists.`, { fields: { name: 'Already exists.' } });
    const { rows: [row] } = await query(
        `insert into service_areas (name, position)
         values ($1, (select coalesce(max(position), 0) + 1 from service_areas)) returning id`,
        [name],
    );
    response.status(201).json({ area: await findById(row.id) });
}

// PATCH /api/areas/:id — renaming also updates customers, orders and the free-delivery setting.
export async function updateServiceArea(request, response) {
    const id = Number(request.params.id);
    const current = await findById(id);
    if (!current) throw new HttpError(404, 'Area not found.');
    const name = cleanName(request.body?.name);
    if (name.toLowerCase() !== current.name.toLowerCase()) {
        const { rows: taken } = await query('select 1 from service_areas where lower(name) = lower($1) and id <> $2', [name, id]);
        if (taken.length) throw new HttpError(409, `“${name}” already exists.`, { fields: { name: 'Already exists.' } });
    }
    if (name !== current.name) {
        await transaction(async (db) => {
            await db.query('update service_areas set name = $2 where id = $1', [id, name]);
            await db.query('update customers set area = $2 where area = $1', [current.name, name]);
            await db.query('update orders set area = $2 where area = $1', [current.name, name]);
        });
        const settings = await getSettings();
        if (settings.freeDeliveryArea === current.name) await saveSettings({ freeDeliveryArea: name });
    }
    response.json({ area: await findById(id) });
}

// DELETE /api/areas/:id — past customers and orders keep the name; it just leaves the list.
export async function deleteServiceArea(request, response) {
    const current = await findById(Number(request.params.id));
    if (!current) throw new HttpError(404, 'Area not found.');
    await query('delete from service_areas where id = $1', [current.id]);
    const settings = await getSettings();
    if (settings.freeDeliveryArea === current.name) await saveSettings({ freeDeliveryArea: 'No free area' });
    response.json({ ok: true });
}
