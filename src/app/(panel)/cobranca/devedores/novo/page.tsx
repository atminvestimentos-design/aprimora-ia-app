'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoDevedorPage() {
  const router = useRouter();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    name: '',
    document: '',
    phone: '',
    whatsapp_phone: '',
    debt_amount: '',
    debt_description: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/debtors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          debt_amount: form.debt_amount ? Number(form.debt_amount.replace(',', '.')) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? 'Erro ao salvar.');
        return;
      }
      router.push('/cobranca/devedores');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-cyan-500 text-sm";
  const labelClass = "block text-xs text-white/50 mb-1 uppercase tracking-wide";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cobranca/devedores" className="text-white/40 hover:text-white/70 text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white">Novo Devedor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Nome *</label>
            <input className={fieldClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label className={labelClass}>CPF / CNPJ</label>
            <input className={fieldClass} value={form.document} onChange={e => set('document', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={fieldClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(75) 99999-0000" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input className={fieldClass} value={form.whatsapp_phone} onChange={e => set('whatsapp_phone', e.target.value)} placeholder="5575999990000" />
          </div>
          <div>
            <label className={labelClass}>Valor da Dívida (R$)</label>
            <input className={fieldClass} value={form.debt_amount} onChange={e => set('debt_amount', e.target.value)} placeholder="1.500,00" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Descrição da Dívida</label>
            <input className={fieldClass} value={form.debt_description} onChange={e => set('debt_description', e.target.value)} placeholder="Ex: Fatura em aberto referente a..." />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Observações</label>
            <textarea
              className={`${fieldClass} resize-none`}
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Informações adicionais sobre o devedor..."
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <Link href="/cobranca/devedores" className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
