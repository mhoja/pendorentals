import { prettyPhone, todayIso } from '../utils/helpers.js';

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
    };
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
        createdAt: row.created_at,
    };
}
