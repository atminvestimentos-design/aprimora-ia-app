// Proxy autenticado para arquivos do GCS — serve mídia privada do bucket
import { NextRequest, NextResponse } from 'next/server';
import { getGCSBucket } from '@/lib/gcs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const filePath = path.join('/');

  const gcs = getGCSBucket();
  if (!gcs) return NextResponse.json({ error: 'Storage não configurado.' }, { status: 500 });

  try {
    const file = gcs.bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });

    const [metadata] = await file.getMetadata();
    const [buffer]   = await file.download();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':  String(metadata.contentType ?? 'application/octet-stream'),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[media proxy] erro:', (err as Error).message);
    return NextResponse.json({ error: 'Erro ao buscar arquivo.' }, { status: 500 });
  }
}
