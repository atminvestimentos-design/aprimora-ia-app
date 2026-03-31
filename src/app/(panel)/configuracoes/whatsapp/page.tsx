'use client';

import { useState, useEffect } from 'react';

export default function WhatsAppConfigPage() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [form, setForm] = useState({
    provider: 'EVOLUTION',
    evolution_instance: '',
  });

  useEffect(() => {
    fetch('/api/config/whatsapp')
      .then(r => r.json())
      .then(d => {
        if (d) setForm({
          provider: d.provider ?? 'EVOLUTION',
          evolution_instance: d.evolution_instance ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/config/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg('Configuração salva com sucesso!');
      } else {
        const d = await res.json();
        setMsg(`Erro: ${d.message}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-cyan-500 text-sm";
  const labelClass = "block text-xs text-white/50 mb-1 uppercase tracking-wide";

  if (loading) return <div className="p-6 text-white/50">Carregando...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Configuração WhatsApp</h1>
      <p className="text-white/40 text-sm mb-6">
        Configure sua instância WhatsApp para enviar e receber mensagens de cobrança.
      </p>

      <form onSubmit={handleSave} className="space-y-5 bg-white/5 rounded-xl border border-white/10 p-6">
        <div>
          <label className={labelClass}>Provider</label>
          <select
            className={fieldClass}
            value={form.provider}
            onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
          >
            <option value="EVOLUTION">Evolution API</option>
            <option value="META" disabled>Meta Cloud API (em breve)</option>
          </select>
        </div>

        {form.provider === 'EVOLUTION' && (
          <div>
            <label className={labelClass}>Nome da Instância</label>
            <input
              className={fieldClass}
              value={form.evolution_instance}
              onChange={e => setForm(f => ({ ...f, evolution_instance: e.target.value }))}
              placeholder="minha-instancia-cobranca"
            />
            <p className="text-white/30 text-xs mt-1">
              Nome único criado no servidor Evolution API. Após salvar, conecte o WhatsApp escaneando o QR code na sua instância.
            </p>
          </div>
        )}

        {msg && (
          <p className={`text-sm ${msg.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
        >
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </form>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 space-y-2">
        <p className="font-medium text-white/70">📋 Como configurar:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Informe o nome da instância criada no Evolution API</li>
          <li>Salve a configuração</li>
          <li>No painel Evolution API, escaneie o QR code da sua instância com o celular</li>
          <li>Certifique-se que o webhook da instância aponta para: <code className="text-cyan-400">/api/webhook/whatsapp</code></li>
        </ol>
      </div>
    </div>
  );
}
