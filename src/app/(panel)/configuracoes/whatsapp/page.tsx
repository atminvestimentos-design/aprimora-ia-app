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

  async function handleDelete() {
    if (!confirm('Tem certeza? Isso vai apagar o número e toda a configuração. Para usar novamente precisará reconectar.')) return;
    await fetch('/api/config/whatsapp/delete', { method: 'POST' }).catch(() => {});
    setStatus('not_configured');
    setPhone(null);
    setQrBase64(null);
    setInstance(null);
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 8 }}>
          CONFIGURAÇÕES
        </p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
          WhatsApp
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
          Conecte seu número de WhatsApp para enviar e receber mensagens de cobrança diretamente pelo sistema.
        </p>
      </div>

      {/* Card principal */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 48,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 28, marginBottom: 24,
      }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
            <span style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#06C8D8', borderRadius: '50%' }}
              className="animate-spin" />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 500 }}>Verificando conexão...</p>
          </div>
        )}

        {/* Conectado */}
        {status === 'connected' && (
          <>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '3px solid rgba(34,197,94,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80', marginBottom: 6 }}>WhatsApp Conectado</p>
              {phone && <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{phone}</p>}
              {instance && <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Instância: {instance}</p>}
            </div>
            <div style={{ width: '100%', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleDisconnect} style={{
                padding: '12px 24px', borderRadius: 10, fontFamily: 'inherit',
                background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                color: '#fde047', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                ⏸ Suspender conexão
              </button>
              <button onClick={handleDelete} style={{
                padding: '12px 24px', borderRadius: 10, fontFamily: 'inherit',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                🗑 Excluir número
              </button>
            </div>
          </>
        )}

        {/* QR Code */}
        {status === 'qr' && (
          <>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Escaneie o QR Code</p>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Abra o WhatsApp no celular →{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Dispositivos conectados</span>{' '}
                → Conectar dispositivo
              </p>
            </div>
            {qrBase64 ? (
              <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <img src={qrBase64} alt="QR Code WhatsApp" width={240} height={240} />
              </div>
            ) : (
              <div style={{ width: 256, height: 256, background: 'rgba(255,255,255,0.05)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem' }}>
                Gerando QR code...
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', fontWeight: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fde047' }} className="animate-pulse" />
              Aguardando leitura do QR code...
            </div>
            <button onClick={() => { setStatus('disconnected'); setQrBase64(null); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 500,
            }} className="hover:text-white/60 transition-colors">
              Cancelar
            </button>
          </>
        )}

        {/* Desconectado / não configurado */}
        {(status === 'disconnected' || status === 'not_configured') && (
          <>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '3px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.25)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Nenhum número conectado</p>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, maxWidth: 360 }}>
                {status === 'disconnected'
                  ? 'Sua instância existe mas está desconectada. Clique abaixo para reconectar.'
                  : 'Clique em conectar — criaremos a instância e exibiremos o QR code automaticamente.'}
              </p>
              {instance && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Instância: {instance}</p>}
            </div>

            {errorMsg && (
              <div style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 500 }}>{errorMsg}</p>
              </div>
            )}

            <button onClick={handleConnect} disabled={connecting} style={{
              padding: '14px 36px', borderRadius: 12, fontFamily: 'inherit',
              background: connecting ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', fontSize: '1rem', fontWeight: 800,
              border: 'none', cursor: connecting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: connecting ? 'none' : '0 4px 20px rgba(22,163,74,0.3)',
              transition: 'opacity 0.2s',
            }} className="hover:opacity-90">
              {connecting ? (
                <>
                  <span style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                  Criando instância...
                </>
              ) : (
                <><span style={{ fontSize: '1.3rem' }}>📱</span> Conectar WhatsApp</>
              )}
            </button>
          </>
        )}

        {/* Erro */}
        {status === 'error' && (
          <>
            <p style={{ color: '#fca5a5', fontSize: '1rem', fontWeight: 600 }}>Erro ao verificar status.</p>
            <button onClick={checkStatus} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', textDecoration: 'underline',
            }} className="hover:text-white/70 transition-colors">
              Tentar novamente
            </button>
          </>
        )}
      </div>

      {/* Dicas */}
      <div style={{
        padding: '24px 28px', borderRadius: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
          INFORMAÇÕES IMPORTANTES
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Cada conta usa um número de WhatsApp dedicado',
            'O número precisa estar ativo no celular para escanear o QR code',
            'Após conectar, o celular pode ficar com a tela desligada normalmente',
            'Mensagens de grupos são ignoradas automaticamente',
            'Não desinstale o WhatsApp do celular enquanto estiver em uso',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #06C8D8, #2563EB)', flexShrink: 0, marginTop: 6 }} />
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
