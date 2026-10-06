import { query, transaction } from '../config/db.js';
import { HttpError, addDays, cleanText, formatTSh, isIsoDate, isWhole, todayIso } from '../utils/helpers.js';
import { loadOrder, nextCode } from '../services/orders.service.js';
import { fillTemplate, getSettings } from '../services/settings.service.js';
import { sendSms } from '../services/sms.service.js';
import { INVOICE_SELECT, PAYMENT_SELECT, shapeInvoice, shapePayment } from '../services/billing.service.js';

const METHODS = ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Cash', 'Bank transfer', 'Card'];

async function refreshInvoiceStatus(db, invoiceId) {
    if (!invoiceId) return;
    await db.query(
        `update invoices i set status = case
             when i.status = 'Cancelled' then 'Cancelled'
             when paid >= i.amount then 'Paid'
             when paid > 0 then 'Partially paid'
             else 'Unpaid' end
           from (select coalesce(sum(amount), 0) as paid from payments where invoice_id = $1 and status = 'Paid') totals
          where i.id = $1`,
        [invoiceId],
    );
}

// ---- invoices ----

// ---- payments / receipts ----

// GET /api/invoices
export async function listInvoices(_request, response) {
    const { rows } = await query(`${INVOICE_SELECT} order by i.id desc`);
    response.json({ invoices: rows.map(shapeInvoice) });
}

