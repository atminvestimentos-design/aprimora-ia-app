'use client';

import { useState, useEffect, useCallback } from 'react';

interface TrackedUrl {
  id: string;
  url: string;
  label: string;
  created_at: string;
}

interface Visitor {
  id: string;
  ip: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  referrer: string;
  duration_seconds: number;
  created_at: string;
}

interface VisitorsResponse {
  visitors: Visitor[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function LeadsPage() {
  const [urls, setUrls] = useState<TrackedUrl[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedUrlId, setSelectedUrlId] = useState<string>('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load URLs on mount
  useEffect(() => {
    loadUrls();
  }, []);

  // Load visitors when selectedUrlId changes
  useEffect(() => {
    if (selectedUrlId) {
      loadVisitors();
      const interval = setInterval(loadVisitors, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUrlId]);

  const loadUrls = async () => {
    try {
      const response = await fetch('/api/leads/urls');
      if (!response.ok) throw new Error('Failed to load URLs');
      const data = await response.json();
      setUrls(data);
      if (data.length > 0) {
        setSelectedUrlId(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading URLs:', err);
      showMessage('Erro ao carregar URLs', 'error');
      setLoading(false);
    }
  };

  const loadVisitors = useCallback(async () => {
    if (!selectedUrlId) return;
    try {
      const response = await fetch(`/api/leads/visitors?tracked_url_id=${selectedUrlId}&limit=100`);
      if (!response.ok) throw new Error('Failed to load visitors');
      const data: VisitorsResponse = await response.json();
      setVisitors(data.visitors);
    } catch (err) {
      console.error('Error loading visitors:', err);
    }
  }, [selectedUrlId]);

  const saveUrl = async () => {
    if (!newUrl.trim()) {
      showMessage('Digite uma URL válida', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });

      if (!response.ok) throw new Error('Failed to save URL');

      const data = await response.json();
      setUrls([...urls, data]);
      setSelectedUrlId(data.id);
      setNewUrl('');
      showMessage('URL salva com sucesso!', 'success');
    } catch (err) {
      console.error('Error saving URL:', err);
      showMessage('Erro ao salvar URL', 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateSnippet = (urlId: string) => {
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'app.aprimoraia.com.br';
    return `<!-- Aprimora IA — Rastreador de Leads -->
<script>
(function() {
  var t = Date.now();
  fetch('https://${domain}/api/leads/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tid: '${urlId}',
      url: location.href,
      ref: document.referrer,
      ua: navigator.userAgent,
      utm: Object.fromEntries(new URLSearchParams(location.search))
    })
  });
  window.addEventListener('beforeunload', function() {
    navigator.sendBeacon('https://${domain}/api/leads/track',
      JSON.stringify({ tid: '${urlId}', duration: Math.round((Date.now()-t)/1000) }));
  });
})();
</script>`;
  };

  const copySnippet = async () => {
    if (!selectedUrlId) return;
    try {
      await navigator.clipboard.writeText(generateSnippet(selectedUrlId));
      showMessage('Código copiado!', 'success');
    } catch {
      showMessage('Erro ao copiar', 'error');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="px-4 py-8 md:px-10 md:py-12">
      {/* Header */}
      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 10 }}>
        CAPTAÇÃO
      </p>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 30 }}>
        📋 Leads
      </h1>

      {/* Message Toast */}
      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '6px',
          backgroundColor: message.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#34d399' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? '#34d399' : '#ef4444'}`,
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Card: Add URL */}
        <div style={{
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            🔗 Monitorar Nova URL
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <input
              type="url"
              placeholder="https://seu-site.com.br/login"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveUrl()}
              style={{
                padding: '12px',
                border: '1px solid #30363d',
                background: '#161b22',
                color: '#e6edf3',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={saveUrl}
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: '#06C8D8',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontSize: '0.95rem'
              }}
            >
              {saving ? '⏳ Salvando...' : '✅ Salvar URL'}
            </button>
          </div>
        </div>

        {/* Card: Select & Tracking Code */}
        {urls.length > 0 && (
          <>
            <div style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                📡 Selecionar URL
              </h2>
              <select
                value={selectedUrlId}
                onChange={(e) => setSelectedUrlId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #30363d',
                  background: '#161b22',
                  color: '#e6edf3',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              >
                {urls.map(url => (
                  <option key={url.id} value={url.id}>
                    {url.label || url.url}
                  </option>
                ))}
              </select>
            </div>

            {/* Tracking Snippet */}
            <div style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                💻 Código de Rastreamento
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                Copie e cole este código no HTML da sua URL monitorada (antes da tag &lt;/body&gt;):
              </p>
              <pre style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '16px',
                overflow: 'auto',
                color: '#8b949e',
                fontSize: '0.8rem',
                marginBottom: '12px',
                lineHeight: 1.4
              }}>
                <code>{generateSnippet(selectedUrlId)}</code>
              </pre>
              <button
                onClick={copySnippet}
                style={{
                  padding: '10px 20px',
                  background: '#06C8D8',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                📋 Copiar Código
              </button>
            </div>

            {/* Visitors Table */}
            <div style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '24px',
              overflowX: 'auto'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                👥 Visitantes ({visitors.length})
              </h2>
              {visitors.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '32px 0' }}>
                  Nenhum visitante ainda. Adicione o código de rastreamento à sua página!
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #30363d' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>IP</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Localização</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Dispositivo</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Browser</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Origem</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Tempo (s)</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#8b949e' }}>Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map(visitor => (
                        <tr key={visitor.id} style={{ borderBottom: '1px solid #30363d' }}>
                          <td style={{ padding: '12px', color: '#e6edf3', fontFamily: 'monospace' }}>{visitor.ip}</td>
                          <td style={{ padding: '12px', color: '#e6edf3' }}>
                            {visitor.city || visitor.country ? `${visitor.city || '?'}, ${visitor.country || '?'}` : '?'}
                          </td>
                          <td style={{ padding: '12px', color: '#e6edf3' }}>{visitor.device}</td>
                          <td style={{ padding: '12px', color: '#e6edf3' }}>{visitor.browser}</td>
                          <td style={{ padding: '12px', color: '#8b949e', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {visitor.referrer ? new URL(visitor.referrer).hostname : '(direto)'}
                          </td>
                          <td style={{ padding: '12px', color: '#e6edf3' }}>{visitor.duration_seconds || '-'}</td>
                          <td style={{ padding: '12px', color: '#6a737d', fontSize: '0.85rem' }}>
                            {new Date(visitor.created_at).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && urls.length === 0 && (
          <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
              Comece adicionando uma URL para monitorar seus visitantes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
