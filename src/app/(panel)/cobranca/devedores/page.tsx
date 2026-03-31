'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  ATIVO:       'Ativo',
  NEGOCIANDO:  'Negociando',
  QUITADO:     'Quitado',
  INATIVO:     'Inativo',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ATIVO:      { bg: 'rgba(239,68,68,0.15)',  color: '#fca5a5' },
  NEGOCIANDO: { bg: 'rgba(234,179,8,0.15)',  color: '#fde047' },
  QUITADO:    { bg: 'rgba(34,197,94,0.15)',  color: '#86efac' },
  INATIVO:    { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
};

interface Debtor {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_phone: string | null;
  document: string | null;
  debt_amount: number | null;
  status: string;
  last_contact_date: string | null;
}

export default function DevedoresPage() {
  const router = useRouter();
  const [debtors, setDebtors]     = useState<Debtor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (search)       params.set('q', search);
    fetch(`/api/debtors?${params}`)
      .then(r => r.json())
      .then(d => setDebtors(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [filterStatus, search]);

  return (
    <div className="px-4 py-8 md:px-10 md:py-12" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 8 }}>
            COBRANÇA
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            Devedores
          </h1>
        </div>
        <Link href="/cobranca/devedores/novo" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 22px', borderRadius: 10,
          background: 'linear-gradient(135deg, #06C8D8, #2563EB)',
          color: '#fff', fontSize: '0.88rem', fontWeight: 700,
          textDecoration: 'none', letterSpacing: '0.01em',
        }}>
          + Novo Devedor
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.88rem', fontWeight: 500,
            outline: 'none', width: 220,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['', ...Object.keys(STATUS_LABELS)] as string[]).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: 999,
              fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              background: filterStatus === s ? 'linear-gradient(135deg, #06C8D8, #2563EB)' : 'rgba(255,255,255,0.05)',
              color: filterStatus === s ? '#fff' : 'rgba(255,255,255,0.45)',
              border: filterStatus === s ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.15s',
            }}>
              {s === '' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Carregando...</p>
      ) : debtors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.95rem' }}>Nenhum devedor encontrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {debtors.map(d => {
              const sc = STATUS_COLORS[d.status] ?? { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
              return (
                <div key={d.id}
                  onClick={() => router.push(`/cobranca/chat?debtor=${d.id}`)}
                  style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}
                  className="active:bg-white/[0.07]"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{d.name}</span>
                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 8 }}>
                      {STATUS_LABELS[d.status] ?? d.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem' }}>{d.whatsapp_phone ?? d.phone ?? '—'}</span>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                      {d.debt_amount != null ? Number(d.debt_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden md:block" style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Nome', 'Documento', 'WhatsApp', 'Dívida', 'Status', 'Último Contato'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.3)',
                      textAlign: i === 3 ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debtors.map((d, idx) => (
                  <tr key={d.id}
                    onClick={() => router.push(`/cobranca/chat?debtor=${d.id}`)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: idx < debtors.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    className="hover:bg-white/[0.04]"
                  >
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{d.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{d.document ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{d.whatsapp_phone ?? d.phone ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
                      {d.debt_amount != null
                        ? Number(d.debt_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {(() => {
                        const sc = STATUS_COLORS[d.status] ?? { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                        return (
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: '0.72rem', fontWeight: 700,
                            background: sc.bg, color: sc.color,
                          }}>
                            {STATUS_LABELS[d.status] ?? d.status}
                          </span>
                        )
                      })()}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
                      {d.last_contact_date ? new Date(d.last_contact_date).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
