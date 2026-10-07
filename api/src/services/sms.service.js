import { query } from '../config/db.js';

import { createHmac } from 'node:crypto';

// SMS goes through eHub (https://sms.ehub.co.tz). Beem Africa is only used while eHub keys are not set.
const EHUB_BASE = (process.env.EHUB_BASE_URL || 'https://sms.ehub.co.tz').replace(/\/$/, '');
const BEEM_URL = process.env.BEEM_URL || 'https://apisms.beem.africa/v1/send';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ehubConfigured = () => Boolean(process.env.EHUB_API_KEY && process.env.EHUB_API_SECRET && process.env.EHUB_SENDER_ID);
const beemConfigured = () => Boolean(process.env.BEEM_API_KEY && process.env.BEEM_SECRET_KEY && process.env.BEEM_SENDER_ID);

export function smsProvider() {
    if (ehubConfigured()) return 'eHub';
    if (beemConfigured()) return 'Beem';
    return null;
}

export const smsConfigured = () => smsProvider() !== null;

// 0712345678 -> 255712345678
export const toInternational = (phone) => `255${phone.slice(1)}`;

async function withTimeout(work) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        return await work(controller.signal);
    } catch (error) {
        return { status: 'failed', error: error.name === 'AbortError' ? 'Timed out' : error.message };
    } finally {
        clearTimeout(timer);
    }
}

// Every eHub request is signed: HMAC-SHA256 (hex) of "timestamp\nMETHOD\n/path\nbody" with the API secret.
async function ehubRequest(method, path, body, signal) {
    const raw = body === undefined ? '' : JSON.stringify(body);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', process.env.EHUB_API_SECRET).update([timestamp, method, path, raw].join('\n')).digest('hex');
    const response = await fetch(`${EHUB_BASE}${path}`, {
        method,
        signal,
        headers: {
            Authorization: `Bearer ${process.env.EHUB_API_KEY}`,
            'X-Timestamp': String(timestamp),
            'X-Signature': signature,
            Accept: 'application/json',
            ...(raw ? { 'Content-Type': 'application/json' } : {}),
        },
        body: raw || undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

// EHUB_SENDER_ID may be the sender ID's UUID or its approved name (e.g. "Pendorentals").
let senderUuid = null;
async function ehubSender(signal) {
    const configured = process.env.EHUB_SENDER_ID.trim();
    if (UUID.test(configured)) return configured;
    if (senderUuid) return senderUuid;
    const { ok, data } = await ehubRequest('GET', '/api/v1/sender-ids', undefined, signal);
    // eHub groups sender IDs as { own: [], public: [], shared: [] }; only approved ones can send.
    const groups = data?.data || {};
    const list = Array.isArray(groups) ? groups : [...(groups.own || []), ...(groups.shared || []), ...(groups.public || [])];
    const match = list.find((entry) => (!entry.status || entry.status === 'approved')
        && [entry.sender_name, entry.name, entry.sender_id, entry.sender].some((name) => typeof name === 'string' && name.toLowerCase() === configured.toLowerCase()));
    if (!ok || !match) throw new Error(`eHub sender ID "${configured}" was not found or is not approved.`);
    senderUuid = match.id || match.uuid;
    return senderUuid;
}

function deliverEhub(phone, message) {
    return withTimeout(async (signal) => {
        const sender = await ehubSender(signal);
        const { ok, status, data } = await ehubRequest('POST', '/api/v1/sms/send', { to: toInternational(phone), message: message.slice(0, 640), sender_id: sender }, signal);
        if (ok && data.success !== false) return { status: 'sent', requestId: data.data?.message_id };
        return { status: 'failed', error: data.message || `eHub HTTP ${status}` };
    });
}

function deliverBeem(phone, message) {
    return withTimeout(async (signal) => {
        const auth = Buffer.from(`${process.env.BEEM_API_KEY}:${process.env.BEEM_SECRET_KEY}`).toString('base64');
        const response = await fetch(BEEM_URL, {
            method: 'POST',
            signal,
            headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
            body: JSON.stringify({
                source_addr: process.env.BEEM_SENDER_ID,
                schedule_time: '',
                encoding: 0,
                message,
                recipients: [{ recipient_id: 1, dest_addr: toInternational(phone) }],
            }),
        });
        const body = await response.json().catch(() => ({}));
        if (response.ok && (body.successful === true || body.code === 100)) return { status: 'sent', requestId: body.request_id };
        return { status: 'failed', error: body.message || `HTTP ${response.status}` };
    });
}

function deliver(phone, message) {
    const provider = smsProvider();
    if (provider === 'eHub') return deliverEhub(phone, message);
    if (provider === 'Beem') return deliverBeem(phone, message);
    return Promise.resolve({ status: 'not_configured' });
}

// Sends again and updates the existing sms_log row instead of adding a new one. Never throws.
export async function resendLogged(row) {
    const result = await deliver(row.phone, row.message);
    await query(
        `update sms_log set status = $2, error = $3, provider_ref = coalesce($4, provider_ref),
                attempts = attempts + 1, last_attempt_at = now()
          where id = $1`,
        [row.id, result.status, result.error || null, result.requestId ? String(result.requestId) : null],
    );
    if (result.status === 'failed') console.error(`SMS retry to ${row.phone} failed: ${result.error}`);
    return result;
}

// Characters outside the GSM alphabet make an SMS Unicode (70 characters per part instead of 160).
export const smsText = (text) => String(text)
    .replace(/[×✕]/g, 'x')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[ \t]+\n/g, '\n');

// Sends and records every SMS in sms_log. Never throws.
export async function sendSms(phone, rawMessage, { kind = 'manual', orderId = null } = {}) {
    const message = smsText(rawMessage);
    const result = await deliver(phone, message);
    try {
        await query(
            'insert into sms_log (phone, message, kind, status, error, provider_ref, order_id) values ($1, $2, $3, $4, $5, $6, $7)',
            [phone, message, kind, result.status, result.error || null, result.requestId ? String(result.requestId) : null, orderId],
        );
    } catch (error) {
        console.error('Could not record SMS', error.message);
    }
    if (result.status === 'failed') console.error(`SMS to ${phone} failed: ${result.error}`);
    return result;
}
