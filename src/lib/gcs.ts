import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

function appBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function getGCSBucket() {
  const keyJson    = process.env.GCS_KEY_FILE_JSON;
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!keyJson || !bucketName) return null;

  const credentials = JSON.parse(keyJson);
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
  });
  return { bucket: storage.bucket(bucketName), bucketName };
}

export async function uploadBufferToGCS(
  buffer: Buffer,
  mimeType: string,
  extension: string,
  folder = 'debt-media',
): Promise<string | null> {
  const gcs = getGCSBucket();
  if (!gcs) return null;
  try {
    const filePath = `${folder}/${uuidv4()}.${extension}`;
    const file = gcs.bucket.file(filePath);
    await file.save(buffer, { contentType: mimeType, resumable: false });
    return `/api/media/${filePath}`;
  } catch (err) {
    console.error('[gcs] uploadBufferToGCS error:', (err as Error).message);
    return null;
  }
}

export async function downloadBase64FromEvolution(
  messageKey: unknown,
  messageObj: unknown,
  mimeType: string,
  extension: string,
  convertToMp4 = false,
  instanceName: string,
): Promise<string | null> {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;
  if (!evolutionUrl || !evolutionKey) return null;

  const gcs = getGCSBucket();
  if (!gcs) return null;

  try {
    const res = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instanceName}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
      body: JSON.stringify({ message: { key: messageKey, message: messageObj }, convertToMp4 }),
    });

    console.log('[gcs] getBase64FromMediaMessage status:', res.status);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[gcs] getBase64 error body:', errText.slice(0, 200));
      return null;
    }

    const json = await res.json();
    const base64: string | undefined = json.base64 ?? json.data?.base64;
    if (!base64) return null;

    const buffer   = Buffer.from(base64, 'base64');
    const filePath = `debt-media/${uuidv4()}.${extension}`;
    const file     = gcs.bucket.file(filePath);
    await file.save(buffer, { contentType: mimeType, resumable: false });
    return `/api/media/${filePath}`;
  } catch (err) {
    console.error('[gcs] downloadBase64FromEvolution error:', (err as Error).message);
    return null;
  }
}
