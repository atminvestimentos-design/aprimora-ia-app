import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  // Parse query parameters
  const url = new URL(req.url);
  const trackedUrlId = url.searchParams.get('tracked_url_id');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('lead_visitors')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Filter by tracked URL if provided
  if (trackedUrlId) {
    query = query.eq('tracked_url_id', trackedUrlId);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    visitors: data,
    total: count,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit)
  });
}
