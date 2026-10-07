import { query } from '../config/db.js';
import { createSession, destroySession, hashPassword, newTemporaryPassword, verifyPassword } from '../services/auth.service.js';
import { HttpError, greetName, isPhone, normalizePhone, prettyPhone } from '../utils/helpers.js';
import { permissionsFor } from '../services/permissions.service.js';
import { getSettings } from '../services/settings.service.js';
import { getGatewayState, sendSms, smsConfigured } from '../services/sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

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

// POST /api/auth/forgot-password — sets a new password and sends it to the account's phone by SMS.
// The answer is the same whether or not the number has an account, so it can't be used to find accounts.
// The password only changes once the SMS has gone out, so nobody is locked out by a failed SMS.
export async function forgotPassword(request, response) {
    const phone = normalizePhone(request.body?.phone);
    if (!isPhone(phone)) throw new HttpError(400, 'Enter the phone number you sign in with, e.g. 0712 345 678.', { fields: { phone: 'Enter a valid phone number.' } });
    const settings = await getSettings();
    if (!smsConfigured() || !(await getGatewayState()).connected) {
        throw new HttpError(503, `We can’t send SMS right now. Call ${settings.businessName} on ${settings.phone} to reset your password.`);
    }
    const done = { ok: true, message: `If ${prettyPhone(phone)} has an account, a new password has been sent to it by SMS.` };

    const { rows: [staff] } = await query("select id, first_name, 'staff' as kind from staff where phone = $1 and status <> 'Inactive'", [phone]);
    const { rows: [customer] } = staff ? { rows: [] } : await query("select id, first_name, 'customer' as kind from customers where phone = $1 and password_hash is not null", [phone]);
    const account = staff || customer;
    if (!account) {
        response.json(done);
        return;
    }
    // One reset SMS per number every 5 minutes.
    const { rows: [recent] } = await query(
        "select 1 from sms_log where phone = $1 and kind = 'password_reset' and status = 'sent' and created_at > now() - interval '5 minutes' limit 1",
        [phone],
    );
    if (recent) {
        response.json(done);
        return;
    }

    const password = newTemporaryPassword();
    const message = settings.smsLanguage === 'sw'
        ? `Habari ${greetName(account.first_name)}, nenosiri lako la ${settings.businessName} limebadilishwa. Namba: ${phone}, Nenosiri jipya: ${password}. Ingia ${publicUrl} kisha libadilishe. Hukuomba? Piga ${settings.phone}.`
        : `Hi ${greetName(account.first_name)}, your ${settings.businessName} password was reset. Username: ${phone}, New password: ${password}. Sign in at ${publicUrl} and change it. Didn't ask for this? Call ${settings.phone}.`;
    const sms = await sendSms(phone, message, { kind: 'password_reset', secret: password });
    if (sms.status !== 'sent') {
        throw new HttpError(502, `We couldn’t send the SMS just now. Please try again, or call ${settings.phone}.`);
    }
    const table = account.kind === 'staff' ? 'staff' : 'customers';
    await query(`update ${table} set password_hash = $1 where id = $2`, [hashPassword(password), account.id]);
    // Sign out everywhere; the new password is needed to get back in.
    await query('delete from sessions where kind = $1 and subject_id = $2', [account.kind, account.id]);
    response.json(done);
}
