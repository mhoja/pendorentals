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

// Admins connect or disconnect the gateway in Settings → Integrations. While disconnected nothing is sent;
// messages are still recorded with status "disconnected". Stored in settings under 'sms_gateway';
// a workspace that never changed it stays connected, as it was before the switch existed.
const GATEWAY_TTL = 30000;
let gatewayCache = null;
export async function getGatewayState() {
    if (gatewayCache && Date.now() - gatewayCache.loadedAt < GATEWAY_TTL) return gatewayCache.state;
    const { rows } = await query("select value from settings where key = 'sms_gateway'");
    const stored = rows[0]?.value || {};
    const state = { connected: stored.connected !== false, changedAt: stored.changedAt || null, changedBy: stored.changedBy || null };
    gatewayCache = { state, loadedAt: Date.now() };
    return state;
}

export async function setGatewayConnected(connected, changedBy) {
    const state = { connected, changedAt: new Date().toISOString(), changedBy };
    await query(
        `insert into settings (key, value, updated_at) values ('sms_gateway', $1, now())
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [state],
    );
    gatewayCache = { state, loadedAt: Date.now() };
    return state;
}

// Checks the keys before connecting: eHub must accept them and the sender ID must be approved.
export async function verifyGateway() {
    const provider = smsProvider();
    if (!provider) return { ok: false, error: 'SMS keys are not set on the server. Add EHUB_API_KEY, EHUB_API_SECRET and EHUB_SENDER_ID.' };
    if (provider !== 'eHub') return { ok: true, provider };
    senderUuid = null;
    const result = await withTimeout(async (signal) => {
        await ehubSender(signal);
        return { status: 'ok' };
    });
    return result.status === 'ok' ? { ok: true, provider } : { ok: false, provider, error: result.error };
}

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
    const { ok, status, data } = await ehubRequest('GET', '/api/v1/sender-ids', undefined, signal);
    if (!ok) throw new Error(`eHub did not accept the API keys (${data?.message || `HTTP ${status}`}).`);
    // eHub groups sender IDs as { own: [], public: [], shared: [] }; only approved ones can send.
    const groups = data?.data || {};
    const list = Array.isArray(groups) ? groups : [...(groups.own || []), ...(groups.shared || []), ...(groups.public || [])];
    const match = list.find((entry) => (!entry.status || entry.status === 'approved')
        && [entry.sender_name, entry.name, entry.sender_id, entry.sender].some((name) => typeof name === 'string' && name.toLowerCase() === configured.toLowerCase()));
    if (!match) throw new Error(`eHub sender ID "${configured}" was not found or is not approved.`);
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

async function deliver(phone, message) {
    const provider = smsProvider();
    if (!provider) return { status: 'not_configured' };
    const gateway = await getGatewayState().catch(() => ({ connected: true }));
    if (!gateway.connected) return { status: 'disconnected', error: 'SMS gateway is disconnected (Settings → Integrations).' };
    if (provider === 'eHub') return deliverEhub(phone, message);
    return deliverBeem(phone, message);
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
    // "@" arrives as "!" through the gateway; spell it out instead.
    .replace(/@/g, ' at ')
    .replace(/ {2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n');

// The phone gets the real password; SMS history keeps "****" in its place (after "Password"/"Nenosiri").
export function maskSecret(message, secret) {
    if (!secret) return message;
    const escaped = String(secret).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelled = new RegExp(`((?:password|nenosiri)[^\\n]{0,6}?)${escaped}`, 'gi');
    const masked = message.replace(labelled, '$1****');
    return masked === message ? message.split(String(secret)).join('****') : masked;
}

// Sends and records every SMS in sms_log. Never throws.
// `secret` (a password in the message) is sent to the phone but hidden in the history.
export async function sendSms(phone, rawMessage, { kind = 'manual', orderId = null, secret = null } = {}) {
    const message = smsText(rawMessage);
    const result = await deliver(phone, message);
    try {
        await query(
            'insert into sms_log (phone, message, kind, status, error, provider_ref, order_id, has_secret) values ($1, $2, $3, $4, $5, $6, $7, $8)',
            [phone, maskSecret(message, secret), kind, result.status, result.error || null, result.requestId ? String(result.requestId) : null, orderId, Boolean(secret)],
        );
    } catch (error) {
        console.error('Could not record SMS', error.message);
    }
    if (result.status === 'failed') console.error(`SMS to ${phone} failed: ${result.error}`);
    return result;
}
