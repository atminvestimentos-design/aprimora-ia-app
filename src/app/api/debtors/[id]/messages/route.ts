// GET mensagens de um devedor (com paginação)
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { id: debtorId } = await params;

  // Verifica se o devedor pertence ao tenant
  const { data: debtor } = await supabase
    .from('debtors')
    .select('id')
    .eq('id', debtorId)
    .eq('user_id', user.id)
    .single();

  if (!debtor) return NextResponse.json({ message: 'Devedor não encontrado.' }, { status: 404 });

  const { data, error } = await supabase
    .from('debt_messages')
    .select('*')
    .eq('debtor_id', debtorId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
