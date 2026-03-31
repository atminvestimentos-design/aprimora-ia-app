// GET / PUT / DELETE devedor por ID
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase
    .from('debtors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ message: 'Devedor não encontrado.' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, phone, whatsapp_phone, document, debt_amount, debt_description, notes, status } = body;

  const { data, error } = await supabase
    .from('debtors')
    .update({
      name: name?.trim(),
      phone: phone?.trim() || null,
      whatsapp_phone: whatsapp_phone?.replace(/\D/g, '') || null,
      document: document?.trim() || null,
      debt_amount: debt_amount != null ? Number(debt_amount) : null,
      debt_description: debt_description?.trim() || null,
      notes: notes?.trim() || null,
      status: status ?? 'ATIVO',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase
    .from('debtors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
