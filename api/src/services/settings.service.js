import { query } from '../config/db.js';

export const DEFAULT_SETTINGS = {
    businessName: 'Pendo Rentals',
    tagline: 'Rent · Celebrate · Grow',
    businessType: 'Event & outdoor rentals',
    tin: '',
    phone: '0622 882 278',
    whatsapp: '0622 882 278',
    email: 'hello@pendooutdoors.com',
    address: 'Kayenze',
    region: 'Geita',
    weekdayOpen: '08:00',
    weekdayClose: '18:00',
    saturdayOpen: '09:00',
    saturdayClose: '16:00',
    sundayOpen: false,
    alertEmail: true,
    alertSms: true,
    alertNewBooking: true,
    alertPayment: true,
    alertLowStock: true,
    alertDailySummary: false,
    customerConfirm: true,
    customerReminders: true,
    reminderLead: '1 day before',
    customerDelivery: true,
    customerThanks: true,
    smsSender: 'PENDO',
    minDays: '1',
    depositPercent: '30',
    advanceDays: '180',
    lateFee: '10000',
    gracePeriod: '2',
    damagePolicy: 'Customers pay the repair or replacement cost for items returned damaged or missing.',
    freeCancelHours: '48',
    refundPercent: '50',
    deliveryFee: '15000',
    perKmFee: '1000',
    freeDeliveryArea: 'Kayenze',
    payMpesa: true,
    payTigo: true,
    payAirtel: true,
    payCash: true,
    payBank: true,
    payCard: false,
    lipaNumber: '',
    lipaName: 'Pendo Rentals',
    bankName: 'CRDB Bank',
    bankAccountName: 'Pendo Rentals',
    bankAccountNumber: '',
    vatEnabled: false,
    vatRate: '18',
    titheEnabled: true,
    tithePercent: '10',
    receiptPrefix: 'RCT-',
    invoicePrefix: 'INV-',
    receiptFooter: 'Thank you for renting with Pendo. Please keep this receipt for your records.',
    smsTemplates: {
        bookingConfirmed: 'Hi {firstName}, your Pendo Rentals booking {order} for {date} is confirmed. Total: {total}. Help: {phone}',
        outForDelivery: 'Hi {firstName}, your Pendo Rentals items for {order} are on the way to {place}. Help: {phone}',
        completed: 'Thank you {firstName} for renting with Pendo Rentals! We hope your event was a great one. {phone}',
        paymentReceived: 'Hi {firstName}, we received {amount} for {order}. Receipt {receipt}. Balance: {balance}. Asante! Pendo Rentals',
    },
};

export async function getSettings(db = { query }) {
    const { rows } = await db.query("select value from settings where key = 'workspace'");
    const stored = rows[0]?.value || {};
    return {
        ...DEFAULT_SETTINGS,
        ...stored,
        smsTemplates: { ...DEFAULT_SETTINGS.smsTemplates, ...(stored.smsTemplates || {}) },
    };
}

// Only keys that exist in the defaults, with the same type, are stored.
export function sanitizeSettings(input) {
    const clean = {};
    for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
        if (input?.[key] === undefined) continue;
        if (key === 'smsTemplates') {
            clean.smsTemplates = Object.fromEntries(
                Object.keys(DEFAULT_SETTINGS.smsTemplates)
                    .filter((name) => typeof input.smsTemplates?.[name] === 'string')
                    .map((name) => [name, input.smsTemplates[name].slice(0, 480)]),
            );
            continue;
        }
        if (typeof fallback === 'boolean') clean[key] = Boolean(input[key]);
        else clean[key] = String(input[key]).slice(0, 400);
    }
    return clean;
}

export async function saveSettings(values) {
    const current = await getSettings();
    const next = { ...current, ...sanitizeSettings(values) };
    next.smsTemplates = { ...current.smsTemplates, ...(sanitizeSettings(values).smsTemplates || {}) };
    await query(
        `insert into settings (key, value, updated_at) values ('workspace', $1, now())
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [next],
    );
    return next;
}

export function fillTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => (values[key] !== undefined ? String(values[key]) : match));
}
