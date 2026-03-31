// GET/POST configuração WhatsApp do tenant autenticado
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { data } = await supabase
    .from('tenant_whatsapp_config')
    .select('id, provider, evolution_instance, is_connected, connected_phone, updated_at')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json(data ?? null);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const body = await req.json();
  const {
    provider = 'EVOLUTION',
    evolution_api_url,
    evolution_api_key,
    evolution_instance,
    meta_phone_number_id,
    meta_access_token,
    meta_waba_id,
  } = body;

  const payload = {
    user_id: user.id,
    provider,
    evolution_api_url: evolution_api_url ?? null,
    evolution_api_key: evolution_api_key ?? null,
    evolution_instance: evolution_instance ?? null,
    meta_phone_number_id: meta_phone_number_id ?? null,
    meta_access_token: meta_access_token ?? null,
    meta_waba_id: meta_waba_id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('tenant_whatsapp_config')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
