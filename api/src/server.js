import 'dotenv/config';
import express from 'express';
import { pool } from './config/db.js';
import { migrate } from './database/migrations.js';
import { ensureAdmin, importLegacyStore } from './database/bootstrap.js';
import { HttpError } from './utils/helpers.js';
import { smsConfigured, smsProvider } from './services/sms.service.js';
import publicRoutes from './routes/public.routes.js';
import authRoutes from './routes/auth.routes.js';
import portalRoutes from './routes/portal.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import areaRoutes from './routes/areas.routes.js';
import roleRoutes from './routes/roles.routes.js';
import orderRoutes from './routes/orders.routes.js';
import customerRoutes from './routes/customers.routes.js';
import billingRoutes from './routes/billing.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import teamRoutes from './routes/team.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import messageRoutes from './routes/messages.routes.js';
import insightRoutes from './routes/insights.routes.js';
import notificationRoutes from './routes/notifications.routes.js';

const app = express();
const port = Number(process.env.PORT) || 5001;

app.set('trust proxy', 'loopback');
// Signature images (up to 1 MB, sent as base64) need a bigger body than everything else.
const smallJson = express.json({ limit: '100kb' });
const uploadJson = express.json({ limit: '2mb' });
app.use((request, response, next) => (request.path === '/api/settings/signature' ? uploadJson : smallJson)(request, response, next));

for (const routes of [
    publicRoutes, authRoutes, portalRoutes, inventoryRoutes, categoryRoutes, areaRoutes, orderRoutes, customerRoutes,
    billingRoutes, expenseRoutes, teamRoutes, roleRoutes, settingsRoutes, messageRoutes, insightRoutes, notificationRoutes,
]) {
    app.use('/api', routes);
}

app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Not found.' });
});

app.use((error, _request, response, _next) => {
    if (error instanceof HttpError) {
        response.status(error.status).json({ error: error.message, ...error.extra });
        return;
    }
    if (error.type === 'entity.parse.failed') {
        response.status(400).json({ error: 'Invalid request.' });
        return;
    }
    if (error.code === '23505') {
        response.status(409).json({ error: 'That already exists.' });
        return;
    }
    console.error(error);
    response.status(500).json({ error: 'Something went wrong. Please try again.' });
});

async function start() {
    await migrate();
    await ensureAdmin();
    await importLegacyStore();
    const server = app.listen(port, () => {
        console.log(`API listening on http://localhost:${port} (SMS ${smsConfigured() ? `via ${smsProvider()}` : 'not configured'})`);
    });
    const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

start().catch((error) => {
    console.error('API failed to start:', error.message);
    process.exit(1);
});
