import crypto from 'node:crypto';

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

export function safeEqual(a, b) {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function newTemporaryPassword() {
    return String(crypto.randomInt(100000, 1000000));
}

export function newToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
