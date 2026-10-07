import { query } from '../config/db.js';
import { HttpError } from '../utils/helpers.js';

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
    tigoNumber: '',
    tigoName: 'Pendo Rentals',
    airtelNumber: '',
    airtelName: 'Pendo Rentals',
    bankName: 'CRDB Bank',
    bankAccountName: 'Pendo Rentals',
    bankAccountNumber: '',
    vatEnabled: false,
    vatRate: '18',
    titheEnabled: true,
    tithePercent: '10',
    givingEnabled: false,
    givingPercent: '5',
    receiptPrefix: 'RCT-',
    invoicePrefix: 'INV-',
    receiptFooter: 'Thank you for renting with Pendo. Please keep this receipt for your records.',
    // Editable in Settings → Payments & receipts. Types: mobile (Lipa Namba), bank, cash, card, other.
    paymentMethods: [
        { id: 'mpesa', name: 'M-Pesa', type: 'mobile', provider: '', number: '', accountName: 'Pendo Rentals', enabled: true },
        { id: 'tigo', name: 'Tigo Pesa', type: 'mobile', provider: '', number: '', accountName: 'Pendo Rentals', enabled: true },
        { id: 'airtel', name: 'Airtel Money', type: 'mobile', provider: '', number: '', accountName: 'Pendo Rentals', enabled: true },
        { id: 'bank', name: 'Bank transfer', type: 'bank', provider: 'CRDB Bank', number: '', accountName: 'Pendo Rentals', enabled: true },
        { id: 'cash', name: 'Cash', type: 'cash', provider: '', number: '', accountName: '', enabled: true },
        { id: 'card', name: 'Card', type: 'card', provider: '', number: '', accountName: '', enabled: false },
    ],
    // Which language customer SMS go out in: 'en', 'sw' or 'both' (two messages, Kiswahili first).
    smsLanguage: 'en',
    smsTemplates: {
        bookingCreated: 'Hi {firstName}, {business} has created your booking {order} for {date} ({days}).\n{items}{priceNote}{login}\nHelp: {phone}',
        requestReceived: 'Hi {firstName}, thank you for choosing {business}! We received your request {order}:\n{itemList}\nEvent: {date} ({days}) at {place}. We will call you to confirm your booking.{login}\nHelp: {phone}',
        bookingConfirmed: 'Hi {firstName}, your Pendo Rentals booking {order} for {date} is confirmed.\n{items}\nHelp: {phone}',
        outForDelivery: 'Hi {firstName}, your Pendo Rentals items for {order} are on the way to {place}.\n{itemList}\nPlease check them on arrival. Help: {phone}',
        completed: 'Thank you {firstName} for renting with Pendo Rentals! We hope your event was a great one. {phone}',
        paymentReceived: 'Hi {firstName}, we received {amount} for {order}. Receipt {receipt}.\n{items}\nPaid {paid}. Balance {balance}. Asante! Pendo Rentals',
        invoiceSent: 'Hi {firstName}, {business} invoice {invoice} for {order}.\n{items}\nInvoice total {amount}, paid {paid}. {due}\nHelp: {phone}',
    },
    smsTemplatesSw: {
        bookingCreated: 'Habari {firstName}, {business} imeandaa oda yako {order} ya tarehe {date} ({days}).\n{items}{priceNote}{login}\nMsaada: {phone}',
        requestReceived: 'Habari {firstName}, asante kwa kuchagua {business}! Tumepokea ombi lako {order}:\n{itemList}\nTukio: {date} ({days}) mahali {place}. Tutakupigia kuthibitisha oda yako.{login}\nMsaada: {phone}',
        bookingConfirmed: 'Habari {firstName}, oda yako ya {business} {order} ya tarehe {date} imethibitishwa.\n{items}\nMsaada: {phone}',
        outForDelivery: 'Habari {firstName}, vifaa vya oda {order} viko njiani kuelekea {place}.\n{itemList}\nTafadhali vihakiki vikifika. Msaada: {phone}',
        completed: 'Asante {firstName} kwa kukodi kutoka {business}! Tunatumaini sherehe yako ilienda vizuri. {phone}',
        paymentReceived: 'Habari {firstName}, tumepokea {amount} kwa oda {order}. Risiti {receipt}.\n{items}\nUmelipa {paid}. Salio {balance}. Asante! {business}',
        invoiceSent: 'Habari {firstName}, ankara ya {business} {invoice} kwa oda {order}.\n{items}\nJumla ya ankara {amount}, umelipa {paid}. {due}\nMsaada: {phone}',
    },
};

