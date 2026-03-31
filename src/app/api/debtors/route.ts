// GET lista de devedores do tenant + POST criar devedor
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status');
  const search = req.nextUrl.searchParams.get('q');

  let query = supabase
    .from('debtors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const body = await req.json();
  const { name, phone, whatsapp_phone, document, debt_amount, debt_description, notes } = body;

  if (!name?.trim()) {
    return NextResponse.json({ message: 'Nome é obrigatório.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('debtors')
    .insert({
      user_id: user.id,
      name: name.trim(),
      phone: phone?.trim() || null,
      whatsapp_phone: whatsapp_phone?.replace(/\D/g, '') || null,
      document: document?.trim() || null,
      debt_amount: debt_amount ? Number(debt_amount) : null,
      debt_description: debt_description?.trim() || null,
      notes: notes?.trim() || null,
      status: 'ATIVO',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
