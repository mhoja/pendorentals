import { query } from '../config/db.js';
import { prettyPhone } from '../utils/helpers.js';
import { loadOrders } from '../services/orders.service.js';

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
