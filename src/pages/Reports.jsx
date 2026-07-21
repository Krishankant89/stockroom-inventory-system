import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { supabase } from '../lib/supabase'

export default function Reports() {
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from('products').select('*, categories(name)'),
        supabase.from('stock_transactions').select('*').order('created_at', { ascending: true }),
      ])
      setProducts(p || [])
      setTransactions(t || [])
      setLoading(false)
    }
    load()
  }, [])

  const exportProductsCSV = () => {
    if (products.length === 0) {
      toast.error('No products to export')
      return
    }
    const rows = products.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.categories?.name || '',
      Quantity: p.quantity,
      'Unit Price': p.unit_price,
      'Cost Price': p.cost_price,
      'Reorder Level': p.reorder_level,
      'Stock Value': (p.quantity * Number(p.unit_price)).toFixed(2),
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  // Build a simple daily net-movement trend from the last 30 days of transactions
  const dailyTrend = (() => {
    const map = {}
    transactions.forEach((t) => {
      const day = t.created_at.slice(0, 10)
      const delta = t.type === 'out' ? -t.quantity : t.quantity
      map[day] = (map[day] || 0) + delta
    })
    return Object.entries(map)
      .slice(-30)
      .map(([date, value]) => ({ date: date.slice(5), value }))
  })()

  const totalValue = products.reduce((s, p) => s + p.quantity * Number(p.unit_price || 0), 0)
  const totalCost = products.reduce((s, p) => s + p.quantity * Number(p.cost_price || 0), 0)
  const potentialProfit = totalValue - totalCost

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Reports</h1>
          <p className="text-sm text-ink/55 mt-1">Export data and track net stock movement over time.</p>
        </div>
        <button onClick={exportProductsCSV} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium transition self-start">
          <Download size={16} /> Export inventory CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-line rounded-card shadow-card p-5">
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">Retail value</p>
          <p className="font-display text-2xl text-ink mt-1.5">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-surface border border-line rounded-card shadow-card p-5">
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">Cost value</p>
          <p className="font-display text-2xl text-ink mt-1.5">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-surface border border-line rounded-card shadow-card p-5">
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">Potential margin</p>
          <p className="font-display text-2xl text-brand-600 mt-1.5">₹{potentialProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-card shadow-card p-5">
        <h3 className="font-display text-base text-ink mb-4">Net daily stock movement</h3>
        {loading ? (
          <p className="text-sm text-ink/50 py-16 text-center">Loading…</p>
        ) : dailyTrend.length === 0 ? (
          <p className="text-sm text-ink/50 py-16 text-center">No transactions yet — movement will appear here once you log stock in/out.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dfe3d8" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#12241f99' }} axisLine={{ stroke: '#dfe3d8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#12241f99' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe3d8', fontSize: 13 }} />
              <Line type="monotone" dataKey="value" stroke="#2f7d58" strokeWidth={2.5} dot={false} name="Net units" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
