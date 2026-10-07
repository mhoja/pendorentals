import { query } from '../config/db.js';
import { createSession, destroySession, hashPassword, verifyPassword } from '../services/auth.service.js';
import { HttpError, normalizePhone } from '../utils/helpers.js';
import { permissionsFor } from '../services/permissions.service.js';

// POST /api/auth/login
export async function login(request, response) {
    const phone = normalizePhone(request.body?.phone);
    const password = String(request.body?.password || '');
    if (!phone || !password) throw new HttpError(400, 'Enter your phone number and password.');

    const { rows: [staff] } = await query('select * from staff where phone = $1', [phone]);
    if (staff && verifyPassword(password, staff.password_hash)) {
        if (staff.status === 'Inactive') throw new HttpError(403, 'This account has been deactivated. Contact your admin.');
        await query(`update staff set last_active_at = now(), status = case when status = 'Invited' then 'Active' else status end where id = $1`, [staff.id]);
        response.json({ ...(await createSession({ query }, 'staff', staff)), permissions: await permissionsFor(staff.role) });
        return;
    }
    const { rows: [customer] } = await query('select * from customers where phone = $1', [phone]);
    if (customer && verifyPassword(password, customer.password_hash)) {
        response.json(await createSession({ query }, 'customer', customer));
        return;
    }
    throw new HttpError(401, 'Incorrect phone number or password. Please try again.');
}

// GET /api/me
export async function getCurrentUser(request, response) {
    const { kind, role, phone, name, id, permissions } = request.user;
    response.json({ role: kind === 'staff' ? 'staff' : 'customer', staffRole: role, phone, name, id, permissions });
}

// POST /api/auth/logout
export async function logout(request, response) {
    await destroySession(request.tokenHash);
    response.json({ ok: true });
}

// POST /api/me/password
export async function changePassword(request, response) {
    const current = String(request.body?.currentPassword || '');
    const next = String(request.body?.newPassword || '');
    if (next.length < 8) throw new HttpError(400, 'Use at least 8 characters for the new password.');
    const table = request.user.kind === 'staff' ? 'staff' : 'customers';
    const { rows: [account] } = await query(`select password_hash from ${table} where id = $1`, [request.user.id]);
    if (!verifyPassword(current, account?.password_hash)) throw new HttpError(400, 'Your current password is not correct.');
    await query(`update ${table} set password_hash = $1 where id = $2`, [hashPassword(next), request.user.id]);
    // Sign out other devices, keep this one.
    await query('delete from sessions where kind = $1 and subject_id = $2 and token_hash <> $3', [request.user.kind, request.user.id, request.tokenHash]);
    response.json({ ok: true });
}
