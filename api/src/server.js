import 'dotenv/config';
import express from 'express';
import { read, update } from './store.js';
import { sendSms, smsConfigured } from './sms.js';
import { hashPassword, hashToken, newTemporaryPassword, newToken, safeEqual, verifyPassword } from './auth.js';

const app = express();
const port = Number(process.env.PORT) || 5001;
const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';
const supportPhone = process.env.SUPPORT_PHONE || '0622 882 278';
const staff = {
    phone: process.env.STAFF_PHONE || '0622882278',
    password: process.env.STAFF_PASSWORD || '12345',
    name: process.env.STAFF_NAME || 'Pendo Mbolela',
};
const SESSION_DAYS = 30;

const CATALOG = [
    'Tents', 'Chairs', 'Tables', 'Seat covers', 'Lights', 'Red carpet', 'Carpet',
    'PA system', 'Microphone', 'LED screen', 'Camera', 'Light box', 'Utensils (cooking vessels)',
];
const AREAS = ['Kayenze', 'Geita Town', 'Katoro', 'Kalangalala', 'Nyankumbu', 'Nyarugusu', 'Other area'];

app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '20kb' }));

// ---- helpers ----
function normalizePhone(value) {
    const digits = String(value || '').replace(/[^\d+]/g, '');
    if (digits.startsWith('+255')) return `0${digits.slice(4)}`;
    if (digits.startsWith('255') && digits.length === 12) return `0${digits.slice(3)}`;
    return digits;
}

const prettyPhone = (phone) => phone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
const cleanText = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const todayIso = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10); // East Africa Time

function rateLimiter(limit, windowMs) {
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
        next();
    };
}

async function createSession(data, role, phone, name) {
    const token = newToken();
    const now = Date.now();
    data.sessions = data.sessions.filter((session) => session.expiresAt > now);
    data.sessions.push({ tokenHash: hashToken(token), role, phone, name, expiresAt: now + SESSION_DAYS * 86400000 });
    return { token, role, phone, name };
}

async function authenticate(request, response, next) {
    const token = (request.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) {
        response.status(401).json({ error: 'Please sign in.' });
        return;
    }
    const data = await read();
    const session = data.sessions.find((item) => item.tokenHash === hashToken(token) && item.expiresAt > Date.now());
    if (!session) {
        response.status(401).json({ error: 'Your session has expired. Please sign in again.' });
        return;
    }
    request.session = session;
    request.tokenHash = hashToken(token);
    next();
}

const requireRole = (role) => (request, response, next) => {
    if (request.session.role !== role) {
        response.status(403).json({ error: 'You do not have access to this.' });
        return;
    }
    next();
};

function itemsSummary(items) {
    const parts = items.map((item) => `${item.custom || item.name.replace(' (cooking vessels)', '')} x${item.quantity}`);
    return parts.length > 4 ? `${parts.slice(0, 4).join(', ')} +${parts.length - 4} more` : parts.join(', ');
}

function formatDate(iso) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function buildSms({ firstName, order, isNew, temporaryPassword }) {
    const place = order.place ? `${order.place}, ${order.area}` : order.area;
    const login = isNew
        ? `Track it at ${publicUrl} - Username: ${order.customerPhone}, Password: ${temporaryPassword}.`
        : `Track it at ${publicUrl} with your phone number.`;
    return `Hi ${firstName}, thank you for choosing Pendo Rentals! We received your request ${order.id}: ${itemsSummary(order.items)}. Event: ${formatDate(order.eventDate)} (${order.days} day${order.days === 1 ? '' : 's'}) at ${place}. We will call you to confirm the price. ${login} Help: ${supportPhone}`;
}

function validateRequest(body) {
    const errors = {};
    const firstName = cleanText(body.firstName, 40);
    const lastName = cleanText(body.lastName, 40);
    const phone = normalizePhone(body.phone);
    const area = cleanText(body.area, 40);
    const place = cleanText(body.place, 80);
    const notes = cleanText(body.notes, 300);
    const eventDate = String(body.eventDate || '');
    const days = Number(body.days);

    if (!firstName) errors.firstName = 'Enter your first name.';
    if (!lastName) errors.lastName = 'Enter your last name.';
    if (!/^0[67]\d{8}$/.test(phone)) errors.phone = 'Enter a valid phone number, e.g. 0712 345 678.';
    if (!AREAS.includes(area)) errors.area = 'Choose your area.';
    if (area === 'Other area' && !place) errors.place = 'Tell us where the event is.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(Date.parse(eventDate))) errors.eventDate = 'Choose the event date.';
    else if (eventDate < todayIso()) errors.eventDate = 'The event date cannot be in the past.';
    if (!Number.isInteger(days) || days < 1 || days > 30) errors.days = 'Choose between 1 and 30 days.';

    const items = [];
    for (const raw of (Array.isArray(body.items) ? body.items : []).slice(0, 30)) {
        const quantity = Number(raw?.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) continue;
        if (raw?.name === 'Other') {
            const custom = cleanText(raw.custom, 60);
            if (custom.length < 2) {
                errors.items = 'Tell us which item you need for “Other”.';
                continue;
            }
            if (!items.some((item) => item.custom?.toLowerCase() === custom.toLowerCase())) items.push({ name: 'Other', custom, quantity });
            continue;
        }
        const name = CATALOG.find((entry) => entry === raw?.name);
        if (name && !items.some((item) => item.name === name)) items.push({ name, quantity });
    }
    if (items.length === 0 && !errors.items) errors.items = 'Choose at least one item to rent.';

    return { errors, value: { firstName, lastName, phone, area, place, notes, eventDate, days, items } };
}

