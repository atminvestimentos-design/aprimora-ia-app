'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoDevedorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    borderRadius: 10, fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '0.9rem', fontWeight: 500,
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', fontWeight: 700,
    letterSpacing: '0.13em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)', marginBottom: 8,
  }

  return (
    <div className="px-4 py-8 md:px-10 md:py-12" style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <Link href="/cobranca/devedores" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none', marginBottom: 20,
        }} className="hover:text-white/60 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Devedores
        </Link>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 8 }}>
          COBRANÇA
        </p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Novo Devedor
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 32,
        }}>
          <div className="md:col-span-2">
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label style={labelStyle}>CPF / CNPJ</label>
            <input style={inputStyle} value={form.document} onChange={e => set('document', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(75) 99999-0000" />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input style={inputStyle} value={form.whatsapp_phone} onChange={e => set('whatsapp_phone', e.target.value)} placeholder="5575999990000" />
          </div>
          <div>
            <label style={labelStyle}>Valor da Dívida (R$)</label>
            <input style={inputStyle} value={form.debt_amount} onChange={e => set('debt_amount', e.target.value)} placeholder="1500.00" />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Descrição da Dívida</label>
            <input style={inputStyle} value={form.debt_description} onChange={e => set('debt_description', e.target.value)} placeholder="Ex: Fatura em aberto referente a..." />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Observações</label>
            <textarea
              style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Informações adicionais sobre o devedor..."
            />
          </div>
        </div>

        {error && (
          <div style={{ margin: '16px 0', padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button type="submit" disabled={saving} style={{
            padding: '12px 28px', borderRadius: 10,
            background: 'linear-gradient(135deg, #06C8D8, #2563EB)',
            color: '#fff', fontSize: '0.92rem', fontWeight: 700,
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
          }}>
            {saving ? 'Salvando...' : 'Salvar Devedor'}
          </button>
          <Link href="/cobranca/devedores" style={{
            padding: '12px 24px', borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', fontWeight: 600,
            textDecoration: 'none',
          }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
