import { query } from '../config/db.js';
import { HttpError, cleanText, isPhone, normalizePhone, prettyPhone } from '../utils/helpers.js';
import { sendSms, smsConfigured } from '../services/sms.service.js';

// GET /api/messages
export async function listMessages(_request, response) {
    const { rows } = await query(
        `select m.*, o.code as order_code,
                coalesce(c.first_name || ' ' || c.last_name, st.first_name || ' ' || st.last_name) as recipient
           from sms_log m
           left join orders o on o.id = m.order_id
           left join customers c on c.phone = m.phone
           left join staff st on st.phone = m.phone
          order by m.id desc limit 300`,
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
