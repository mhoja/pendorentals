import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Files live in the S3 bucket (AWS_S3_BUCKET) under the "pendodoc/" folder. The bucket is private,
// so the API reads files back itself; the database keeps each file's key and link.
const PREFIX = 'pendodoc/';
const bucket = () => process.env.AWS_S3_BUCKET;
let client = null;
const s3 = () => {
    if (!client) client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    return client;
};

export const storageConfigured = () => Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && bucket());

export const objectUrl = (key) => `https://${bucket()}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key.split('/').map(encodeURIComponent).join('/')}`;

export async function putFile(name, body, contentType) {
    const key = `${PREFIX}${name}`;
    await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType, CacheControl: 'private, max-age=31536000, immutable' }));
    return { key, url: objectUrl(key) };
}

// Keys are never reused (each upload gets a new name), so a file can be cached once read.
const cache = new Map();
export async function readFileAsDataUrl(key) {
    if (!key || !key.startsWith(PREFIX)) return null;
    if (cache.has(key)) return cache.get(key);
    const object = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    const bytes = Buffer.from(await object.Body.transformToByteArray());
    const dataUrl = `data:${object.ContentType || 'image/png'};base64,${bytes.toString('base64')}`;
    if (cache.size > 50) cache.clear();
    cache.set(key, dataUrl);
    return dataUrl;
}

export async function removeFile(key) {
    if (!key || !key.startsWith(PREFIX)) return;
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    cache.delete(key);
}
