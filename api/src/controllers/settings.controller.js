import { can } from '../services/permissions.service.js';
import { HttpError } from '../utils/helpers.js';
import { getSettings, saveSettings } from '../services/settings.service.js';
import { getGatewayState, setGatewayConnected, smsConfigured, smsProvider, verifyGateway } from '../services/sms.service.js';

// GET /api/settings
export async function getWorkspaceSettings(_request, response) {
    response.json({ settings: await getSettings(), smsConfigured: smsConfigured() });
}

// PUT /api/settings
export async function updateWorkspaceSettings(request, response) {
    const body = request.body?.settings;
    if (!body || typeof body !== 'object') throw new HttpError(400, 'Nothing to save.');
    const templateKeys = ['smsTemplates', 'smsTemplatesSw', 'smsLanguage'];
    const onlyTemplates = Object.keys(body).every((key) => templateKeys.includes(key));
    if (!can(request.user, 'settings.manage') && !(onlyTemplates && can(request.user, 'sms.templates'))) {
        throw new HttpError(403, onlyTemplates ? 'Your role can’t edit SMS templates.' : 'Your role can’t change settings.');
    }
    const tithe = Number(body.tithePercent);
    if (body.tithePercent !== undefined && !(tithe >= 0 && tithe <= 100)) throw new HttpError(400, 'Tithe must be between 0 and 100%.');
    const giving = Number(body.givingPercent);
    if (body.givingPercent !== undefined && !(giving >= 0 && giving <= 100)) throw new HttpError(400, 'Giving must be between 0 and 100%.');
    response.json({ settings: await saveSettings(body) });
}

async function gatewayStatus() {
    const state = await getGatewayState();
    return {
        provider: smsProvider() || 'eHub',
        configured: smsConfigured(),
        connected: smsConfigured() && state.connected,
        // The approved sender name only; keys never leave the server.
        sender: smsProvider() === 'Beem' ? process.env.BEEM_SENDER_ID : process.env.EHUB_SENDER_ID || null,
        changedAt: state.changedAt,
        changedBy: state.changedBy,
    };
}

// GET /api/integrations/sms
export async function getSmsGateway(_request, response) {
    response.json({ gateway: await gatewayStatus() });
}

// POST /api/integrations/sms/connect — checks the keys with the gateway, then allows sending.
export async function connectSmsGateway(request, response) {
    const check = await verifyGateway();
    if (!check.ok) throw new HttpError(400, `Could not connect: ${check.error}`);
    await setGatewayConnected(true, request.user.name);
    response.json({ gateway: await gatewayStatus() });
}

// POST /api/integrations/sms/disconnect — stops all SMS until connected again.
export async function disconnectSmsGateway(request, response) {
    await setGatewayConnected(false, request.user.name);
    response.json({ gateway: await gatewayStatus() });
}
