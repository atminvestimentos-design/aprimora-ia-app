// Deleta completamente a instância na Evolution API e remove config do banco
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { data: config } = await supabase
    .from('tenant_whatsapp_config')
    .select('evolution_instance')
    .eq('user_id', user.id)
    .maybeSingle();

  if (config?.evolution_instance) {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    if (evolutionUrl && evolutionKey) {
      await fetch(`${evolutionUrl}/instance/delete/${config.evolution_instance}`, {
        method: 'DELETE',
        headers: { apikey: evolutionKey },
      }).catch(() => {});
    }
  }

  await supabase
    .from('tenant_whatsapp_config')
    .delete()
    .eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