const publicOrder = (order) => ({
    id: order.id,
    status: order.status,
    items: order.items,
    eventDate: order.eventDate,
    days: order.days,
    area: order.area,
    place: order.place,
    notes: order.notes,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    createdAt: order.createdAt,
    sms: order.sms?.status,
});

// ---- routes ----
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});

app.post('/api/rental-requests', rateLimiter(8, 15 * 60 * 1000), async (request, response) => {
    const { errors, value } = validateRequest(request.body || {});
    if (Object.keys(errors).length) {
        response.status(400).json({ error: 'Please check the highlighted fields.', fields: errors });
        return;
    }

    try {
        const { order, isNew, temporaryPassword, session } = await update(async (data) => {
            const now = new Date().toISOString();
            let customer = data.customers.find((item) => item.phone === value.phone);
            let password = null;
            if (!customer) {
                password = newTemporaryPassword();
                customer = {
                    phone: value.phone,
                    firstName: value.firstName,
                    lastName: value.lastName,
                    area: value.area,
                    place: value.place,
                    passwordHash: hashPassword(password),
                    createdAt: now,
                };
                data.customers.push(customer);
            }
            const newOrder = {
                id: `ORD-${data.nextOrderNumber++}`,
                customerPhone: value.phone,
                customerName: `${value.firstName} ${value.lastName}`,
                items: value.items,
                eventDate: value.eventDate,
                days: value.days,
                area: value.area,
                place: value.place,
                notes: value.notes,
                status: 'New request',
                createdAt: now,
                sms: { status: 'pending' },
            };
            data.orders.push(newOrder);
            const created = await createSession(data, 'customer', value.phone, `${customer.firstName} ${customer.lastName}`);
            return { order: newOrder, isNew: Boolean(password), temporaryPassword: password, session: created };
        });

        const sms = await sendSms(value.phone, buildSms({ firstName: value.firstName, order, isNew, temporaryPassword }));
        await update((data) => {
            const stored = data.orders.find((item) => item.id === order.id);
            if (stored) stored.sms = { status: sms.status, error: sms.error, requestId: sms.requestId, at: new Date().toISOString() };
        });
        if (sms.status === 'failed') console.error(`SMS for ${order.id} failed: ${sms.error}`);

        response.status(201).json({
            order: publicOrder({ ...order, sms }),
            account: {
                phone: prettyPhone(value.phone),
                isNew,
                // Only shown on screen when the SMS could not deliver the password.
                temporaryPassword: isNew && sms.status !== 'sent' ? temporaryPassword : undefined,
            },
            sms: { status: sms.status },
            session,
        });
    } catch (error) {
        console.error('Failed to save rental request', error);
        response.status(500).json({ error: 'We could not save your request. Please try again or call us.' });
    }
});

app.post('/api/auth/login', rateLimiter(10, 15 * 60 * 1000), async (request, response) => {
    const phone = normalizePhone(request.body?.phone);
    const password = String(request.body?.password || '');
    if (!phone || !password) {
        response.status(400).json({ error: 'Enter your phone number and password.' });
        return;
    }

    if (safeEqual(phone, staff.phone) && safeEqual(password, staff.password)) {
        const session = await update((data) => createSession(data, 'staff', phone, staff.name));
        response.json(session);
        return;
    }

    const data = await read();
    const customer = data.customers.find((item) => item.phone === phone);
    if (!customer || !verifyPassword(password, customer.passwordHash)) {
        response.status(401).json({ error: 'Incorrect phone number or password. Please try again.' });
        return;
    }
    const session = await update((store) => createSession(store, 'customer', phone, `${customer.firstName} ${customer.lastName}`));
    response.json(session);
});

app.get('/api/me', authenticate, (request, response) => {
    const { role, phone, name } = request.session;
    response.json({ role, phone, name });
});

app.post('/api/auth/logout', authenticate, async (request, response) => {
    await update((data) => {
        data.sessions = data.sessions.filter((session) => session.tokenHash !== request.tokenHash);
    });
    response.json({ ok: true });
});

app.get('/api/my/orders', authenticate, requireRole('customer'), async (request, response) => {
    const data = await read();
    const customer = data.customers.find((item) => item.phone === request.session.phone);
    const orders = data.orders
        .filter((order) => order.customerPhone === request.session.phone)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(publicOrder);
    response.json({
        customer: customer && { firstName: customer.firstName, lastName: customer.lastName, phone: prettyPhone(customer.phone), area: customer.area, place: customer.place },
        orders,
    });
});

app.get('/api/orders', authenticate, requireRole('staff'), async (_request, response) => {
    const data = await read();
    response.json({
        orders: [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicOrder),
        smsConfigured: smsConfigured(),
    });
});

app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') {
        response.status(400).json({ error: 'Invalid request.' });
        return;
    }
    console.error(error);
    response.status(500).json({ error: 'Something went wrong.' });
});

app.listen(port, () => {
    console.log(`API listening on http://localhost:${port} (SMS ${smsConfigured() ? 'enabled' : 'not configured'})`);
});
