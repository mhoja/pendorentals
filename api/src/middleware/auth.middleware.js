import { query } from '../config/db.js';
import { hashToken } from '../services/auth.service.js';
import { can, permissionsFor } from '../services/permissions.service.js';
import { HttpError, handle } from '../utils/helpers.js';

// Attaches request.user = { kind, id, role?, name, phone } or responds 401.
export const authenticate = handle(async (request, response, next) => {
    const token = (request.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) throw new HttpError(401, 'Please sign in.');
    const tokenHash = hashToken(token);
    const { rows } = await query(
        `select s.kind, s.subject_id,
                st.first_name as s_first, st.last_name as s_last, st.phone as s_phone, st.role, st.status as s_status,
                c.first_name as c_first, c.last_name as c_last, c.phone as c_phone
           from sessions s
           left join staff st on s.kind = 'staff' and st.id = s.subject_id
           left join customers c on s.kind = 'customer' and c.id = s.subject_id
          where s.token_hash = $1 and s.expires_at > now()`,
        [tokenHash],
    );
    const session = rows[0];
    const staffBlocked = session?.kind === 'staff' && (!session.s_first || session.s_status === 'Inactive');
    if (!session || staffBlocked || (session.kind === 'customer' && !session.c_first)) {
        throw new HttpError(401, 'Your session has expired. Please sign in again.');
    }
    request.tokenHash = tokenHash;
    request.user = session.kind === 'staff'
        ? { kind: 'staff', id: session.subject_id, role: session.role, name: `${session.s_first} ${session.s_last}`, phone: session.s_phone, permissions: await permissionsFor(session.role) }
        : { kind: 'customer', id: session.subject_id, name: `${session.c_first} ${session.c_last}`, phone: session.c_phone };
    next();
});

export const requireStaff = (...roles) => (request, _response, next) => {
    if (request.user?.kind !== 'staff') return next(new HttpError(403, 'You do not have access to this.'));
    if (roles.length && !roles.includes(request.user.role)) {
        return next(new HttpError(403, `Only ${roles.join(' or ')} can do this.`));
    }
    return next();
};

// Staff with any one of the given permissions may continue.
export const requirePermission = (...keys) => (request, _response, next) => {
    if (request.user?.kind !== 'staff') return next(new HttpError(403, 'You do not have access to this.'));
    if (keys.length && !keys.some((key) => can(request.user, key))) {
        return next(new HttpError(403, 'Your role does not have permission to do this. Ask an Admin.'));
    }
    return next();
};

export const requireCustomer = (request, _response, next) => {
    if (request.user?.kind !== 'customer') return next(new HttpError(403, 'You do not have access to this.'));
    return next();
};
