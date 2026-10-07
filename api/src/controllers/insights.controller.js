import { query } from '../config/db.js';
import { HttpError, addDays, isIsoDate, prettyPhone, todayIso } from '../utils/helpers.js';
import { ACTIVE_STATUSES, ORDER_STATUSES, loadOrders } from '../services/orders.service.js';
import { can } from '../services/permissions.service.js';
import { PAYMENT_SELECT, shapePayment } from '../services/billing.service.js';

// Units of each inventory item out on active orders today.
const UNITS_OUT_SQL = `
    select oi.inventory_item_id, sum(oi.quantity) as units
      from order_items oi
      join orders o on o.id = oi.order_id
     where oi.inventory_item_id is not null
       and o.status = any($1)
       and $2::date between o.event_date and o.event_date + (o.days - 1)
     group by oi.inventory_item_id`;

// Rows for the Reports page, shaped like the report definitions in the web app.

// GET /api/dashboard
export async function getDashboard(request, response) {
    const today = todayIso();
    // period: 'thisMonth' (1st → today, compared with the same days last month), 'month' (30 days) or 'week' (7 days).
    let range;
    let from;
    let previousFrom;
    let previousTo;
    if (request.query.period === 'thisMonth') {
        from = `${today.slice(0, 7)}-01`;
        range = Number(today.slice(8, 10));
        const lastMonthEnd = addDays(from, -1);
        previousFrom = `${lastMonthEnd.slice(0, 7)}-01`;
        const sameDay = addDays(previousFrom, range - 1);
        previousTo = sameDay < lastMonthEnd ? sameDay : lastMonthEnd;
    } else {
        range = request.query.period === 'month' ? 30 : 7;
        from = addDays(today, -(range - 1));
        previousFrom = addDays(from, -range);
        previousTo = addDays(from, -1);
    }

    const [inventory, unitsOut, revenueRows, previous, counts, popular] = await Promise.all([
        query(`select count(*) as products, coalesce(sum(quantity), 0) as units,
                      count(*) filter (where status = 'Maintenance') as maintenance,
                      coalesce(sum(quantity) filter (where status = 'Maintenance'), 0) as maintenance_units
                 from inventory_items`),
        query(UNITS_OUT_SQL, [ACTIVE_STATUSES, today]),
        query(`select paid_on, sum(amount) as total from payments where status = 'Paid' and paid_on between $1 and $2 group by paid_on`, [from, today]),
        query(`select coalesce(sum(amount), 0) as total from payments where status = 'Paid' and paid_on between $1 and $2`, [previousFrom, previousTo]),
        query(`select count(*) filter (where status = 'New request') as new_requests,
                      count(*) filter (where status = any($1)) as active,
                      count(*) filter (where status not in ('Completed', 'Cancelled') and event_date >= $2) as upcoming
                 from orders`, [ACTIVE_STATUSES, today]),
        query(`select i.id, i.name, i.category, i.rate, i.status, i.sku, coalesce(sum(oi.quantity), 0) as ordered
                 from inventory_items i left join order_items oi on oi.inventory_item_id = i.id
                group by i.id order by ordered desc, i.name limit 3`),
    ]);

    const days = Array.from({ length: range }, (_, index) => addDays(from, index));
    const revenue = days.map((day) => ({ date: day, total: revenueRows.rows.find((row) => row.paid_on === day)?.total || 0 }));
    const revenueTotal = revenue.reduce((sum, day) => sum + day.total, 0);
    const out = unitsOut.rows.reduce((sum, row) => sum + row.units, 0);
    const openOrders = await loadOrders("o.status not in ('Completed', 'Cancelled')");
    const upcoming = openOrders
        .filter((order) => order.eventDate >= today)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
        .slice(0, 6);

    // Today's work: deliveries for today/tomorrow and rentals whose last day has passed.
    const tomorrow = addDays(today, 1);
    const lastDay = (order) => addDays(order.eventDate, Math.max(1, order.days) - 1);
    const brief = (order) => ({
        id: order.id, customer: order.customer.name, phone: order.customer.phone, place: [order.place, order.area].filter(Boolean).join(', '),
        eventDate: order.eventDate, endDate: lastDay(order), status: order.status, deliveryStatus: order.deliveryStatus, driver: order.driver?.name || '',
    });
    const deliveries = openOrders
        .filter((order) => order.deliveryRequired && order.deliveryStatus !== 'Delivered' && order.status !== 'New request' && order.eventDate <= tomorrow)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
        .map(brief);
    const returns = openOrders
        .filter((order) => ACTIVE_STATUSES.includes(order.status) && lastDay(order) <= today)
        .sort((a, b) => lastDay(a).localeCompare(lastDay(b)))
        .map(brief);
    const { rows: statusRows } = await query('select status, count(*)::int as count from orders group by status');
    const pipeline = ORDER_STATUSES.map((status) => ({ status, count: statusRows.find((row) => row.status === status)?.count || 0 }));
    const eventsToday = openOrders.filter((order) => order.eventDate <= today && lastDay(order) >= today && order.status !== 'New request').length;

    // Money figures are only for managers, like the Finance page.
    let finance = null;
    if (can(request.user, 'overview.money')) {
        const monthStart = `${today.slice(0, 7)}-01`;
        const lastMonthEnd = addDays(monthStart, -1);
        const lastMonthStart = `${lastMonthEnd.slice(0, 7)}-01`;
        const money = async (start, end) => {
            const [{ rows: [paid] }, { rows: [spent] }] = await Promise.all([
                query(`select coalesce(sum(amount), 0) as collected, coalesce(sum(tithe_amount), 0) as tithe,
                              coalesce(sum(giving_amount), 0) as giving, coalesce(sum(delivery_amount), 0) as delivery, count(*)::int as payments
                         from payments where status = 'Paid' and paid_on between $1 and $2`, [start, end]),
                query(`select coalesce(sum(amount), 0) as expenses from expenses where status = 'Approved' and spent_on between $1 and $2`, [start, end]),
            ]);
            return { ...paid, expenses: spent.expenses, net: paid.collected - paid.tithe - paid.giving - spent.expenses };
        };
        const [month, lastMonth, overdue, pending, recent] = await Promise.all([
            money(monthStart, today),
            money(lastMonthStart, lastMonthEnd),
            query(`select count(*)::int as count, coalesce(sum(i.amount - coalesce(p.paid, 0)), 0) as amount
                     from invoices i left join (select invoice_id, sum(amount) as paid from payments where status = 'Paid' group by invoice_id) p on p.invoice_id = i.id
                    where i.status not in ('Paid', 'Cancelled') and i.due_on < $1`, [today]),
            query(`select count(*)::int as count, coalesce(sum(amount), 0) as amount from expenses where status = 'Pending'`),
            query(`${PAYMENT_SELECT} order by p.paid_on desc, p.id desc limit 5`),
        ]);
        // Every order except cancelled ones, so completed orders that still owe money count too.
        const owing = (await loadOrders("o.status <> 'Cancelled'")).filter((order) => order.balance > 0);
        finance = {
            month, lastMonth,
            outstanding: owing.reduce((sum, order) => sum + order.balance, 0),
            owingOrders: owing.length,
            overdueInvoices: overdue.rows[0],
            pendingExpenses: pending.rows[0],
            recentPayments: recent.rows.map(shapePayment),
        };
    }

    response.json({
        inventory: {
            products: inventory.rows[0].products,
            units: inventory.rows[0].units,
            out,
            maintenance: inventory.rows[0].maintenance,
            maintenanceUnits: inventory.rows[0].maintenance_units,
            available: Math.max(0, inventory.rows[0].units - out - inventory.rows[0].maintenance_units),
        },
        revenue: {
            days: revenue,
            total: revenueTotal,
            previous: previous.rows[0].total,
            change: previous.rows[0].total ? ((revenueTotal - previous.rows[0].total) / previous.rows[0].total) * 100 : null,
        },
        orders: { ...counts.rows[0], unpriced: openOrders.filter((order) => !order.priced).length, eventsToday },
        upcoming,
        popular: popular.rows,
        pipeline,
        deliveries,
        returns,
        finance,
    });
}

