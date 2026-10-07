import { prettyPhone, todayIso } from '../utils/helpers.js';
import { readFileAsDataUrl } from './storage.service.js';

// Shared by the billing and customer controllers.
export const INVOICE_SELECT = `
    select i.*, c.first_name, c.last_name, c.phone, o.code as order_code,
           coalesce((select sum(p.amount) from payments p where p.invoice_id = i.id and p.status = 'Paid'), 0) as paid
      from invoices i
      join customers c on c.id = i.customer_id
      left join orders o on o.id = i.order_id`;

export function shapeInvoice(row) {
    const overdue = row.status !== 'Paid' && row.status !== 'Cancelled' && row.due_on < todayIso();
    return {
        id: row.id,
        code: row.code,
        orderCode: row.order_code,
        customerId: row.customer_id,
        customer: `${row.first_name} ${row.last_name}`,
        phone: prettyPhone(row.phone),
        issuedOn: row.issued_on,
        dueOn: row.due_on,
        amount: row.amount,
        paid: row.paid,
        balance: Math.max(0, row.amount - row.paid),
        status: overdue ? 'Overdue' : row.status,
        storedStatus: row.status,
        notes: row.notes || '',
        createdAt: row.created_at,
        // The signature image itself is only sent with a single invoice (see signatureOf).
        signed: Boolean(row.signed_at),
        signedName: row.signed_name || '',
        signedAt: row.signed_at,
    };
}

// The signature printed on a signed invoice: the business signature it was signed with (read from S3).
export async function signatureOf(row) {
    if (!row.signed_at) return null;
    const image = row.signature_key ? await readFileAsDataUrl(row.signature_key).catch(() => null) : null;
    return { image, name: row.signed_name || '', signedAt: row.signed_at };
}

export const PAYMENT_SELECT = `
    select p.*, c.first_name, c.last_name, c.phone, o.code as order_code, i.code as invoice_code,
           s.first_name || ' ' || s.last_name as cashier
      from payments p
      join customers c on c.id = p.customer_id
      left join orders o on o.id = p.order_id
      left join invoices i on i.id = p.invoice_id
      left join staff s on s.id = p.received_by`;

export function shapePayment(row) {
    return {
        id: row.id,
        receipt: row.code,
        date: row.paid_on,
        customerId: row.customer_id,
        customer: `${row.first_name} ${row.last_name}`,
        phone: prettyPhone(row.phone),
        reference: row.order_code || '—',
        invoice: row.invoice_code || '—',
        method: row.method,
        transactionRef: row.reference || '',
        amount: row.amount,
        status: row.status,
        cashier: row.cashier || '—',
        tithePercent: row.tithe_percent,
        tithe: row.tithe_amount,
        delivery: row.delivery_amount || 0,
        items: row.amount - (row.delivery_amount || 0),
        givingPercent: row.giving_percent,
        giving: row.giving_amount,
        createdAt: row.created_at,
    };
}
