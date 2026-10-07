import { query } from '../config/db.js';
import { STAFF_ROLES, hashPassword, newTemporaryPassword } from '../services/auth.service.js';
import { HttpError, cleanText, isEmail, isPhone, normalizePhone, prettyPhone } from '../utils/helpers.js';
import { getSettings } from '../services/settings.service.js';
import { sendSms } from '../services/sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

const shape = (row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    phone: prettyPhone(row.phone),
    email: row.email || '',
    role: row.role,
    status: row.status,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
});

// GET /api/team
export async function listTeam(_request, response) {
    const [{ rows: staff }, { rows: [customers] }] = await Promise.all([
        query('select * from staff order by created_at'),
        query('select count(*) as n from customers'),
    ]);
    response.json({ team: staff.map(shape), customerCount: customers.n, roles: STAFF_ROLES });
}

// POST /api/team
export async function inviteMember(request, response) {
    const body = request.body || {};
    const fields = {};
    const firstName = cleanText(body.firstName, 40);
    const lastName = cleanText(body.lastName, 40);
    const phone = normalizePhone(body.phone);
    const email = cleanText(body.email, 120) || null;
    if (!firstName) fields.firstName = 'Enter a first name.';
    if (!lastName) fields.lastName = 'Enter a last name.';
    if (!isPhone(phone)) fields.phone = 'Enter a valid phone number.';
    if (email && !isEmail(email)) fields.email = 'Enter a valid email.';
    if (!STAFF_ROLES.includes(body.role)) fields.role = 'Choose a role.';
    if (Object.keys(fields).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields });
    const { rows: taken } = await query('select 1 from staff where phone = $1', [phone]);
    if (taken.length) throw new HttpError(409, 'This number is already on the team.', { fields: { phone: 'Already on the team.' } });

    const password = newTemporaryPassword();
    const { rows: [member] } = await query(
        `insert into staff (first_name, last_name, phone, email, role, status, password_hash)
         values ($1, $2, $3, $4, $5, 'Invited', $6) returning *`,
        [firstName, lastName, phone, email, body.role, hashPassword(password)],
    );
    const settings = await getSettings();
    const sms = await sendSms(phone, `Hi ${firstName}, you've been added to the ${settings.businessName} team as ${body.role}. Sign in at ${publicUrl} - Username: ${phone}, Password: ${password}. Please change your password after signing in.`, { kind: 'staff_invite', secret: password });
    response.status(201).json({ member: shape(member), sms: { status: sms.status }, temporaryPassword: sms.status !== 'sent' ? password : undefined });
}

// PATCH /api/team/:id
export async function updateMember(request, response) {
    const id = Number(request.params.id);
    const body = request.body || {};
    if (id === request.user.id && (body.role || body.status)) throw new HttpError(400, 'You cannot change your own role or status.');
    const updates = {};
    if (body.role !== undefined) {
        if (!STAFF_ROLES.includes(body.role)) throw new HttpError(400, 'Choose a role.');
        updates.role = body.role;
    }
    if (body.status !== undefined) {
        if (!['Active', 'Inactive'].includes(body.status)) throw new HttpError(400, 'Unknown status.');
        updates.status = body.status;
    }
    let password = null;
    if (body.resetPassword === true) {
        password = newTemporaryPassword();
        updates.password_hash = hashPassword(password);
    }
    const keys = Object.keys(updates);
    if (!keys.length) throw new HttpError(400, 'Nothing to update.');
    const { rows: [member] } = await query(`update staff set ${keys.map((key, index) => `${key} = $${index + 2}`).join(', ')} where id = $1 returning *`, [id, ...keys.map((key) => updates[key])]);
    if (!member) throw new HttpError(404, 'Team member not found.');
    if (updates.status === 'Inactive' || password) await query("delete from sessions where kind = 'staff' and subject_id = $1", [id]);
    let sms = null;
    if (password) {
        const settings = await getSettings();
        sms = await sendSms(member.phone, `Hi ${member.first_name}, your ${settings.businessName} password was reset. Username: ${member.phone}, Password: ${password}. Sign in at ${publicUrl}`, { kind: 'staff_invite', secret: password });
    }
    response.json({ member: shape(member), sms: sms && { status: sms.status }, temporaryPassword: password && sms?.status !== 'sent' ? password : undefined });
}

// DELETE /api/team/:id
export async function removeMember(request, response) {
    const id = Number(request.params.id);
    if (id === request.user.id) throw new HttpError(400, 'You cannot remove yourself.');
    const { rowCount } = await query('delete from staff where id = $1', [id]);
    if (!rowCount) throw new HttpError(404, 'Team member not found.');
    await query("delete from sessions where kind = 'staff' and subject_id = $1", [id]);
    response.json({ ok: true });
}
