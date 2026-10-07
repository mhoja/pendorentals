import { can } from '../services/permissions.service.js';
import { HttpError } from '../utils/helpers.js';
import { getSettings, saveSettings } from '../services/settings.service.js';
import { smsConfigured } from '../services/sms.service.js';

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
