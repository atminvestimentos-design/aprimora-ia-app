// Verifica se a instância do tenant está conectada
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { data: config } = await supabase
    .from('tenant_whatsapp_config')
    .select('evolution_instance, is_connected, connected_phone')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!config?.evolution_instance) {
    return NextResponse.json({ status: 'not_configured' });
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ status: 'not_configured' });

  const res = await fetch(`${evolutionUrl}/instance/connectionState/${config.evolution_instance}`, {
    headers: { apikey: evolutionKey },
  });

  if (!res.ok) return NextResponse.json({ status: 'disconnected' });

  const data = await res.json();
  const state: string = data?.instance?.state ?? data?.state ?? 'unknown';
  const connected = state === 'open';

  if (connected && !config.is_connected) {
    const phone = data?.instance?.profileName ?? data?.instance?.wuid ?? null;
    await supabase
      .from('tenant_whatsapp_config')
      .update({ is_connected: true, connected_phone: phone, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    return NextResponse.json({ status: 'connected', phone });
  }

  if (!connected && config.is_connected) {
    await supabase
      .from('tenant_whatsapp_config')
      .update({ is_connected: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  }

  return NextResponse.json({
    status: connected ? 'connected' : state,
    phone: config.connected_phone,
    instance: config.evolution_instance,
  });
}
