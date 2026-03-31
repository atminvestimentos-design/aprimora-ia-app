// Camada abstrata de envio WhatsApp — suporta Evolution API (e futuramente Meta Cloud API).
// Lê a config do tenant no banco para decidir qual provider usar.
import { createServiceSupabaseClient } from '@/lib/supabase/service';

interface TenantConfig {
  provider: 'EVOLUTION' | 'META';
  evolution_api_url?: string | null;
  evolution_api_key?: string | null;
  evolution_instance?: string | null;
  meta_phone_number_id?: string | null;
  meta_access_token?: string | null;
}

async function getTenantConfig(tenantUserId: string): Promise<TenantConfig | null> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from('tenant_whatsapp_config')
    .select('provider, evolution_api_url, evolution_api_key, evolution_instance, meta_phone_number_id, meta_access_token')
    .eq('user_id', tenantUserId)
    .single();
  return data ?? null;
}

function ensureE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

// ─── Evolution API ────────────────────────────────────────────────────────────

async function evolutionSendText(cfg: TenantConfig, to: string, text: string): Promise<string | null> {
  const url      = cfg.evolution_api_url ?? process.env.EVOLUTION_API_URL;
  const apiKey   = cfg.evolution_api_key ?? process.env.EVOLUTION_API_KEY;
  const instance = cfg.evolution_instance;
  if (!url || !apiKey || !instance) return null;

  const res = await fetch(`${url}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey },
    body: JSON.stringify({ number: ensureE164(to), text }),
  });
  const rj = await res.json().catch(() => ({}));
  return rj?.key?.id ?? null;
}

async function evolutionSendMedia(
  cfg: TenantConfig,
  to: string,
  mediaUrl: string,
  mediatype: 'image' | 'audio' | 'video' | 'document',
  caption?: string,
  fileName?: string,
  base64Data?: string,
): Promise<string | null> {
  const url      = cfg.evolution_api_url ?? process.env.EVOLUTION_API_URL;
  const apiKey   = cfg.evolution_api_key ?? process.env.EVOLUTION_API_KEY;
  const instance = cfg.evolution_instance;
  if (!url || !apiKey || !instance) return null;

  // Prefers base64 data URI to avoid needing a publicly accessible URL
  const mediaPayload = base64Data ?? mediaUrl;

  const endpoint = mediatype === 'audio'
    ? `${url}/message/sendWhatsAppAudio/${instance}`
    : `${url}/message/sendMedia/${instance}`;

  const body = mediatype === 'audio'
    ? { number: ensureE164(to), audio: mediaPayload, encoding: true, delay: 500 }
    : { number: ensureE164(to), mediatype, media: mediaPayload, caption, fileName };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey },
    body: JSON.stringify(body),
  });
  const rj = await res.json().catch(() => ({}));
  console.log('[whatsapp] sendMedia response', res.status, JSON.stringify(rj).slice(0, 300));
  return rj?.key?.id ?? null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Envia mensagem de texto para um devedor.
 * @returns whatsappMessageId ou null em caso de falha
 */
export async function sendMessage(tenantUserId: string, to: string, text: string): Promise<string | null> {
  const cfg = await getTenantConfig(tenantUserId);
  if (!cfg) {
    console.warn('[whatsapp] No config found for tenant:', tenantUserId);
    return null;
  }

  if (cfg.provider === 'EVOLUTION') {
    return evolutionSendText(cfg, to, text);
  }

  // TODO: Meta Cloud API
  console.warn('[whatsapp] Meta Cloud API not yet implemented');
  return null;
}

/**
 * Envia mídia (imagem, áudio, vídeo, documento) para um devedor.
 */
export async function sendMedia(
  tenantUserId: string,
  to: string,
  mediaUrl: string,
  mediatype: 'image' | 'audio' | 'video' | 'document',
  caption?: string,
  fileName?: string,
  base64Data?: string,
): Promise<string | null> {
  const cfg = await getTenantConfig(tenantUserId);
  if (!cfg) {
    console.warn('[whatsapp] No config found for tenant:', tenantUserId);
    return null;
  }

  if (cfg.provider === 'EVOLUTION') {
    return evolutionSendMedia(cfg, to, mediaUrl, mediatype, caption, fileName, base64Data);
  }

  console.warn('[whatsapp] Meta Cloud API not yet implemented');
  return null;
}
