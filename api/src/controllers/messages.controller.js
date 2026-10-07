import { query } from '../config/db.js';
import { HttpError, cleanText, isIsoDate, isPhone, normalizePhone, prettyPhone } from '../utils/helpers.js';
import { resendLogged, sendSms, smsConfigured } from '../services/sms.service.js';

// GET /api/messages
export async function listMessages(_request, response) {
    const { rows } = await query(
        `select m.*, o.code as order_code,
                coalesce(c.first_name || ' ' || c.last_name, st.first_name || ' ' || st.last_name) as recipient
           from sms_log m
           left join orders o on o.id = m.order_id
           left join customers c on c.phone = m.phone
           left join staff st on st.phone = m.phone
          order by m.id desc limit 2000`,
    );
    const { rows: [counts] } = await query(
        `select count(*) filter (where created_at > now() - interval '30 days') as month,
                count(*) filter (where status = 'sent' and created_at > now() - interval '30 days') as delivered,
                count(*) filter (where status <> 'sent' and created_at > now() - interval '30 days') as not_sent
           from sms_log`,
    );
    response.json({
        messages: rows.map((row) => ({
            id: row.id,
            phone: prettyPhone(row.phone),
            recipient: row.recipient || prettyPhone(row.phone),
            message: row.message,
            kind: row.kind,
            status: row.status,
            error: row.error,
            orderCode: row.order_code,
            attempts: row.attempts,
            lastAttemptAt: row.last_attempt_at,
            createdAt: row.created_at,
        })),
        stats: counts,
        smsConfigured: smsConfigured(),
    });
}

// POST /api/messages
export async function sendMessage(request, response) {
    const phone = normalizePhone(request.body?.phone);
    const message = cleanText(request.body?.message, 480);
    if (!isPhone(phone)) throw new HttpError(400, 'Enter a valid phone number.', { fields: { phone: 'Enter a valid phone number.' } });
    if (message.length < 2) throw new HttpError(400, 'Write a message.', { fields: { message: 'Write a message.' } });
    const result = await sendSms(phone, message, { kind: 'manual' });
    response.status(201).json({ sms: { status: result.status, error: result.error } });
}

const STATUSES = ['sent', 'failed', 'not_configured'];
const validIds = (raw) => (Array.isArray(raw) ? raw.map(Number).filter((id) => Number.isInteger(id) && id > 0) : []);

// POST /api/messages/:id/retry — send the same SMS again; the history row is updated.
export async function retryMessage(request, response) {
    const id = Number(request.params.id);
    const { rows: [row] } = Number.isInteger(id) ? await query('select * from sms_log where id = $1', [id]) : { rows: [] };
    if (!row) throw new HttpError(404, 'Message not found.');
    const result = await resendLogged(row);
    response.json({ sms: { id, status: result.status, error: result.error } });
}

// POST /api/messages/retry — retry several (ids), or every message that wasn't sent ({ failed: true }).
export async function retryMessages(request, response) {
    const body = request.body || {};
    const ids = validIds(body.ids);
    const { rows } = body.failed === true
        ? await query("select * from sms_log where status <> 'sent' order by id limit 200")
        : ids.length ? await query('select * from sms_log where id = any($1) order by id', [ids.slice(0, 200)]) : { rows: [] };
    if (rows.length === 0) throw new HttpError(400, 'Choose the messages to retry.');
    let sent = 0;
    for (const row of rows) {
        const result = await resendLogged(row);
        if (result.status === 'sent') sent += 1;
    }
    response.json({ tried: rows.length, sent, notSent: rows.length - sent });
}

// DELETE /api/messages/:id — remove one message from the history.
export async function deleteMessage(request, response) {
    const id = Number(request.params.id);
    const { rowCount } = Number.isInteger(id) ? await query('delete from sms_log where id = $1', [id]) : { rowCount: 0 };
    if (!rowCount) throw new HttpError(404, 'Message not found.');
    response.json({ deleted: 1 });
}

// POST /api/messages/purge — remove by ids, by date range (optionally one status), or everything ({ all: true }).
export async function purgeMessages(request, response) {
    const body = request.body || {};
    const ids = validIds(body.ids);
    let result;
    if (ids.length) {
        result = await query('delete from sms_log where id = any($1)', [ids]);
    } else if (body.all === true) {
        result = await query('delete from sms_log');
    } else {
        const from = isIsoDate(body.from) ? body.from : null;
        const to = isIsoDate(body.to) ? body.to : null;
        if (!from && !to) throw new HttpError(400, 'Choose messages, a date range, or everything.');
        if (from && to && from > to) throw new HttpError(400, 'The start date must be before the end date.');
        const status = STATUSES.includes(body.status) ? body.status : null;
        result = await query(
            `delete from sms_log
              where ($1::date is null or created_at >= $1::date)
                and ($2::date is null or created_at < $2::date + 1)
                and ($3::text is null or status = $3)`,
            [from, to, status],
        );
    }
    response.json({ deleted: result.rowCount });
}
