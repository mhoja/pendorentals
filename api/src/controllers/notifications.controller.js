import { query } from '../config/db.js';
import { can } from '../services/permissions.service.js';
import { listNotifications as loadList, markRead } from '../services/notifications.service.js';
import { HttpError } from '../utils/helpers.js';

// The bell list plus the number of requests waiting, for the sidebar badge.
async function listNotifications(user) {
    const data = await loadList(user);
    if (can(user, 'orders.requests')) {
        const { rows: [row] } = await query("select count(*)::int as pending from orders where request_state = 'pending'");
        data.pendingRequests = row.pending;
    }
    return data;
}

// GET /api/notifications — the signed-in staff member's latest notifications and unread count.
export async function getNotifications(request, response) {
    response.json(await listNotifications(request.user));
}

// POST /api/notifications/:id/read
export async function readNotification(request, response) {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Notification not found.');
    await markRead(request.user, [id]);
    response.json(await listNotifications(request.user));
}

// POST /api/notifications/read-all
export async function readAllNotifications(request, response) {
    await markRead(request.user, null);
    response.json(await listNotifications(request.user));
}
