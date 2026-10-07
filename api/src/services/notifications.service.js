import { query } from '../config/db.js';
import { prettyPhone } from '../utils/helpers.js';
import { loadRolePermissions } from './permissions.service.js';
import { getSettings } from './settings.service.js';
import { sendSms } from './sms.service.js';

const publicUrl = process.env.PUBLIC_URL || 'http://13.222.191.203:5050';

// The permission a staff member needs to see each kind of notification (Admin sees all).
export const NOTIFICATION_PERMISSIONS = { order_request: 'orders.requests' };

export async function kindsFor(user) {
    const roles = await loadRolePermissions();
    const granted = user.role === 'Admin' ? null : roles[user.role] || [];
    return Object.keys(NOTIFICATION_PERMISSIONS).filter((kind) => !granted || granted.includes(NOTIFICATION_PERMISSIONS[kind]));
}

// Active staff whose role has the permission, with a phone to text.
async function staffWith(permission) {
    const roles = Object.entries(await loadRolePermissions()).filter(([, keys]) => keys.includes(permission)).map(([role]) => role);
    const { rows } = await query("select id, first_name, phone from staff where role = any($1) and status <> 'Inactive' and phone is not null", [roles]);
    return rows;
}

const itemText = (item) => `${item.custom || item.name.replace(' (cooking vessels)', '')} x${item.quantity}`;
const smsDateRange = (order) => {
    const start = new Date(`${order.eventDate}T00:00:00Z`);
    const fmt = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    if (order.days <= 1) return fmt(start);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + order.days - 1);
    return `${fmt(start)} - ${fmt(end)} (${order.days} days)`;
};

// A customer sent a rental request: add a bell notification and text everyone who handles requests.
// The SMS go out in the background so the customer is not kept waiting.
export async function notifyOrderRequest(order) {
    const place = order.place ? `${order.place}, ${order.area}` : order.area;
    const items = order.items.map(itemText);
    const body = `${order.customer.name} (${order.customer.phone}) · ${items.join(', ')} · ${smsDateRange(order)} · ${place}`;
    await query('insert into notifications (kind, title, body, order_id) values ($1, $2, $3, $4)',
        ['order_request', `New order request ${order.id}`, body, order.dbId]);

    const settings = await getSettings();
    if (settings.alertSms === false || settings.alertNewBooking === false) return;
    const recipients = await staffWith(NOTIFICATION_PERMISSIONS.order_request);
    const shownItems = items.length > 5 ? [...items.slice(0, 5), `+${items.length - 5} more`] : items;
    const message = `New order request ${order.id} from ${order.customer.name} (${prettyPhone(order.customerPhone)}):\n${shownItems.map((line) => `- ${line}`).join('\n')}\nEvent: ${smsDateRange(order)} at ${place}.\nConfirm it in Order requests: ${publicUrl}`;
    Promise.all(recipients.map((staff) => sendSms(staff.phone, message, { kind: 'staff_alert', orderId: order.dbId })))
        .catch((error) => console.error('Could not text staff about a new request', error.message));
}

const shape = (row) => ({
    id: row.id, kind: row.kind, title: row.title, body: row.body, orderCode: row.order_code,
    createdAt: row.created_at, read: Boolean(row.read_at),
});

export async function listNotifications(user, limit = 30) {
    const kinds = await kindsFor(user);
    const [{ rows }, { rows: [counts] }] = await Promise.all([
        query(`select n.*, o.code as order_code, r.read_at
                 from notifications n
                 left join orders o on o.id = n.order_id
                 left join notification_reads r on r.notification_id = n.id and r.staff_id = $1
                where n.kind = any($2)
                order by n.id desc limit $3`, [user.id, kinds, limit]),
        query(`select count(*)::int as unread from notifications n
                where n.kind = any($2)
                  and not exists (select 1 from notification_reads r where r.notification_id = n.id and r.staff_id = $1)`, [user.id, kinds]),
    ]);
    return { notifications: rows.map(shape), unread: counts.unread };
}

export async function markRead(user, ids) {
    const kinds = await kindsFor(user);
    await query(`insert into notification_reads (notification_id, staff_id)
                 select n.id, $1 from notifications n
                  where n.kind = any($2) and ($3::int[] is null or n.id = any($3))
                 on conflict do nothing`, [user.id, kinds, ids]);
}
