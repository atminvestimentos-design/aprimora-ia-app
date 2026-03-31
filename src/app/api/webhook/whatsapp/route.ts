// Webhook Evolution API — roteia mensagens recebidas para o tenant correto via evolution_instance
import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { phoneVariants } from '@/lib/phone';
import { downloadBase64FromEvolution } from '@/lib/gcs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function processMessage(
  data: Record<string, unknown>,
  tenantUserId: string,
  instanceName: string,
): Promise<{ id: string } | { skipped: string } | { error: string }> {
  const supabase = createServiceSupabaseClient();
  const key = (data?.key ?? {}) as { remoteJid?: string; fromMe?: boolean; id?: string };

  const isFromMe = key.fromMe === true;

  const eventStatus = data?.status as string | undefined;
  if (isFromMe && (eventStatus === 'DELIVERY_ACK' || eventStatus === 'READ' || eventStatus === 'PLAYED' || eventStatus === 'SERVER_ACK')) {
    return { skipped: `status_update:${eventStatus}` };
  }

  const remoteJid = key.remoteJid ?? '';
  if (remoteJid.endsWith('@lid')) return { skipped: 'lid_format' };
  // Ignora grupos
  if (remoteJid.endsWith('@g.us')) return { skipped: 'group_message' };

  const rawPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace(/@.+/, '');
  if (!rawPhone) return { skipped: 'no_phone' };

  const whatsappMessageId = key.id;
  const messageObj = (data.message ?? {}) as Record<string, unknown>;
  const messageType = (data.messageType as string) ?? Object.keys(messageObj)[0] ?? 'conversation';

  let content   = '';
  let mediaType: string | null = null;
  let mediaUrl:  string | null = null;

  switch (messageType) {
    case 'conversation':
    case 'extendedTextMessage':
      content   = (messageObj.conversation as string) ?? (messageObj.extendedTextMessage as Record<string, string>)?.text ?? '';
      mediaType = 'TEXT';
      break;

    case 'imageMessage': {
      const img = (messageObj.imageMessage ?? {}) as Record<string, string>;
      content   = img.caption?.trim() || '[Imagem]';
      mediaType = 'IMAGE';
      const ext = img.mimetype?.includes('png') ? 'png' : img.mimetype?.includes('webp') ? 'webp' : 'jpg';
      mediaUrl  = await downloadBase64FromEvolution(key, messageObj, img.mimetype ?? 'image/jpeg', ext, false, instanceName);
      break;
    }

    case 'audioMessage':
    case 'pttMessage':
      content   = '[Áudio]';
      mediaType = 'AUDIO';
      mediaUrl  = await downloadBase64FromEvolution(key, messageObj, 'audio/ogg', 'ogg', false, instanceName);
      if (!mediaUrl) mediaUrl = await downloadBase64FromEvolution(key, messageObj, 'audio/mp4', 'mp4', true, instanceName);
      break;

    case 'videoMessage': {
      const video = (messageObj.videoMessage ?? {}) as Record<string, string>;
      content   = video.caption?.trim() || '[Vídeo]';
      mediaType = 'VIDEO';
      const ext = video.mimetype?.includes('webm') ? 'webm' : 'mp4';
      mediaUrl  = await downloadBase64FromEvolution(key, messageObj, video.mimetype ?? 'video/mp4', ext, false, instanceName);
      break;
    }

    case 'documentMessage':
    case 'documentWithCaptionMessage': {
      const docOuter = messageType === 'documentWithCaptionMessage'
        ? (messageObj.documentWithCaptionMessage as Record<string, Record<string, Record<string, unknown>>>)?.message?.documentMessage ?? {}
        : (messageObj.documentMessage ?? {}) as Record<string, unknown>;
      content   = (docOuter.fileName as string) ?? (docOuter.caption as string) ?? '[Documento]';
      mediaType = 'DOCUMENT';
      const ext = ((docOuter.fileName as string) ?? '').split('.').pop() ?? 'bin';
      mediaUrl  = await downloadBase64FromEvolution(key, messageObj, (docOuter.mimetype as string) ?? 'application/octet-stream', ext, false, instanceName);
      break;
    }

    case 'reactionMessage':
      content   = `Reagiu: ${(messageObj.reactionMessage as Record<string, string>)?.text ?? '👍'}`;
      mediaType = 'TEXT';
      break;

    default:
      return { skipped: messageType };
  }

  if (!content.trim() && !mediaUrl) return { skipped: 'empty' };

  // Evita duplicatas
  if (whatsappMessageId) {
    const { data: existing } = await supabase
      .from('debt_messages')
      .select('id')
      .eq('whatsapp_message_id', whatsappMessageId)
      .maybeSingle();
    if (existing) return { skipped: 'duplicate' };
  }

  // Encontra devedor pelo telefone
  const variants = phoneVariants(rawPhone);
  let debtorId: string | null = null;

  for (const variant of variants) {
    const { data: found } = await supabase
      .from('debtors')
      .select('id')
      .eq('user_id', tenantUserId)
      .or(`whatsapp_phone.eq.${variant},phone.eq.${variant}`)
      .maybeSingle() as { data: { id: string } | null };
    if (found) { debtorId = found.id; break; }
  }

  if (!debtorId) {
    console.warn('[webhook] Debtor not found for phone:', rawPhone, 'tenant:', tenantUserId);
    return { skipped: `not_found:${rawPhone}` };
  }

  // Calcula tempo de resposta
  let responseTimeMinutes: number | null = null;
  if (!isFromMe) {
    const { data: lastOutbound } = await supabase
      .from('debt_messages')
      .select('created_at')
      .eq('debtor_id', debtorId)
      .eq('direction', 'OUTBOUND')
      .in('status', ['SENT', 'READ'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { created_at: string } | null };
    if (lastOutbound) {
      responseTimeMinutes = Math.round((Date.now() - new Date(lastOutbound.created_at).getTime()) / 60000);
    }
  }

  // Se fromMe: tenta atualizar PENDING existente
  if (isFromMe && whatsappMessageId) {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: pending } = await supabase
      .from('debt_messages')
      .select('id')
      .eq('debtor_id', debtorId)
      .eq('direction', 'OUTBOUND')
      .eq('status', 'PENDING')
      .is('whatsapp_message_id', null)
      .gte('created_at', twoMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { id: string } | null };

    if (pending) {
      await supabase
        .from('debt_messages')
        .update({ status: 'SENT', whatsapp_message_id: whatsappMessageId })
        .eq('id', pending.id);
      return { id: pending.id };
    }
  }

  const { data: message, error } = await supabase
    .from('debt_messages')
    .insert({
      debtor_id: debtorId,
      user_id: tenantUserId,
      direction: isFromMe ? 'OUTBOUND' : 'INBOUND',
      content: content.trim() || (mediaType ?? 'mensagem'),
      status: 'SENT',
      whatsapp_message_id: whatsappMessageId ?? null,
      media_type: mediaType,
      media_url: mediaUrl,
      response_time_minutes: isFromMe ? null : responseTimeMinutes,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Atualiza last_contact_date do devedor
  await supabase
    .from('debtors')
    .update({ last_contact_date: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', debtorId);

  return { id: message.id };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? req.nextUrl.searchParams.get('secret');
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { event, data, instance } = body;

    // Apenas eventos de mensagem
    if ((event ?? '').toLowerCase() !== 'messages.upsert') {
      return NextResponse.json({ ok: true, skipped: event ?? 'unknown_event' });
    }

    if (!instance) {
      return NextResponse.json({ message: 'instance ausente no payload.' }, { status: 400 });
    }

    // Encontra o tenant pela instância Evolution
    const supabase = createServiceSupabaseClient();
    const { data: config } = await supabase
      .from('tenant_whatsapp_config')
      .select('user_id')
      .eq('evolution_instance', instance)
      .maybeSingle();

    if (!config) {
      console.warn('[webhook] No tenant found for instance:', instance);
      return NextResponse.json({ ok: true, skipped: `unknown_instance:${instance}` });
    }

    const messages: Record<string, unknown>[] = Array.isArray(data) ? data : [data];
    const results = [];
    for (const msg of messages) {
      try {
        results.push(await processMessage(msg, config.user_id, instance));
      } catch (err) {
        results.push({ error: (err as Error).message });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno.', debug: (error as Error).message }, { status: 500 });
  }
}
