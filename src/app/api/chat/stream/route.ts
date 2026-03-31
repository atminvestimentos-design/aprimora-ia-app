// SSE endpoint: empurra novas mensagens para o cliente em tempo real (~1-2s de latência)
import { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLL_INTERVAL_MS = 1500;

export async function GET(req: NextRequest) {
  const debtorId = req.nextUrl.searchParams.get('debtorId');
  if (!debtorId) return new Response('debtorId é obrigatório', { status: 400 });

  const encoder = new TextEncoder();
  const supabase = createServiceSupabaseClient();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCount = 0;

      try {
        const { count } = await supabase
          .from('debt_messages')
          .select('*', { count: 'exact', head: true })
          .eq('debtor_id', debtorId);
        lastCount = count ?? 0;
      } catch { /* ignora */ }

      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* cliente desconectou */ }
      };

      let heartbeatCount = 0;

      const interval = setInterval(async () => {
        if (req.signal.aborted) {
          clearInterval(interval);
          try { controller.close(); } catch { /* já fechado */ }
          return;
        }

        heartbeatCount++;
        if (heartbeatCount % 13 === 0) {
          try { controller.enqueue(encoder.encode(': heartbeat\n\n')); } catch { /* ignora */ }
        }

        try {
          const { count: newCount } = await supabase
            .from('debt_messages')
            .select('*', { count: 'exact', head: true })
            .eq('debtor_id', debtorId);

          if ((newCount ?? 0) > lastCount) {
            lastCount = newCount ?? lastCount;
            send({ type: 'new_messages' });
          }
        } catch { /* ignora erros transientes */ }
      }, POLL_INTERVAL_MS);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* já fechado */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
