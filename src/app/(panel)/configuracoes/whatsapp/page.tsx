'use client';

import { useState, useEffect, useRef } from 'react';

type Status = 'loading' | 'not_configured' | 'disconnected' | 'qr' | 'connected' | 'error';

export default function WhatsAppConfigPage() {
  const [status, setStatus]         = useState<Status>('loading');
  const [qrBase64, setQrBase64]     = useState<string | null>(null);
  const [phone, setPhone]           = useState<string | null>(null);
  const [instance, setInstance]     = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { checkStatus(); }, []);

  useEffect(() => {
    if (status === 'qr') {
      pollRef.current = setInterval(async () => {
        const res = await fetch('/api/config/whatsapp/status');
        const d = await res.json();
        if (d.status === 'connected') {
          setStatus('connected');
          setPhone(d.phone);
          clearInterval(pollRef.current!);
        }
      }, 3000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status]);

  async function checkStatus() {
    setStatus('loading');
    try {
      const res = await fetch('/api/config/whatsapp/status');
      const d = await res.json();
      if (d.status === 'connected') { setStatus('connected'); setPhone(d.phone); setInstance(d.instance); }
      else if (d.status === 'not_configured') { setStatus('not_configured'); }
      else { setStatus('disconnected'); setInstance(d.instance); }
    } catch { setStatus('error'); }
  }

  async function handleConnect() {
    setConnecting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/config/whatsapp/connect', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) { setErrorMsg(d.message ?? 'Erro ao conectar.'); return; }
      if (d.status === 'connected') { setStatus('connected'); setPhone(d.phone); }
      else if (d.status === 'qr') { setQrBase64(d.qr); setInstance(d.instanceName); setStatus('qr'); }
    } catch { setErrorMsg('Erro de conexão com o servidor.'); }
    finally { setConnecting(false); }
  }

  async function handleDisconnect() {
    await fetch('/api/config/whatsapp/disconnect', { method: 'POST' }).catch(() => {});
    setStatus('disconnected');
    setPhone(null);
    setQrBase64(null);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">WhatsApp</h1>
      <p className="text-white/50 text-base mb-8">
        Conecte seu número de WhatsApp para enviar e receber mensagens de cobrança diretamente pelo sistema.
      </p>

      {/* Card principal */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-10 flex flex-col items-center text-center gap-7">

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <span className="w-10 h-10 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-white/50 text-lg">Verificando conexão...</p>
          </div>
        )}

        {/* Conectado */}
        {status === 'connected' && (
          <>
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-400 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 font-bold text-2xl">WhatsApp Conectado</p>
              {phone && <p className="text-white/60 text-lg">{phone}</p>}
              {instance && <p className="text-white/30 text-sm">Instância: {instance}</p>}
            </div>
            <div className="w-full pt-2 border-t border-white/10">
              <button
                onClick={handleDisconnect}
                className="mt-4 px-6 py-2.5 text-base text-red-400 border border-red-400/40 rounded-xl hover:bg-red-500/10 transition-colors font-medium"
              >
                Desconectar número
              </button>
            </div>
          </>
        )}

        {/* QR Code */}
        {status === 'qr' && (
          <>
            <div className="space-y-1">
              <p className="text-white font-bold text-2xl">Escaneie o QR Code</p>
              <p className="text-white/50 text-base">
                Abra o WhatsApp no celular → <strong className="text-white/70">Dispositivos conectados</strong> → Conectar dispositivo
              </p>
            </div>
            {qrBase64 ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <img src={qrBase64} alt="QR Code WhatsApp" width={260} height={260} />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center text-white/30">
                Gerando QR code...
              </div>
            )}
            <div className="flex items-center gap-3 text-white/50 text-base">
              <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              Aguardando leitura do QR code...
            </div>
            <button onClick={() => { setStatus('disconnected'); setQrBase64(null); }}
              className="text-white/30 text-sm hover:text-white/60 transition-colors">
              Cancelar
            </button>
          </>
        )}

        {/* Desconectado / não configurado */}
        {(status === 'disconnected' || status === 'not_configured') && (
          <>
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold text-2xl">Nenhum número conectado</p>
              <p className="text-white/50 text-base max-w-sm">
                {status === 'disconnected'
                  ? 'Sua instância existe mas está desconectada. Clique abaixo para reconectar.'
                  : 'Clique em conectar — criaremos a instância e exibiremos o QR code automaticamente.'}
              </p>
              {instance && <p className="text-white/25 text-sm">Instância: {instance}</p>}
            </div>

            {errorMsg && (
              <div className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-base">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg flex items-center gap-3 transition-colors shadow-lg shadow-green-900/30"
            >
              {connecting ? (
                <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Criando instância...</>
              ) : (
                <><span className="text-2xl">📱</span> Conectar WhatsApp</>
              )}
            </button>
          </>
        )}

        {/* Erro */}
        {status === 'error' && (
          <>
            <p className="text-red-400 text-lg">Erro ao verificar status.</p>
            <button onClick={checkStatus} className="text-white/50 text-base underline hover:text-white/70">
              Tentar novamente
            </button>
          </>
        )}
      </div>

      {/* Dicas */}
      <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <p className="text-white/70 font-semibold text-base mb-3">ℹ️ Informações importantes</p>
        {[
          'Cada conta usa um número de WhatsApp dedicado',
          'O número precisa estar ativo no celular para escanear o QR code',
          'Após conectar, o celular pode ficar com a tela desligada normalmente',
          'Mensagens de grupos são ignoradas automaticamente',
          'Não desinstale o WhatsApp do celular enquanto estiver em uso',
        ].map(tip => (
          <div key={tip} className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
            <p className="text-white/50 text-sm">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
