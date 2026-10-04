const BEEM_URL = process.env.BEEM_URL || 'https://apisms.beem.africa/v1/send';

export function smsConfigured() {
    return Boolean(process.env.BEEM_API_KEY && process.env.BEEM_SECRET_KEY && process.env.BEEM_SENDER_ID);
}

// 0712345678 -> 255712345678
export function toInternational(phone) {
    return `255${phone.slice(1)}`;
}

export async function sendSms(phone, message) {
    if (!smsConfigured()) return { status: 'not_configured' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const auth = Buffer.from(`${process.env.BEEM_API_KEY}:${process.env.BEEM_SECRET_KEY}`).toString('base64');
        const response = await fetch(BEEM_URL, {
            method: 'POST',
            signal: controller.signal,
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
        if (response.ok && (body.successful === true || body.code === 100)) {
            return { status: 'sent', requestId: body.request_id };
        }
        return { status: 'failed', error: body.message || `HTTP ${response.status}` };
    } catch (error) {
        return { status: 'failed', error: error.name === 'AbortError' ? 'Timed out' : error.message };
    } finally {
        clearTimeout(timer);
    }
}
