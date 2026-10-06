import { promises as fs } from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR || path.resolve('data');
const dataFile = path.join(dataDir, 'store.json');

const emptyStore = () => ({
    nextOrderNumber: 1050,
    nextSkuNumber: 1001,
    customers: [],
    inventory: [],
    orders: [],
    sessions: [],
});

let cache = null;
let writeQueue = Promise.resolve();

async function load() {
    if (cache) return cache;
    try {
        cache = { ...emptyStore(), ...JSON.parse(await fs.readFile(dataFile, 'utf8')) };
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        cache = emptyStore();
    }
    return cache;
}

async function persist(data) {
    await fs.mkdir(dataDir, { recursive: true });
    const temporary = `${dataFile}.${process.pid}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(data, null, 2));
    await fs.rename(temporary, dataFile);
}

// Reads are served from memory; every mutation runs one at a time and is written atomically.
export async function read() {
    return load();
}

export function update(mutator) {
    const run = writeQueue.then(async () => {
        const data = await load();
        const result = await mutator(data);
        await persist(data);
        return result;
    });
    writeQueue = run.catch(() => {});
    return run;
}
