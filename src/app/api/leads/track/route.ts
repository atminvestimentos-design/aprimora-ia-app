import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { UAParser } from 'ua-parser-js';

export const dynamic = 'force-dynamic';

interface TrackingPayload {
  tid: string; // tracked_url_id
  url?: string;
  ref?: string; // referrer
  ua?: string; // user agent
  duration?: number; // seconds
  utm?: Record<string, string>;
}

async function getGeolocation(ip: string) {
  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=country,city`);
    if (!res.ok) return { country: null, city: null };
    const data = await res.json();
    return {
      country: data.country || null,
      city: data.city || null
    };
  } catch (e) {
    return { country: null, city: null };
  }
}

function parseUserAgent(ua?: string) {
  if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' };

  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    device: result.device.type || 'desktop',
    browser: result.browser.name || 'unknown',
    os: result.os.name || 'unknown'
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload: TrackingPayload = await req.json();
    const { tid, url, ref, ua, duration, utm } = payload;

    if (!tid) {
      return NextResponse.json({ error: 'Missing tid' }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();

    // Verify tracked URL exists and get user_id
    const { data: trackedUrl, error: urlError } = await supabase
      .from('lead_tracked_urls')
      .select('id, user_id')
      .eq('id', tid)
      .single();

    if (urlError || !trackedUrl) {
      return NextResponse.json({ error: 'Invalid tracked URL' }, { status: 404 });
    }

    // Get visitor IP
    const ip =
      (req.headers.get('x-forwarded-for') || '').split(',')[0] ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    // Get geolocation
    const { country, city } = await getGeolocation(ip);

    // Parse user agent
    const { device, browser, os } = parseUserAgent(ua);

    // Insert visitor record
    const { error: insertError } = await supabase
      .from('lead_visitors')
      .insert({
        user_id: trackedUrl.user_id,
        tracked_url_id: tid,
        url_visited: url || null,
        ip,
        country,
        city,
        device,
        browser,
        os,
        referrer: ref || null,
        duration_seconds: duration || null,
        utm_source: utm?.utm_source || null,
        utm_medium: utm?.utm_medium || null,
        utm_campaign: utm?.utm_campaign || null
      });

    if (insertError) {
      console.error('Lead tracking insert error:', insertError);
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('Lead tracking error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
