import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('lead_tracked_urls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const body = await req.json();
  const { url, label } = body;

  if (!url) {
    return NextResponse.json({ message: 'URL é obrigatória.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('lead_tracked_urls')
    .insert({
      user_id: user.id,
      url,
      label: label || null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
