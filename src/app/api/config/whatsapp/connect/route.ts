// Cria instância na Evolution API (se não existir) e retorna QR code
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function emailToInstance(email: string): string {
  // "joao.silva@gmail.com" → "cobranca-joaosilva-gmail"
  return 'cobranca-' + email
    .toLowerCase()
    .replace('@', '-')
    .replace(/\.[^.-]+$/, '') // remove .com/.net do final
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40);
}

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;
  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ message: 'Evolution API não configurada no servidor.' }, { status: 500 });
  }

  const instanceName = emailToInstance(user.email!);

  // 1. Verifica se instância já existe
  const checkRes = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
    headers: { apikey: evolutionKey },
  });
  const instances: { instance: { instanceName: string; state?: string } }[] = checkRes.ok ? await checkRes.json() : [];
  const existing = instances.find(i => i.instance?.instanceName === instanceName);

  if (!existing) {
    // 2. Cria a instância
    const createRes = await fetch(`${evolutionUrl}/instance/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        // Configurações padrão de segurança e comportamento
        rejectCall: true,           // rejeita chamadas automaticamente
        msgCall: 'Não atendemos chamadas por este número. Por favor, envie uma mensagem.',
        groupsIgnore: true,         // ignora mensagens de grupos
        alwaysOnline: false,
        readMessages: false,        // não marca como lido automaticamente
        readStatus: false,          // não envia confirmação de leitura (tique azul)
        syncFullHistory: false,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('[connect] create instance error:', err);
      return NextResponse.json({ message: 'Erro ao criar instância.' }, { status: 500 });
    }
  }

  // 3. Configura webhook para apontar para o aprimora-ia-app
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (appUrl) {
    await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
      body: JSON.stringify({
        url: `${appUrl}/api/webhook/whatsapp`,
        webhook_by_events: false,
        webhook_base64: false,
        events: ['MESSAGES_UPSERT'],
      }),
    }).catch(() => {}); // não bloqueia se falhar
  }

  // 4. Salva config no banco (upsert)
  await supabase
    .from('tenant_whatsapp_config')
    .upsert({
      user_id: user.id,
      provider: 'EVOLUTION',
      evolution_api_url: evolutionUrl,
      evolution_api_key: evolutionKey,
      evolution_instance: instanceName,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  // 5. Busca QR code
  const qrRes = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
    headers: { apikey: evolutionKey },
  });

  if (!qrRes.ok) {
    // Pode já estar conectado
    const stateRes = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
      headers: { apikey: evolutionKey },
    });
    const stateData = stateRes.ok ? await stateRes.json() : {};
    const state = stateData?.instance?.state ?? stateData?.state ?? 'unknown';
    if (state === 'open') {
      const phone = stateData?.instance?.profileName ?? stateData?.instance?.wuid ?? null;
      await supabase
        .from('tenant_whatsapp_config')
        .update({ is_connected: true, connected_phone: phone, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      return NextResponse.json({ status: 'connected', phone });
    }
    return NextResponse.json({ message: 'Erro ao obter QR code.' }, { status: 500 });
  }

  const qrData = await qrRes.json();
  const qrBase64: string | null = qrData?.base64 ?? qrData?.qrcode?.base64 ?? null;
  const qrCode:   string | null = qrData?.code   ?? qrData?.qrcode?.code   ?? null;

  return NextResponse.json({ status: 'qr', qr: qrBase64, code: qrCode, instanceName });
}