// GET /api/finance/summary
export async function getFinanceSummary(request, response) {
    const to = isIsoDate(request.query.to) ? request.query.to : todayIso();
    const from = isIsoDate(request.query.from) ? request.query.from : `${to.slice(0, 7)}-01`;
    if (from > to) throw new HttpError(400, 'The start date must be before the end date.');
    const [payments, refunds, expenses, byMethod, byCategory] = await Promise.all([
        query(`select coalesce(sum(amount), 0) as revenue, coalesce(sum(tithe_amount), 0) as tithe, coalesce(sum(giving_amount), 0) as giving, count(*) as count
                 from payments where status = 'Paid' and paid_on between $1 and $2`, [from, to]),
        query(`select coalesce(sum(amount), 0) as total from payments where status = 'Refunded' and paid_on between $1 and $2`, [from, to]),
        query(`select coalesce(sum(amount) filter (where status = 'Approved'), 0) as approved,
                      coalesce(sum(amount) filter (where status = 'Pending'), 0) as pending,
                      count(*) as count
                 from expenses where spent_on between $1 and $2`, [from, to]),
        query(`select method, sum(amount) as total from payments where status = 'Paid' and paid_on between $1 and $2 group by method order by total desc`, [from, to]),
        query(`select category, sum(amount) as total from expenses where status = 'Approved' and spent_on between $1 and $2 group by category order by total desc`, [from, to]),
    ]);
    const revenue = payments.rows[0].revenue;
    const tithe = payments.rows[0].tithe;
    const giving = payments.rows[0].giving;
    const spent = expenses.rows[0].approved;
    response.json({
        from,
        to,
        revenue,
        payments: payments.rows[0].count,
        refunded: refunds.rows[0].total,
        tithe,
        giving,
        expenses: spent,
        pendingExpenses: expenses.rows[0].pending,
        expenseCount: expenses.rows[0].count,
        net: revenue - tithe - giving - spent,
        byMethod: byMethod.rows,
        byCategory: byCategory.rows,
    });
}

