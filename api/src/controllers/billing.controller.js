import { query, transaction } from '../config/db.js';
import { HttpError, addDays, cleanText, formatDate, formatTSh, greetName, isIsoDate, isWhole, prettyPhone, todayIso } from '../utils/helpers.js';
import { loadOrder, nextCode, smsDate, smsItems } from '../services/orders.service.js';
import { enabledPaymentMethods, getSettings, sendTemplate } from '../services/settings.service.js';
import { INVOICE_SELECT, PAYMENT_SELECT, shapeInvoice, shapePayment } from '../services/billing.service.js';

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

async function loadInvoice(id) {
    const { rows: [row] } = Number.isInteger(id) ? await query(`${INVOICE_SELECT} where i.id = $1`, [id]) : { rows: [] };
    if (!row) throw new HttpError(404, 'Invoice not found.');
    return row;
}

// GET /api/invoices/:id — everything needed to show, print or send the invoice.
export async function getInvoice(request, response) {
    const row = await loadInvoice(Number(request.params.id));
    const [order, payments, customer] = await Promise.all([
        row.order_code ? loadOrder(row.order_code) : null,
        query(`${PAYMENT_SELECT} where p.invoice_id = $1 order by p.paid_on, p.id`, [row.id]),
        query('select first_name, last_name, phone, email, area, place from customers where id = $1', [row.customer_id]),
    ]);
    const person = customer.rows[0] || {};
    response.json({
        invoice: shapeInvoice(row),
        order,
        payments: payments.rows.map(shapePayment),
        customer: { name: `${person.first_name} ${person.last_name}`, phone: prettyPhone(person.phone), email: person.email || '', area: person.area || '', place: person.place || '' },
    });
}

// POST /api/invoices/:id/send — SMS the invoice summary and how to pay.
export async function sendInvoice(request, response) {
    const invoice = shapeInvoice(await loadInvoice(Number(request.params.id)));
    if (invoice.status === 'Cancelled') throw new HttpError(400, 'This invoice is cancelled.');
    const settings = await getSettings();
    const { rows: [person] } = await query('select first_name, phone from customers where id = $1', [invoice.customerId]);
    const howToPay = (lang) => {
        const or = lang === 'sw' ? ' au ' : ' or ';
        const to = lang === 'sw' ? 'kwa' : 'to';
        return enabledPaymentMethods(settings)
            .map((method) => {
                if (method.type !== 'mobile') return method.number ? `${method.provider || method.name} ${method.number}` : '';
                const ways = [
                    method.payTo !== 'phone' && method.number ? `Lipa ${method.number}` : '',
                    method.payTo !== 'lipa' && method.phone ? `${to} ${method.phone}` : '',
                ].filter(Boolean).join(or);
                return ways ? `${method.name} ${ways}` : '';
            })
            .filter(Boolean)
            .join(', ');
    };
    const due = (lang) => {
        const pay = howToPay(lang);
        if (invoice.balance <= 0) return lang === 'sw' ? 'Imelipwa yote - asante!' : 'Fully paid - asante!';
        if (lang === 'sw') return `Salio ${formatTSh(invoice.balance)} kabla ya ${smsDate(invoice.dueOn, 'sw')}.${pay ? ` Lipa kupitia ${pay}, kumbukumbu ${invoice.code}.` : ` Taja ${invoice.code} unapolipa.`}`;
        return `Balance due ${formatTSh(invoice.balance)} by ${formatDate(invoice.dueOn)}.${pay ? ` Pay via ${pay}, ref ${invoice.code}.` : ` Quote ${invoice.code} when paying.`}`;
    };
    const invoiceOrder = invoice.orderCode ? await loadOrder(invoice.orderCode) : null;
    const sms = await sendTemplate(settings, 'invoiceSent', person.phone, (lang) => ({
        firstName: greetName(person.first_name),
        invoice: invoice.code,
        order: invoice.orderCode || '-',
        items: invoiceOrder ? smsItems(invoiceOrder, { budget: 260, lang }) : '',
        amount: formatTSh(invoice.amount),
        paid: formatTSh(invoice.paid),
        due: due(lang),
        phone: settings.phone,
    }), { kind: 'invoice', orderId: invoiceOrder?.dbId || null });
    response.json({ sms: { status: sms.status, error: sms.error } });
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
    response.json({ payments: rows.map(shapePayment), methods: enabledPaymentMethods(await getSettings()).map((method) => method.name) });
}

