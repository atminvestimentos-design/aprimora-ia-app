// Retorna todos os devedores com WhatsApp para a tela de chat
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function countUnread(messages: { direction: string }[]): number {
  let count = 0;
  for (const m of messages) {
    if (m.direction === 'OUTBOUND') break;
    count++;
  }
  return count;
}

function msgPreview(msg: { content: string; direction: string; created_at: string; status: string; media_type: string | null } | undefined) {
  if (!msg) return null;
  const text =
    msg.media_type === 'IMAGE'    ? '📷 Imagem'
    : msg.media_type === 'AUDIO'  ? '🎵 Áudio'
    : msg.media_type === 'VIDEO'  ? '🎬 Vídeo'
    : msg.media_type === 'DOCUMENT' ? '📄 Documento'
    : msg.content;
  return { text, direction: msg.direction, createdAt: msg.created_at, status: msg.status };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { data: debtors, error } = await supabase
    .from('debtors')
    .select(`
      id, name, whatsapp_phone, phone, status, debt_amount,
      debt_messages (
        id, direction, content, media_type, status, created_at
      )
    `)
    .eq('user_id', user.id)
    .or('whatsapp_phone.not.is.null,phone.not.is.null')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const contacts = (debtors ?? []).map(d => {
    // Sort messages desc by created_at for unread count
    const msgs = [...(d.debt_messages ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMsg = msgs[0];
    return {
      id: d.id,
      name: d.name,
      whatsappPhone: d.whatsapp_phone ?? d.phone,
      status: d.status,
      debtAmount: d.debt_amount,
      lastMessage: msgPreview(lastMsg),
      lastActivityAt: lastMsg?.created_at ?? null,
      unreadCount: countUnread(msgs),
    };
  });

  // Sort: com mensagens primeiro (mais recente), depois por nome
  contacts.sort((a, b) => {
    if (a.lastActivityAt && b.lastActivityAt)
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    if (a.lastActivityAt) return -1;
    if (b.lastActivityAt) return 1;
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  return NextResponse.json(contacts);
}