export const PAYMENT_METHOD_TYPES = ['mobile', 'bank', 'cash', 'card', 'other'];

// Settings saved before methods were editable kept on/off flags and numbers per method.
function legacyPaymentMethods(stored) {
    const flag = (key, fallback) => (stored[key] === undefined ? fallback : Boolean(stored[key]));
    return [
        { id: 'mpesa', name: 'M-Pesa', type: 'mobile', provider: '', number: stored.lipaNumber || '', accountName: stored.lipaName ?? 'Pendo Rentals', enabled: flag('payMpesa', true) },
        { id: 'tigo', name: 'Tigo Pesa', type: 'mobile', provider: '', number: stored.tigoNumber || '', accountName: stored.tigoName ?? 'Pendo Rentals', enabled: flag('payTigo', true) },
        { id: 'airtel', name: 'Airtel Money', type: 'mobile', provider: '', number: stored.airtelNumber || '', accountName: stored.airtelName ?? 'Pendo Rentals', enabled: flag('payAirtel', true) },
        { id: 'bank', name: 'Bank transfer', type: 'bank', provider: stored.bankName || 'CRDB Bank', number: stored.bankAccountNumber || '', accountName: stored.bankAccountName ?? 'Pendo Rentals', enabled: flag('payBank', true) },
        { id: 'cash', name: 'Cash', type: 'cash', provider: '', number: '', accountName: '', enabled: flag('payCash', true) },
        { id: 'card', name: 'Card', type: 'card', provider: '', number: '', accountName: '', enabled: flag('payCard', false) },
    ];
}

export async function getSettings(db = { query }) {
    const { rows } = await db.query("select value from settings where key = 'workspace'");
    const stored = rows[0]?.value || {};
    return {
        ...DEFAULT_SETTINGS,
        ...stored,
        paymentMethods: Array.isArray(stored.paymentMethods) ? stored.paymentMethods : legacyPaymentMethods(stored),
        smsTemplates: upgradeTemplates(stored.smsTemplates),
        smsTemplatesSw: upgradeTemplates(stored.smsTemplatesSw, DEFAULT_SETTINGS.smsTemplatesSw, OLD_DEFAULT_TEMPLATES_SW),
        smsLanguage: ['en', 'sw', 'both'].includes(stored.smsLanguage) ? stored.smsLanguage : 'en',
    };
}

// Saved templates that were never edited still match an old default; give them the itemised version.
const OLD_DEFAULT_TEMPLATES = {
    bookingConfirmed: 'Hi {firstName}, your Pendo Rentals booking {order} for {date} is confirmed. Total: {total}. Help: {phone}',
    outForDelivery: 'Hi {firstName}, your Pendo Rentals items for {order} are on the way to {place}. Help: {phone}',
    paymentReceived: 'Hi {firstName}, we received {amount} for {order}. Receipt {receipt}. Balance: {balance}. Asante! Pendo Rentals',
    requestReceived: 'Hi {firstName}, thank you for choosing {business}! We received your request {order}:\n{itemList}\nEvent: {date} ({days}) at {place}. We will call you to confirm the price.{login}\nHelp: {phone}',
};
const OLD_DEFAULT_TEMPLATES_SW = {
    requestReceived: 'Habari {firstName}, asante kwa kuchagua {business}! Tumepokea ombi lako {order}:\n{itemList}\nTukio: {date} ({days}) mahali {place}. Tutakupigia kuthibitisha bei.{login}\nMsaada: {phone}',
};
function upgradeTemplates(saved = {}, defaults = DEFAULT_SETTINGS.smsTemplates, oldDefaults = OLD_DEFAULT_TEMPLATES) {
    const templates = { ...defaults, ...(saved || {}) };
    for (const [key, old] of Object.entries(oldDefaults)) {
        if (templates[key] === old) templates[key] = defaults[key];
    }
    return templates;
}

