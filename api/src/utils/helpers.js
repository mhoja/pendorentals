export class HttpError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

// Express 4 does not catch rejected promises; route handlers go through this.
export const handle = (fn) => (request, response, next) => Promise.resolve(fn(request, response, next)).catch(next);

export function normalizePhone(value) {
    const digits = String(value || '').replace(/[^\d+]/g, '');
    if (digits.startsWith('+255')) return `0${digits.slice(4)}`;
    if (digits.startsWith('255') && digits.length === 12) return `0${digits.slice(3)}`;
    return digits;
}

export const isPhone = (phone) => /^0[67]\d{8}$/.test(phone);
export const prettyPhone = (phone) => String(phone || '').replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
export const cleanText = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value)) && !Number.isNaN(Date.parse(value));
export const isWhole = (value, min = 0, max = 1e12) => Number.isInteger(value) && value >= min && value <= max;

// East Africa Time (UTC+3), which has no daylight saving.
export const todayIso = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

export function addDays(iso, days) {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

export function formatDate(iso) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const formatTSh = (value) => `TSh ${Number(value || 0).toLocaleString('en-US')}`;

export function rateLimiter(limit, windowMs) {
    const hits = new Map();
    return (request, response, next) => {
        const now = Date.now();
        const recent = (hits.get(request.ip) || []).filter((time) => now - time < windowMs);
        if (recent.length >= limit) {
            response.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
            return;
        }
        recent.push(now);
        hits.set(request.ip, recent);
        if (hits.size > 5000) hits.clear();
        next();
    };
}

export function pick(body, fields) {
    return Object.fromEntries(fields.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field]]));
}
