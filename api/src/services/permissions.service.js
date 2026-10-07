import { query } from '../config/db.js';

// Every action and page a staff role can be given. Admin always has all of them.
export const PERMISSION_GROUPS = [
    { group: 'Dashboard', items: [
        ['overview.view', 'See the Dashboard page'],
        ['overview.money', 'See money on the Dashboard (collected, net, to collect, recent payments)'],
    ] },
    { group: 'Orders', items: [
        ['orders.view', 'See all orders'],
        ['orders.requests', 'Handle customer order requests (see Order requests; get an SMS and a notification for each new one)'],
        ['orders.deliveries', 'See delivery orders only (when “See all orders” is off)'],
        ['orders.create', 'Create orders'],
        ['orders.edit', 'Edit orders (items, prices, dates, discount, delivery fee, driver)'],
        ['orders.status', 'Move orders through statuses (confirm, ready, out for delivery, complete)'],
        ['orders.delivery', 'Update delivery progress (out for delivery, delivered, completed)'],
        ['orders.cancel', 'Cancel orders'],
    ] },
    { group: 'Inventory', items: [
        ['inventory.view', 'See inventory'],
        ['inventory.manage', 'Add, edit, delete items and mark maintenance'],
        ['inventory.categories', 'Manage inventory categories'],
    ] },
    { group: 'Customers', items: [
        ['customers.view', 'See customers and their profiles'],
        ['customers.manage', 'Add and edit customers'],
        ['customers.login', 'Create, reset or remove customer app logins'],
        ['customers.delete', 'Delete customers'],
    ] },
    { group: 'Invoices & payments', items: [
        ['invoices.view', 'See invoices'],
        ['invoices.manage', 'Create, edit, send and cancel invoices'],
        ['payments.view', 'See payments and receipts'],
        ['payments.record', 'Record payments'],
        ['payments.refund', 'Mark payments refunded'],
    ] },
    { group: 'Finance & reports', items: [
        ['finance.view', 'See the Finance page (revenue, tithe, giving, profit)'],
        ['expenses.manage', 'Add, edit and delete expenses'],
        ['expenses.approve', 'Approve expenses'],
        ['reports.view', 'See reports and export them'],
    ] },
    { group: 'SMS & notifications', items: [
        ['sms.view', 'See SMS history'],
        ['sms.send', 'Send SMS and retry failed ones'],
        ['sms.delete', 'Delete SMS history'],
        ['sms.templates', 'Edit SMS templates and language'],
    ] },
    { group: 'Team & settings', items: [
        ['team.view', 'See team members and roles'],
        ['team.manage', 'Invite, edit, deactivate and remove team members; reset their passwords'],
        ['roles.manage', 'Change what each role can do'],
        ['areas.manage', 'Manage service areas'],
        ['settings.manage', 'Change business, policies, payments and notification settings'],
    ] },
];

export const PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.items.map(([key]) => key));
export const STAFF_ROLES = ['Admin', 'Store manager', 'Inventory staff', 'Delivery staff'];

// Defaults match how the roles worked before permissions were editable.
const ALL_BUT = (...excluded) => PERMISSIONS.filter((key) => !excluded.includes(key));
export const DEFAULT_ROLE_PERMISSIONS = {
    Admin: PERMISSIONS,
    'Store manager': ALL_BUT('customers.delete', 'payments.refund', 'sms.delete', 'sms.templates', 'team.manage', 'roles.manage', 'settings.manage', 'orders.deliveries'),
    'Inventory staff': ['overview.view', 'orders.view', 'orders.delivery', 'inventory.view', 'inventory.manage'],
    'Delivery staff': ['overview.view', 'orders.deliveries', 'orders.delivery'],
};

let cache = null;

export async function loadRolePermissions() {
    if (cache) return cache;
    const { rows } = await query('select role, permissions from role_permissions');
    const stored = Object.fromEntries(rows.map((row) => [row.role, row.permissions]));
    cache = Object.fromEntries(STAFF_ROLES.map((role) => [
        role,
        role === 'Admin' ? PERMISSIONS : (stored[role] || DEFAULT_ROLE_PERMISSIONS[role] || []).filter((key) => PERMISSIONS.includes(key)),
    ]));
    return cache;
}

export async function permissionsFor(role) {
    return (await loadRolePermissions())[role] || [];
}

export async function saveRolePermissions(role, permissions) {
    await query(
        `insert into role_permissions (role, permissions, updated_at) values ($1, $2, now())
         on conflict (role) do update set permissions = excluded.permissions, updated_at = now()`,
        [role, permissions],
    );
    cache = null;
    return permissionsFor(role);
}

export const can = (user, key) => user?.kind === 'staff' && (user.role === 'Admin' || (user.permissions || []).includes(key));