// GET /api/reports/:id
export async function getReport(request, response) {
    const id = request.params.id;
    if (id === 'finance') {
        const { rows } = await query(
            `select p.*, c.first_name || ' ' || c.last_name as customer, c.phone, o.code as order_code, i.code as invoice_code,
                    s.first_name || ' ' || s.last_name as cashier
               from payments p join customers c on c.id = p.customer_id
               left join orders o on o.id = p.order_id left join invoices i on i.id = p.invoice_id
               left join staff s on s.id = p.received_by
              order by p.paid_on desc, p.id desc`,
        );
        response.json({ rows: rows.map((row) => ({
            id: row.id, receipt: row.code, date: row.paid_on, customer: row.customer, phone: prettyPhone(row.phone),
            reference: row.order_code || '—', invoice: row.invoice_code || '—', method: row.method, amount: row.amount,
            items: row.amount - row.delivery_amount, delivery: row.delivery_amount,
            status: row.status, cashier: row.cashier || '—', tithe: row.tithe_amount, giving: row.giving_amount,
            net: row.amount - row.tithe_amount - row.giving_amount, transactionRef: row.reference || '',
        })) });
        return;
    }
    if (id === 'sales') {
        const orders = await loadOrders();
        const { rows: categories } = await query('select id, category from inventory_items');
        response.json({ rows: orders.map((order) => {
            const firstLinked = order.items.find((item) => item.inventoryItemId);
            return {
                order: order.id, date: String(order.createdAt.toISOString?.() || order.createdAt).slice(0, 10), customer: order.customerName,
                items: order.items.map((item) => `${item.custom || item.name} ×${item.quantity}`).join(', '),
                category: categories.find((row) => row.id === firstLinked?.inventoryItemId)?.category || 'Unassigned',
                channel: order.source === 'rent_now' ? 'Online (Rent Now)' : 'Staff', days: order.days,
                total: order.total || 0, rental: order.itemsTotal || 0, delivery: order.deliveryFee || 0, status: order.status,
            };
        }) });
        return;
    }
    if (id === 'expenses') {
        const { rows } = await query('select * from expenses order by spent_on desc, id desc');
        response.json({ rows: rows.map((row) => ({
            id: row.id, date: row.spent_on, category: row.category, description: row.description, vendor: row.vendor || '—',
            method: row.method, amount: row.amount, status: row.status,
        })) });
        return;
    }
    if (id === 'inventory') {
        const [{ rows: items }, { rows: out }, { rows: booked }] = await Promise.all([
            query('select * from inventory_items order by name'),
            query(UNITS_OUT_SQL, [ACTIVE_STATUSES, todayIso()]),
            // Each booking line with its event date, so the web app can filter revenue by period.
            query(`select oi.inventory_item_id, o.event_date as date, oi.quantity as units,
                          coalesce(oi.rate, 0) * oi.quantity * o.days as revenue
                     from order_items oi join orders o on o.id = oi.order_id
                    where oi.inventory_item_id is not null and o.status <> 'Cancelled' and o.status <> 'New request'`),
        ]);
        response.json({ rows: items.map((item) => {
            const rented = out.find((row) => row.inventory_item_id === item.id)?.units || 0;
            const bookings = booked.filter((row) => row.inventory_item_id === item.id).map(({ date, units, revenue }) => ({ date, units, revenue }));
            return {
                id: item.id, name: item.name, category: item.category, sku: item.sku, quantity: item.quantity, rented,
                utilization: item.quantity ? Math.round((rented / item.quantity) * 100) : 0,
                booked: bookings.reduce((sum, row) => sum + row.units, 0),
                revenue: bookings.reduce((sum, row) => sum + row.revenue, 0),
                bookings, status: item.status,
            };
        }) });
        return;
    }
    if (id === 'customers') {
        const { rows } = await query(
            `select c.*, count(o.id) filter (where o.status <> 'Cancelled') as orders, max(o.event_date) as last_order,
                    coalesce((select sum(p.amount) from payments p where p.customer_id = c.id and p.status = 'Paid'), 0) as spent
               from customers c left join orders o on o.customer_id = c.id group by c.id order by c.first_name`,
        );
        response.json({ rows: rows.map((row) => ({
            id: row.id, name: `${row.first_name} ${row.last_name}`, phone: prettyPhone(row.phone),
            segment: row.spent >= 1000000 || row.orders >= 5 ? 'VIP' : row.orders <= 1 ? 'New' : 'Regular',
            lastOrder: row.last_order || String(row.created_at.toISOString()).slice(0, 10), orders: row.orders, spent: row.spent,
            status: row.orders > 0 ? 'Active' : 'Inactive',
        })) });
        return;
    }
    if (id === 'deliveries') {
        const orders = await loadOrders('o.delivery_required');
        response.json({ rows: orders.map((order) => ({
            id: order.id, date: order.eventDate, customer: order.customerName, area: order.area || '—',
            driver: order.driver?.name || 'Unassigned', fee: order.deliveryFee, status: order.deliveryStatus,
        })) });
        return;
    }
    throw new HttpError(404, 'Unknown report.');
}