export const enabledPaymentMethods = (settings) => (settings.paymentMethods || []).filter((method) => method.enabled);

// Validates the editable list of payment methods.
function sanitizePaymentMethods(input) {
    if (!Array.isArray(input) || input.length === 0) throw new HttpError(400, 'Add at least one payment method.');
    if (input.length > 20) throw new HttpError(400, 'Up to 20 payment methods.');
    const text = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
    const methods = input.map((raw, index) => ({
        id: text(raw?.id, 40) || `method-${index + 1}`,
        name: text(raw?.name, 30),
        type: PAYMENT_METHOD_TYPES.includes(raw?.type) ? raw.type : 'other',
        provider: text(raw?.provider, 40),
        number: text(raw?.number, 40),
        accountName: text(raw?.accountName, 60),
        // Mobile money: pay by Lipa Namba, by sending to a phone number, or either.
        payTo: ['lipa', 'phone', 'both'].includes(raw?.payTo) ? raw.payTo : 'lipa',
        phone: text(raw?.phone, 20),
        enabled: Boolean(raw?.enabled),
    }));
    methods.forEach((method, index) => {
        if (method.name.length < 2) throw new HttpError(400, `Payment method ${index + 1} needs a name.`);
        if (methods.findIndex((other) => other.name.toLowerCase() === method.name.toLowerCase()) !== index) throw new HttpError(400, `“${method.name}” is listed twice.`);
    });
    if (!methods.some((method) => method.enabled)) throw new HttpError(400, 'Keep at least one payment method switched on.');
    return methods;
}

// Only keys that exist in the defaults, with the same type, are stored.
export function sanitizeSettings(input) {
    const clean = {};
    for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
        if (input?.[key] === undefined) continue;
        if (key === 'paymentMethods') {
            clean.paymentMethods = sanitizePaymentMethods(input.paymentMethods);
            continue;
        }
        if (key === 'smsTemplates' || key === 'smsTemplatesSw') {
            clean[key] = Object.fromEntries(
                Object.keys(DEFAULT_SETTINGS[key])
                    .filter((name) => typeof input[key]?.[name] === 'string')
                    .map((name) => [name, input[key][name].slice(0, 480)]),
            );
            continue;
        }
        if (key === 'smsLanguage') {
            if (!['en', 'sw', 'both'].includes(input.smsLanguage)) throw new HttpError(400, 'Choose English, Kiswahili or both for SMS.');
            clean.smsLanguage = input.smsLanguage;
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
    next.smsTemplatesSw = { ...current.smsTemplatesSw, ...(sanitizeSettings(values).smsTemplatesSw || {}) };
    await query(
        `insert into settings (key, value, updated_at) values ('workspace', $1, now())
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [next],
    );
    return next;
}

// Customer SMS in the chosen language. `valuesFor(lang)` gives the placeholders for 'en' or 'sw'.
// With 'both', the Kiswahili message is sent first, then the English one.
export async function sendTemplate(settings, key, phone, valuesFor, options) {
    const { sendSms } = await import('./sms.service.js');
    const languages = settings.smsLanguage === 'both' ? ['sw', 'en'] : [settings.smsLanguage === 'sw' ? 'sw' : 'en'];
    const results = [];
    for (const lang of languages) {
        const templates = lang === 'sw' ? settings.smsTemplatesSw : settings.smsTemplates;
        const template = templates?.[key] || DEFAULT_SETTINGS[lang === 'sw' ? 'smsTemplatesSw' : 'smsTemplates'][key];
        results.push(await sendSms(phone, fillTemplate(template, { business: settings.businessName, ...valuesFor(lang) }), options));
    }
    return results.find((result) => result.status !== 'sent') || results[0];
}

export function fillTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => (values[key] !== undefined ? String(values[key]) : match));
}
