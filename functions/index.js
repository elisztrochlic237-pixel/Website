'use strict';

const crypto = require('node:crypto');
const Busboy = require('busboy');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { onRequest } = require('firebase-functions/v2/https');

initializeApp();
const db = getFirestore();
const MAX_BODY = 22 * 1024 * 1024;
const MAX_PHOTO = 5 * 1024 * 1024;
const MAX_PHOTOS = 4;
const MIME_TYPES = {
  'image/jpeg': { extension: 'jpg', signature: b => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: 'png', signature: b => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: 'webp', signature: b => b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' }
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const photos = [];
    let error = null;
    let fileCount = 0;
    const parser = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_PHOTO, files: MAX_PHOTOS, fields: 8, fieldSize: 6000, parts: 16 }
    });
    parser.on('field', (name, value) => {
      if (Object.hasOwn(fields, name)) error ||= 'Please submit each field once.';
      fields[name] = value;
    });
    parser.on('file', (field, stream, info) => {
      fileCount++;
      const chunks = [];
      let size = 0;
      if (field !== 'photos') error ||= 'Unexpected file field.';
      stream.on('data', chunk => { chunks.push(chunk); size += chunk.length; });
      stream.on('limit', () => { error ||= 'Each photo must be under 5 MB.'; });
      stream.on('end', () => {
        if (!info.filename && size === 0) return;
        photos.push({ buffer: Buffer.concat(chunks), type: info.mimeType, size });
      });
    });
    parser.on('filesLimit', () => { error ||= 'Please attach no more than 4 photos.'; });
    parser.on('fieldsLimit', () => { error ||= 'Too many form fields.'; });
    parser.on('partsLimit', () => { error ||= 'Too many form parts.'; });
    parser.on('error', reject);
    parser.on('close', () => {
      if (fileCount > MAX_PHOTOS) error ||= 'Please attach no more than 4 photos.';
      if (error) reject(new Error(error));
      else resolve({ fields, photos });
    });
    parser.end(req.rawBody);
  });
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max + 1) : '';
}

function validate(fields, photos) {
  const name = clean(fields.name, 100);
  const phone = clean(fields.phone, 40);
  const suburb = clean(fields.suburb, 100);
  const preferredTime = clean(fields.preferredTime, 100);
  const description = clean(fields.description, 5000);
  if (!name || name.length > 100 || !phone || phone.length > 40 || !suburb || suburb.length > 100 || description.length < 10 || description.length > 5000 || preferredTime.length > 100) {
    throw new Error('Please complete the required fields with valid details.');
  }
  if (!/^[+()\d\s.-]{7,40}$/.test(phone)) throw new Error('Please enter a valid phone number.');
  for (const photo of photos) {
    const allowed = MIME_TYPES[photo.type];
    if (!allowed || photo.size === 0 || photo.size > MAX_PHOTO || !allowed.signature(photo.buffer)) {
      throw new Error('Photos must be JPG, PNG or WebP files under 5 MB.');
    }
  }
  return { name, phone, suburb, preferredTime, description };
}

async function checkRateLimit(req) {
  const ip = String(req.ip || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const key = crypto.createHash('sha256').update(`${process.env.GCLOUD_PROJECT || ''}:${ip}`).digest('hex');
  const ref = db.collection('enquiryRateLimits').doc(key);
  const now = Date.now();
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const value = snapshot.data() || {};
    const resetAt = typeof value.resetAt === 'number' ? value.resetAt : 0;
    const count = resetAt > now ? (value.count || 0) : 0;
    if (count >= 5) {
      const error = new Error('Too many enquiries from this connection. Please call Eli instead.');
      error.status = 429;
      throw error;
    }
    transaction.set(ref, { count: count + 1, resetAt: resetAt > now ? resetAt : now + 60 * 60 * 1000 });
  });
}

exports.submitEnquiry = onRequest({
  region: 'australia-southeast2',
  memory: '256MiB',
  maxInstances: 5,
  timeoutSeconds: 45,
  invoker: 'public'
}, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  const type = String(req.headers['content-type'] || '');
  if (!type.startsWith('multipart/form-data;')) return res.status(415).json({ message: 'Please use the website enquiry form.' });
  if (!req.rawBody || req.rawBody.length > MAX_BODY) return res.status(413).json({ message: 'The enquiry is too large. Please use smaller photos.' });

  let uploaded = [];
  try {
    const { fields, photos } = await parseForm(req);
    if (fields.companyWebsite) return res.status(200).json({ ok: true });
    const details = validate(fields, photos);
    await checkRateLimit(req);
    const ref = db.collection('enquiries').doc();
    const bucket = photos.length ? getStorage().bucket() : null;
    const fileRecords = [];
    for (const photo of photos) {
      const extension = MIME_TYPES[photo.type].extension;
      const path = `enquiries/${ref.id}/${crypto.randomUUID()}.${extension}`;
      const file = bucket.file(path);
      await file.save(photo.buffer, {
        resumable: false,
        contentType: photo.type,
        metadata: { cacheControl: 'private, no-store', metadata: { enquiryId: ref.id } }
      });
      uploaded.push(file);
      fileRecords.push({ path, contentType: photo.type, size: photo.size });
    }
    await ref.set({ ...details, photos: fileRecords, status: 'new', createdAt: FieldValue.serverTimestamp() });
    return res.status(201).json({ ok: true });
  } catch (error) {
    await Promise.allSettled(uploaded.map(file => file.delete()));
    const expected = /^(Please |Each photo |Photos must |Too many |Unexpected file |The enquiry |A phone |Method )/.test(error.message);
    const status = error.status || (expected ? 400 : 503);
    if (!expected && status !== 429) console.error('Enquiry failed', error);
    return res.status(status).json({ message: expected || status === 429 ? error.message : 'The form is temporarily unavailable.' });
  }
});
