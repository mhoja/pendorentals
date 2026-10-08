import { query } from '../config/db.js';
import { HttpError } from '../utils/helpers.js';
import { putFile, readFileAsDataUrl, storageConfigured } from './storage.service.js';

// The business signature: one image uploaded in Settings → Business profile, used to sign invoices.
// The file is in S3 (pendodoc/signatures/…); its key and link are kept in settings under 'business_signature'.
export async function getBusinessSignature() {
    const { rows } = await query("select value from settings where key = 'business_signature'");
    const stored = rows[0]?.value;
    return stored?.key ? stored : null;
}

const TYPES = {
    'image/png': { ext: 'png', magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
    'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    'image/webp': { ext: 'webp', magic: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
};
export const MAX_SIGNATURE_BYTES = 1024 * 1024;

export async function saveBusinessSignature(dataUrl, user) {
    if (!storageConfigured()) throw new HttpError(503, 'File storage is not set up on the server (AWS keys missing).');
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
    if (!match) throw new HttpError(400, 'Choose a PNG, JPG or WebP image of the signature.');
    const type = TYPES[match[1]];
    const bytes = Buffer.from(match[2], 'base64');
    if (!type.magic(bytes)) throw new HttpError(400, 'That file is not a valid image. Choose a PNG, JPG or WebP picture.');
    if (bytes.length < 200) throw new HttpError(400, 'The image is too small. Choose a clear picture of the signature.');
    if (bytes.length > MAX_SIGNATURE_BYTES) throw new HttpError(400, 'The image is larger than 1 MB. Choose a smaller picture.');
    const { key, url } = await putFile(`signatures/business-signature-${Date.now()}.${type.ext}`, bytes, match[1]);
    const value = { key, url, contentType: match[1], size: bytes.length, uploadedAt: new Date().toISOString(), uploadedBy: user.name };
    await query(
        `insert into settings (key, value, updated_at) values ('business_signature', $1, now())
         on conflict (key) do update set value = excluded.value, updated_at = now()`,
        [value],
    );
    return value;
}

// Removing only stops new invoices being signed with it; the file stays in S3 for invoices already signed.
export async function clearBusinessSignature() {
    await query("delete from settings where key = 'business_signature'");
}

// The signature as shown on screen (image as a data URL, read from S3).
export async function businessSignatureView() {
    const signature = await getBusinessSignature();
    if (!signature) return null;
    const image = await readFileAsDataUrl(signature.key).catch(() => null);
    const { rows: [counts] } = await query(
        `select count(*) filter (where signed_at is not null and signature_key is distinct from $1)::int as outdated,
                count(*) filter (where signed_at is null)::int as unsigned
           from invoices where status <> 'Cancelled'`,
        [signature.key],
    );
    return { key: signature.key, url: signature.url, uploadedAt: signature.uploadedAt, uploadedBy: signature.uploadedBy, image, outdated: counts.outdated, unsigned: counts.unsigned };
}
