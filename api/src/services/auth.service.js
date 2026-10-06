import crypto from 'node:crypto';
import { query } from '../config/db.js';

const SESSION_DAYS = 30;

export const STAFF_ROLES = ['Admin', 'Store manager', 'Inventory staff', 'Delivery staff'];

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 32).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
    if (!stored) return false;
    const [salt, hash] = stored.split(':');
    const candidate = crypto.scryptSync(password, salt, 32);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export const newTemporaryPassword = () => String(crypto.randomInt(100000, 1000000));
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export async function createSession(db, kind, subject) {
    const token = crypto.randomBytes(32).toString('hex');
    await db.query('delete from sessions where expires_at < now()');
    await db.query(
        `insert into sessions (token_hash, kind, subject_id, expires_at) values ($1, $2, $3, now() + interval '${SESSION_DAYS} days')`,
        [hashToken(token), kind, subject.id],
    );
    return {
        token,
        role: kind === 'staff' ? 'staff' : 'customer',
        staffRole: kind === 'staff' ? subject.role : undefined,
        phone: subject.phone,
        name: `${subject.first_name} ${subject.last_name}`,
        id: subject.id,
    };
}

export async function destroySession(tokenHash) {
    await query('delete from sessions where token_hash = $1', [tokenHash]);
}

// Shorthand role group used by routes and controllers.
export const MANAGERS = ['Admin', 'Store manager'];