// POST /api/invoices
export async function createInvoice(request, response) {
    const body = request.body || {};
    const settings = await getSettings();
    const order = body.orderCode ? await loadOrder(String(body.orderCode)) : null;
    if (!order) throw new HttpError(400, 'Choose the order to invoice.', { fields: { orderCode: 'Choose an order.' } });
    if (order.invoice) throw new HttpError(409, `${order.id} already has invoice ${order.invoice.code}.`);
    const amount = body.amount !== undefined && body.amount !== '' ? Number(body.amount) : order.total;
    if (!isWhole(amount, 1, 1e10)) {
        throw new HttpError(400, order.total === null ? 'Set prices on the order first, or enter the invoice amount.' : 'Enter the invoice amount.', { fields: { amount: 'Enter an amount.' } });
    }
    const issuedOn = isIsoDate(body.issuedOn) ? body.issuedOn : todayIso();
    const dueOn = isIsoDate(body.dueOn) ? body.dueOn : addDays(issuedOn, 7);
    const id = await transaction(async (db) => {
        const code = await nextCode(db, 'invoice_number_seq', settings.invoicePrefix || 'INV-', 6);
        const { rows: [invoice] } = await db.query(
            `insert into invoices (code, order_id, customer_id, issued_on, due_on, amount, notes, created_by)
             values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
            [code, order.dbId, order.customer.id, issuedOn, dueOn, amount, cleanText(body.notes, 300) || null, request.user.id],
        );
        // Payments already recorded against the order count toward the new invoice.
        await db.query("update payments set invoice_id = $1 where order_id = $2 and invoice_id is null", [invoice.id, order.dbId]);
        await refreshInvoiceStatus(db, invoice.id);
        return invoice.id;
    });
    const { rows: [row] } = await query(`${INVOICE_SELECT} where i.id = $1`, [id]);
    response.status(201).json({ invoice: shapeInvoice(row) });
}

// PATCH /api/invoices/:id
export async function updateInvoice(request, response) {
    const id = Number(request.params.id);
    const body = request.body || {};
    const updates = {};
    if (body.dueOn !== undefined) {
        if (!isIsoDate(body.dueOn)) throw new HttpError(400, 'Choose a due date.');
        updates.due_on = body.dueOn;
    }
    if (body.notes !== undefined) updates.notes = cleanText(body.notes, 300) || null;
    if (body.cancel === true) updates.status = 'Cancelled';
    const keys = Object.keys(updates);
    if (!keys.length) throw new HttpError(400, 'Nothing to update.');
    const { rowCount } = await query(`update invoices set ${keys.map((key, index) => `${key} = $${index + 2}`).join(', ')} where id = $1`, [id, ...keys.map((key) => updates[key])]);
    if (!rowCount) throw new HttpError(404, 'Invoice not found.');
    const { rows: [row] } = await query(`${INVOICE_SELECT} where i.id = $1`, [id]);
    response.json({ invoice: shapeInvoice(row) });
}

// GET /api/payments
export async function listPayments(_request, response) {
    const { rows } = await query(`${PAYMENT_SELECT} order by p.paid_on desc, p.id desc`);
    response.json({ payments: rows.map(shapePayment), methods: METHODS });
}

// POST /api/payments
export async function recordPayment(request, response) {
    const body = request.body || {};
    const amount = Number(body.amount);
    if (!isWhole(amount, 1, 1e10)) throw new HttpError(400, 'Enter the amount received.', { fields: { amount: 'Enter an amount.' } });
    if (!METHODS.includes(body.method)) throw new HttpError(400, 'Choose the payment method.', { fields: { method: 'Choose a method.' } });
    const paidOn = isIsoDate(body.paidOn) ? body.paidOn : todayIso();
    if (paidOn > todayIso()) throw new HttpError(400, 'The payment date cannot be in the future.', { fields: { paidOn: 'Not in the future.' } });

    let orderId = null;
    let invoiceId = null;
    let customerId = null;
    if (body.invoiceId) {
        const { rows: [invoice] } = await query('select * from invoices where id = $1', [Number(body.invoiceId)]);
        if (!invoice || invoice.status === 'Cancelled') throw new HttpError(400, 'Invoice not found.');
        ({ id: invoiceId, order_id: orderId, customer_id: customerId } = invoice);
    } else if (body.orderCode) {
        const order = await loadOrder(String(body.orderCode));
        orderId = order.dbId;
        customerId = order.customer.id;
        invoiceId = order.invoice?.id || null;
    } else {
        throw new HttpError(400, 'Choose the order or invoice this payment is for.', { fields: { orderCode: 'Choose an order.' } });
    }

    const settings = await getSettings();
    const tithePercent = settings.titheEnabled ? Math.min(100, Math.max(0, Number(settings.tithePercent) || 0)) : 0;
    const titheAmount = Math.round((amount * tithePercent) / 100);
    const paymentId = await transaction(async (db) => {
        const code = await nextCode(db, 'receipt_number_seq', settings.receiptPrefix || 'RCT-', 4);
        const { rows: [payment] } = await db.query(
            `insert into payments (code, invoice_id, order_id, customer_id, amount, method, reference, paid_on, tithe_percent, tithe_amount, received_by)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
            [code, invoiceId, orderId, customerId, amount, body.method, cleanText(body.reference, 40) || null, paidOn, tithePercent, titheAmount, request.user.id],
        );
        await refreshInvoiceStatus(db, invoiceId);
        return payment.id;
    });
    const { rows: [row] } = await query(`${PAYMENT_SELECT} where p.id = $1`, [paymentId]);
    const payment = shapePayment(row);

    let sms = null;
    if (body.notifyCustomer !== false) {
        const order = orderId ? (await query('select code from orders where id = $1', [orderId])).rows[0] : null;
        const balance = order ? (await loadOrder(order.code)).balance : null;
        const message = fillTemplate(settings.smsTemplates.paymentReceived, {
            firstName: row.first_name,
            amount: formatTSh(amount),
            order: order?.code || payment.invoice,
            receipt: payment.receipt,
            balance: balance === null ? '—' : formatTSh(balance),
        });
        sms = await sendSms(row.phone, message, { kind: 'payment', orderId });
    }
    response.status(201).json({ payment, sms: sms && { status: sms.status } });
}

// PATCH /api/payments/:id
export async function refundPayment(request, response) {
    const id = Number(request.params.id);
    if (request.body?.status !== 'Refunded') throw new HttpError(400, 'Only refunds are supported.');
    const invoiceId = await transaction(async (db) => {
        const { rows: [payment] } = await db.query("update payments set status = 'Refunded' where id = $1 returning invoice_id", [id]);
        if (!payment) throw new HttpError(404, 'Payment not found.');
        await refreshInvoiceStatus(db, payment.invoice_id);
        return payment.invoice_id;
    });
    const { rows: [row] } = await query(`${PAYMENT_SELECT} where p.id = $1`, [id]);
    response.json({ payment: shapePayment(row), invoiceId });
}
