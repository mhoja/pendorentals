import pg from 'pg';

const { Pool, types } = pg;

// Return DATE columns as 'YYYY-MM-DD' strings and counts/sums as numbers.
types.setTypeParser(1082, (value) => value);
types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));

// Connection comes from DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD (or DATABASE_URL).
export const pool = new Pool({
    ...(process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'postgres',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        }),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.DB_POOL_SIZE) || 10,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => console.error('Database connection error', error.message));

export function query(text, params) {
    return pool.query(text, params);
}

export async function transaction(work) {
    const client = await pool.connect();
    try {
        await client.query('begin');
        const result = await work(client);
        await client.query('commit');
        return result;
    } catch (error) {
        await client.query('rollback');
        throw error;
    } finally {
        client.release();
    }
}
