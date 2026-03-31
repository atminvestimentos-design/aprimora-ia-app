'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type Status = 'loading' | 'not_configured' | 'disconnected' | 'qr' | 'connected' | 'error';

export default function WhatsAppConfigPage() {
  const [status, setStatus]       = useState<Status>('loading');
  const [qrBase64, setQrBase64]   = useState<string | null>(null);
  const [phone, setPhone]         = useState<string | null>(null);
  const [instance, setInstance]   = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const pollRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Verifica status ao carregar
  useEffect(() => {
    checkStatus();
  }, []);

  // Quando QR está visível, fica polling até conectar
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
      if (d.status === 'connected') {
        setStatus('connected');
        setPhone(d.phone);
        setInstance(d.instance);
      } else if (d.status === 'not_configured') {
        setStatus('not_configured');
      } else {
        setStatus('disconnected');
        setInstance(d.instance);
      }
    } catch {
      setStatus('error');
    }
  }

  async function handleConnect() {
    setConnecting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/config/whatsapp/connect', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) { setErrorMsg(d.message ?? 'Erro ao conectar.'); return; }

      if (d.status === 'connected') {
        setStatus('connected');
        setPhone(d.phone);
      } else if (d.status === 'qr') {
        setQrBase64(d.qr);
        setInstance(d.instanceName);
        setStatus('qr');
      }
    } catch {
      setErrorMsg('Erro de conexão com o servidor.');
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!instance) return;
    await fetch(`/api/config/whatsapp/disconnect`, { method: 'POST' }).catch(() => {});
    setStatus('disconnected');
    setPhone(null);
    setQrBase64(null);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">WhatsApp</h1>
      <p className="text-white/40 text-sm mb-8">
        Conecte seu número de WhatsApp para enviar e receber mensagens de cobrança.
      </p>

      <div className="bg-white/5 rounded-xl border border-white/10 p-8 flex flex-col items-center text-center gap-6">

        {/* Loading */}
        {status === 'loading' && (
          <div className="text-white/40 text-sm">Verificando conexão...</div>
        )}

        {/* Conectado */}
        {status === 'connected' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-semibold text-lg">WhatsApp Conectado</p>
              {phone && <p className="text-white/50 text-sm mt-1">{phone}</p>}
              {instance && <p className="text-white/30 text-xs mt-0.5">Instância: {instance}</p>}
            </div>
            <button
              onClick={handleDisconnect}
              className="px-5 py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Desconectar
            </button>
          </>
        )}

        {/* QR Code */}
        {status === 'qr' && (
          <>
            <div>
              <p className="text-white font-semibold mb-1">Escaneie o QR Code</p>
              <p className="text-white/40 text-sm">Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo</p>
            </div>
            {qrBase64 ? (
              <div className="bg-white p-3 rounded-xl">
                <img src={qrBase64} alt="QR Code WhatsApp" width={240} height={240} />
              </div>
            ) : (
              <div className="w-60 h-60 bg-white/10 rounded-xl flex items-center justify-center text-white/30 text-sm">
                Gerando QR code...
              </div>
            )}
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Aguardando leitura...
            </div>
            <button onClick={() => { setStatus('disconnected'); setQrBase64(null); }}
              className="text-white/30 text-xs hover:text-white/50">
              Cancelar
            </button>
          </>
        )}

        {/* Desconectado / não configurado */}
        {(status === 'disconnected' || status === 'not_configured') && (
          <>
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Nenhum número conectado</p>
              <p className="text-white/40 text-sm mt-1">
                {status === 'disconnected'
                  ? 'Sua instância existe mas está desconectada. Reconecte abaixo.'
                  : 'Clique em conectar — criaremos tudo automaticamente.'}
              </p>
              {instance && <p className="text-white/20 text-xs mt-1">Instância: {instance}</p>}
            </div>

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center gap-2"
            >
              {connecting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Criando instância...</>
              ) : (
                <><span className="text-lg">📱</span> Conectar WhatsApp</>
              )}
            </button>
          </>
        )}

        {/* Erro */}
        {status === 'error' && (
          <>
            <p className="text-red-400">Erro ao verificar status.</p>
            <button onClick={checkStatus} className="text-white/50 text-sm underline">Tentar novamente</button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 space-y-1">
        <p>• Cada conta usa um número de WhatsApp dedicado</p>
        <p>• O número precisa estar ativo no celular para escanear</p>
        <p>• Após conectar, o celular pode ficar com a tela desligada normalmente</p>
        <p>• Não desinstale o WhatsApp do celular enquanto estiver em uso</p>
      </div>
    </div>
  );
}
