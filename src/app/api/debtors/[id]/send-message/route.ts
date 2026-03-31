// Salva mensagem no BD e envia via WhatsApp (texto ou mídia)
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendMessage, sendMedia } from '@/lib/whatsapp';
import { normalizeToSend } from '@/lib/phone';
import { uploadBufferToGCS } from '@/lib/gcs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mimeToMediaType(mime: string): string {
  if (mime.startsWith('image/'))  return 'IMAGE';
  if (mime.startsWith('audio/'))  return 'AUDIO';
  if (mime.startsWith('video/'))  return 'VIDEO';
  return 'DOCUMENT';
}

function mimeToEvolutionType(mime: string): 'image' | 'audio' | 'video' | 'document' {
  if (mime.startsWith('image/'))  return 'image';
  if (mime.startsWith('audio/'))  return 'audio';
  if (mime.startsWith('video/'))  return 'video';
  return 'document';
}

function extensionFromMime(mime: string, fileName: string): string {
  const fromName = fileName.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a',
    'video/mp4': 'mp4', 'video/webm': 'webm',
    'application/pdf': 'pdf',
  };
  return map[mime] ?? 'bin';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { id: debtorId } = await params;

  const { data: debtor } = await supabase
    .from('debtors')
    .select('id, whatsapp_phone, phone')
    .eq('id', debtorId)
    .eq('user_id', user.id)
    .single();

  if (!debtor) return NextResponse.json({ message: 'Devedor não encontrado.' }, { status: 404 });

  const rawNumber = debtor.whatsapp_phone ?? debtor.phone;
  if (!rawNumber) {
    return NextResponse.json({ message: 'Devedor não tem número de WhatsApp cadastrado.' }, { status: 400 });
  }

  const contentType = req.headers.get('content-type') ?? '';
  const isFormData  = contentType.includes('multipart/form-data');

  try {
    if (isFormData) {
      const formData = await req.formData();
      const file     = formData.get('file') as File | null;
      const caption  = (formData.get('caption') as string | null)?.trim() ?? '';

      if (!file) return NextResponse.json({ message: 'Arquivo é obrigatório.' }, { status: 400 });

      const mimeType  = file.type || 'application/octet-stream';
      const fileName  = file.name ?? 'arquivo';
      const extension = extensionFromMime(mimeType, fileName);
      const mediaType = mimeToMediaType(mimeType);
      const buffer    = Buffer.from(await file.arrayBuffer());

      const mediaUrl = await uploadBufferToGCS(buffer, mimeType, extension);
      if (!mediaUrl) {
        return NextResponse.json({ message: 'Falha ao fazer upload do arquivo.' }, { status: 500 });
      }

      const content = caption || `[${mediaType === 'DOCUMENT' ? fileName : mediaType}]`;

      const { data: message } = await supabase
        .from('debt_messages')
        .insert({
          debtor_id: debtorId,
          user_id: user.id,
          direction: 'OUTBOUND',
          content,
          status: 'PENDING',
          media_type: mediaType,
          media_url: mediaUrl,
        })
        .select()
        .single();

      // Envia pelo WhatsApp (fire-and-forget) — passa base64 para não depender de URL pública
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      sendMedia(user.id, normalizeToSend(rawNumber), mediaUrl, mimeToEvolutionType(mimeType), caption || undefined, mediaType === 'DOCUMENT' ? fileName : undefined, base64Data)
        .then(async (waId) => {
          await supabase
            .from('debt_messages')
            .update({ status: waId ? 'SENT' : 'FAILED', whatsapp_message_id: waId })
            .eq('id', message!.id);
        })
        .catch(async () => {
          await supabase.from('debt_messages').update({ status: 'FAILED' }).eq('id', message!.id);
        });

      // Atualiza last_contact_date
      await supabase
        .from('debtors')
        .update({ last_contact_date: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', debtorId);

      return NextResponse.json({ ...message, status: 'PENDING' }, { status: 201 });
    }

    // ── TEXT ──────────────────────────────────────────────────────────────────
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ message: 'Conteúdo é obrigatório.' }, { status: 400 });
    }

    const { data: message } = await supabase
      .from('debt_messages')
      .insert({
        debtor_id: debtorId,
        user_id: user.id,
        direction: 'OUTBOUND',
        content: content.trim(),
        status: 'PENDING',
        media_type: 'TEXT',
      })
      .select()
      .single();

    sendMessage(user.id, normalizeToSend(rawNumber), content.trim())
      .then(async (waId) => {
        await supabase
          .from('debt_messages')
          .update({ status: waId ? 'SENT' : 'FAILED', whatsapp_message_id: waId })
          .eq('id', message!.id);
      })
      .catch(async () => {
        await supabase.from('debt_messages').update({ status: 'FAILED' }).eq('id', message!.id);
      });

    await supabase
      .from('debtors')
      .update({ last_contact_date: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', debtorId);

    return NextResponse.json({ ...message, status: 'PENDING' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao enviar mensagem.', debug: (error as Error).message }, { status: 500 });
  }
}
