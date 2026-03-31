// Endpoint temporário de diagnóstico — remover após testes
import { NextResponse } from 'next/server';
import { getGCSBucket } from '@/lib/gcs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const keyJson    = process.env.GCS_KEY_FILE_JSON;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const projectId  = process.env.GOOGLE_CLOUD_PROJECT_ID;

  if (!keyJson) return NextResponse.json({ error: 'GCS_KEY_FILE_JSON não definida' });
  if (!bucketName) return NextResponse.json({ error: 'GCS_BUCKET_NAME não definida' });

  let parsed: Record<string, string> | null = null;
  try {
    parsed = JSON.parse(keyJson);
  } catch (e) {
    return NextResponse.json({ error: 'GCS_KEY_FILE_JSON inválida (JSON parse falhou)', detail: (e as Error).message });
  }

  const gcs = getGCSBucket();
  if (!gcs) return NextResponse.json({ error: 'getGCSBucket retornou null' });

  try {
    const testBuffer = Buffer.from('teste-permissao');
    const file = gcs.bucket.file('debug/test.txt');
    await file.save(testBuffer, { contentType: 'text/plain', resumable: false });
    await file.delete();
    return NextResponse.json({
      ok: true,
      bucket: bucketName,
      project: projectId,
      client_email: parsed?.client_email,
      private_key_start: parsed?.private_key?.slice(0, 40),
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Falha no upload de teste',
      detail: (err as Error).message,
      client_email: parsed?.client_email,
    });
  }
}
