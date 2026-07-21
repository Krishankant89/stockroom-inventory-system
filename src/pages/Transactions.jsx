import { useEffect, useMemo, useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('stock_transactions')
        .select('*, products(name, sku), profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200)
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(
    () => transactions.filter((t) => !typeFilter || t.type === typeFilter),
    [transactions, typeFilter]
  )

  const icon = (type) => {
    if (type === 'in') return <ArrowUpCircle size={16} className="text-brand-600" />
    if (type === 'out') return <ArrowDownCircle size={16} className="text-rose" />
    return <RefreshCcw size={16} className="text-amber" />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Stock movements</h1>
          <p className="text-sm text-ink/55 mt-1">Full audit trail of every stock in/out event.</p>
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-line bg-surface text-sm px-3 py-2.5">
          <option value="">All types</option>
          <option value="in">Stock in</option>
          <option value="out">Stock out</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </div>

      <div className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/45">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">By</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">No movements recorded yet.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 capitalize">{icon(t.type)} {t.type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{t.products?.name || 'Deleted product'}</p>
                      <p className="text-xs text-ink/40 font-mono">{t.products?.sku}</p>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${t.type === 'out' ? 'text-rose' : 'text-brand-600'}`}>
                      {t.type === 'out' ? '-' : '+'}{t.quantity}
                    </td>
                    <td className="px-4 py-3 text-ink/60">{t.reason || '—'}</td>
                    <td className="px-4 py-3 text-ink/60">{t.profiles?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-ink/50 text-xs">{new Date(t.created_at).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
