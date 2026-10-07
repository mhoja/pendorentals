import { query } from '../config/db.js';
import { HttpError, prettyPhone } from '../utils/helpers.js';
import { loadOrder, loadOrders } from '../services/orders.service.js';
import { INVOICE_SELECT, PAYMENT_SELECT, shapeInvoice, shapePayment } from '../services/billing.service.js';
import { getSettings } from '../services/settings.service.js';

// Everything here is limited to the signed-in customer's own records.

// What a customer may see of a payment: no tithe or giving figures.
const customerPayment = (row) => {
    const { tithe, tithePercent, giving, givingPercent, ...payment } = shapePayment(row);
    return payment;
};

// GET /api/my/orders
export async function listMyOrders(request, response) {
    const { rows: [customer] } = await query('select first_name, last_name, phone, area, place from customers where id = $1', [request.user.id]);
    const orders = await loadOrders('o.customer_id = $1', [request.user.id]);
    response.json({
        customer: customer && {
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: prettyPhone(customer.phone),
            area: customer.area,
            place: customer.place,
        },
        orders: orders.map(({ dbId, customer: _customer, ...order }) => order),
    });
}

// GET /api/my/payments — receipts for the customer's payments.
export async function listMyPayments(request, response) {
    const { rows } = await query(`${PAYMENT_SELECT} where p.customer_id = $1 order by p.paid_on desc, p.id desc`, [request.user.id]);
    response.json({ payments: rows.map(customerPayment) });
}

// GET /api/my/invoices
export async function listMyInvoices(request, response) {
    const { rows } = await query(`${INVOICE_SELECT} where i.customer_id = $1 and i.status <> 'Cancelled' order by i.id desc`, [request.user.id]);
    response.json({ invoices: rows.map(shapeInvoice) });
}

// GET /api/my/invoices/:id — the full invoice, only if it belongs to this customer.
export async function getMyInvoice(request, response) {
    const id = Number(request.params.id);
    const { rows: [row] } = Number.isInteger(id)
        ? await query(`${INVOICE_SELECT} where i.id = $1 and i.customer_id = $2`, [id, request.user.id])
        : { rows: [] };
    if (!row) throw new HttpError(404, 'Invoice not found.');
    const [order, payments, customer, settings] = await Promise.all([
        row.order_code ? loadOrder(row.order_code) : null,
        query(`${PAYMENT_SELECT} where p.invoice_id = $1 order by p.paid_on, p.id`, [row.id]),
        query('select first_name, last_name, phone, email, area, place from customers where id = $1', [request.user.id]),
        getSettings(),
    ]);
    const person = customer.rows[0] || {};
    const { dbId: _dbId, customer: _customer, ...publicOrder } = order || {};
    response.json({
        invoice: shapeInvoice(row),
        order: order ? publicOrder : null,
        payments: payments.rows.map(customerPayment),
        customer: { name: `${person.first_name} ${person.last_name}`, phone: prettyPhone(person.phone), email: person.email || '', area: person.area || '', place: person.place || '' },
        // Only what the invoice layout needs: business details, payment methods and terms.
        settings: {
            businessName: settings.businessName, tagline: settings.tagline, address: settings.address, region: settings.region,
            phone: settings.phone, email: settings.email, tin: settings.tin, depositPercent: settings.depositPercent,
            damagePolicy: settings.damagePolicy, paymentMethods: settings.paymentMethods.filter((method) => method.enabled),
        },
    });
}
