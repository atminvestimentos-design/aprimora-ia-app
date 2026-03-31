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

const STATUS_COLORS: Record<string, string> = {
  ATIVO:      'bg-red-500/20 text-red-300',
  NEGOCIANDO: 'bg-yellow-500/20 text-yellow-300',
  QUITADO:    'bg-green-500/20 text-green-300',
  INATIVO:    'bg-gray-500/20 text-gray-400',
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Devedores</h1>
        <Link href="/cobranca/devedores/novo"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-semibold">
          + Novo Devedor
        </Link>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/10 text-sm focus:outline-none focus:border-cyan-500 w-56"
        />
        <div className="flex gap-2 flex-wrap">
          {(['', ...Object.keys(STATUS_LABELS)] as string[]).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'border-white/20 text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              {s === '' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white/50">Carregando...</p>
      ) : debtors.length === 0 ? (
        <p className="text-white/30 text-center py-16">Nenhum devedor encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/40 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">WhatsApp</th>
                <th className="px-4 py-3 text-right">Dívida</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Último Contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {debtors.map(d => (
                <tr key={d.id} className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => router.push(`/cobranca/chat?debtor=${d.id}`)}>
                  <td className="px-4 py-3 font-medium text-white">{d.name}</td>
                  <td className="px-4 py-3 text-white/50">{d.document ?? '—'}</td>
                  <td className="px-4 py-3 text-white/50">{d.whatsapp_phone ?? d.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-white/70">
                    {d.debt_amount != null
                      ? Number(d.debt_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.status] ?? ''}`}>
                      {STATUS_LABELS[d.status] ?? d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {d.last_contact_date ? new Date(d.last_contact_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