// POST /api/payments
export async function recordPayment(request, response) {
    const body = request.body || {};
    const amount = Number(body.amount);
    if (!isWhole(amount, 1, 1e10)) throw new HttpError(400, 'Enter the amount received.', { fields: { amount: 'Enter an amount.' } });
    const methods = enabledPaymentMethods(await getSettings()).map((method) => method.name);
    if (!methods.includes(body.method)) throw new HttpError(400, 'Choose the payment method.', { fields: { method: 'Choose a method.' } });
    const paidOn = isIsoDate(body.paidOn) ? body.paidOn : todayIso();
    if (paidOn > todayIso()) throw new HttpError(400, 'The payment date cannot be in the future.', { fields: { paidOn: 'Not in the future.' } });

    let orderId = null;
    let invoiceId = null;
    let customerId = null;
    let order = null;
    if (body.invoiceId) {
        const { rows: [invoice] } = await query('select i.*, o.code as order_code from invoices i left join orders o on o.id = i.order_id where i.id = $1', [Number(body.invoiceId)]);
        if (!invoice || invoice.status === 'Cancelled') throw new HttpError(400, 'Invoice not found.');
        ({ id: invoiceId, order_id: orderId, customer_id: customerId } = invoice);
        if (invoice.order_code) order = await loadOrder(invoice.order_code);
    } else if (body.orderCode) {
        order = await loadOrder(String(body.orderCode));
        orderId = order.dbId;
        customerId = order.customer.id;
        invoiceId = order.invoice?.id || null;
    } else {
        throw new HttpError(400, 'Choose the order or invoice this payment is for.', { fields: { orderCode: 'Choose an order.' } });
    }

    // Split between rented items and the delivery fee. If not given, items are paid first.
    const deliveryDue = order?.deliveryBalance || 0;
    let deliveryAmount;
    if (body.deliveryAmount === undefined || body.deliveryAmount === null || body.deliveryAmount === '') {
        deliveryAmount = Math.max(0, Math.min(deliveryDue, amount - (order?.itemsBalance || 0)));
    } else {
        deliveryAmount = Number(body.deliveryAmount);
        if (!isWhole(deliveryAmount, 0, amount)) throw new HttpError(400, 'The delivery part must be between 0 and the amount received.', { fields: { deliveryAmount: 'Check the delivery amount.' } });
        if (deliveryAmount > deliveryDue) {
            throw new HttpError(400, deliveryDue ? `Only ${formatTSh(deliveryDue)} of delivery fee is still due.` : 'No delivery fee is due on this order.', { fields: { deliveryAmount: 'More than the delivery fee due.' } });
        }
    }

    const settings = await getSettings();
    const tithePercent = settings.titheEnabled ? Math.min(100, Math.max(0, Number(settings.tithePercent) || 0)) : 0;
    const titheAmount = Math.round((amount * tithePercent) / 100);
    const givingPercent = settings.givingEnabled ? Math.min(100, Math.max(0, Number(settings.givingPercent) || 0)) : 0;
    const givingAmount = Math.round((amount * givingPercent) / 100);
    const paymentId = await transaction(async (db) => {
        const code = await nextCode(db, 'receipt_number_seq', settings.receiptPrefix || 'RCT-', 4);
        const { rows: [payment] } = await db.query(
            `insert into payments (code, invoice_id, order_id, customer_id, amount, delivery_amount, method, reference, paid_on, tithe_percent, tithe_amount, giving_percent, giving_amount, received_by)
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning id`,
            [code, invoiceId, orderId, customerId, amount, deliveryAmount, body.method, cleanText(body.reference, 40) || null, paidOn, tithePercent, titheAmount, givingPercent, givingAmount, request.user.id],
        );
        await refreshInvoiceStatus(db, invoiceId);
        return payment.id;
    });
    const { rows: [row] } = await query(`${PAYMENT_SELECT} where p.id = $1`, [paymentId]);
    const payment = shapePayment(row);

    let sms = null;
    if (body.notifyCustomer !== false) {
        const code = orderId ? (await query('select code from orders where id = $1', [orderId])).rows[0]?.code : null;
        const paidOrder = code ? await loadOrder(code) : null;
        sms = await sendTemplate(settings, 'paymentReceived', row.phone, (lang) => ({
            firstName: greetName(row.first_name),
            amount: formatTSh(amount),
            order: code || payment.invoice,
            receipt: payment.receipt,
            balance: paidOrder?.balance === null || !paidOrder ? '-' : formatTSh(paidOrder.balance),
            paid: paidOrder ? formatTSh(paidOrder.paid) : formatTSh(amount),
            items: paidOrder ? smsItems(paidOrder, { budget: 280, lang }) : '',
            itemList: paidOrder ? smsItems(paidOrder, { prices: false, budget: 200, lang }) : '',
            total: paidOrder?.total === null || !paidOrder ? (lang === 'sw' ? 'itathibitishwa' : 'to be confirmed') : formatTSh(paidOrder.total),
            phone: settings.phone,
        }), { kind: 'payment', orderId });
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
