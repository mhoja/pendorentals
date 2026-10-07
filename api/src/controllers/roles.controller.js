import { HttpError } from '../utils/helpers.js';
import { PERMISSIONS, PERMISSION_GROUPS, STAFF_ROLES, DEFAULT_ROLE_PERMISSIONS, loadRolePermissions, saveRolePermissions } from '../services/permissions.service.js';

// GET /api/roles — every permission and what each role currently has.
export async function listRoles(_request, response) {
    const current = await loadRolePermissions();
    response.json({
        groups: PERMISSION_GROUPS.map(({ group, items }) => ({ group, items: items.map(([key, label]) => ({ key, label })) })),
        roles: STAFF_ROLES.map((role) => ({ role, locked: role === 'Admin', permissions: current[role], defaults: DEFAULT_ROLE_PERMISSIONS[role] })),
    });
}

// PUT /api/roles/:role — replace a role's permissions. Admin always keeps everything.
export async function updateRole(request, response) {
    const role = decodeURIComponent(request.params.role);
    if (!STAFF_ROLES.includes(role)) throw new HttpError(404, 'Role not found.');
    if (role === 'Admin') throw new HttpError(400, 'Admin always has every permission.');
    const requested = Array.isArray(request.body?.permissions) ? request.body.permissions : null;
    if (!requested) throw new HttpError(400, 'Send the list of permissions.');
    const unknown = requested.filter((key) => !PERMISSIONS.includes(key));
    if (unknown.length) throw new HttpError(400, `Unknown permission: ${unknown.join(', ')}`);
    const permissions = await saveRolePermissions(role, [...new Set(requested)]);
    response.json({ role, permissions });
}
