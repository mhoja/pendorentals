import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 5001;

app.use(express.json());

app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});