import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Wallet, ArrowLeftRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'

const PIE_COLORS = ['#2f7d58', '#c1622e', '#c9932f', '#7fc099', '#b1483f', '#4d9f75']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: p }, { data: c }, { data: t }] = await Promise.all([
        supabase.from('products').select('*, categories(name)'),
        supabase.from('categories').select('*'),
        supabase
          .from('stock_transactions')
          .select('*, products(name)')
          .order('created_at', { ascending: false })
          .limit(8),
      ])
      setProducts(p || [])
      setCategories(c || [])
      setTransactions(t || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalValue = products.reduce((sum, p) => sum + p.quantity * Number(p.unit_price || 0), 0)
  const lowStock = products.filter((p) => p.quantity <= p.reorder_level)

  const categoryData = categories
    .map((c) => ({
      name: c.name,
      value: products.filter((p) => p.category_id === c.id).reduce((s, p) => s + p.quantity, 0),
    }))
    .filter((c) => c.value > 0)

  const topProducts = [...products]
    .sort((a, b) => b.quantity * b.unit_price - a.quantity * a.unit_price)
    .slice(0, 6)
    .map((p) => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, value: p.quantity }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Dashboard</h1>
        <p className="text-sm text-ink/55 mt-1">Live overview of stock levels, value, and recent movement.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SKUs" value={loading ? '—' : products.length} icon={Package} accent="brand" />
        <StatCard label="Units in stock" value={loading ? '—' : totalItems.toLocaleString()} icon={ArrowLeftRight} accent="brand" />
        <StatCard
          label="Inventory value"
          value={loading ? '—' : `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label="Low stock alerts"
          value={loading ? '—' : lowStock.length}
          icon={AlertTriangle}
          accent={lowStock.length ? 'rose' : 'brand'}
          hint={lowStock.length ? 'Needs reordering' : 'All good'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-surface border border-line rounded-card shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-4">Top products by value</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dfe3d8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#12241f99' }} axisLine={{ stroke: '#dfe3d8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#12241f99' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #dfe3d8', fontSize: 13 }}
                cursor={{ fill: '#eef7f1' }}
              />
              <Bar dataKey="value" fill="#2f7d58" radius={[6, 6, 0, 0]} name="Units" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-surface border border-line rounded-card shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-4">Stock by category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-ink/50 py-16 text-center">No category data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe3d8', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-card shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-4">Low stock items</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink/50 py-6 text-center">Nothing below reorder level.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-ink">{p.name}</span>
                  <span className="text-rose font-medium">{p.quantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-surface border border-line rounded-card shadow-card p-5">
          <h3 className="font-display text-base text-ink mb-4">Recent movements</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-ink/50 py-6 text-center">No stock movements recorded yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {transactions.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-ink">{t.products?.name || 'Unknown product'}</span>
                  <span className={t.type === 'out' ? 'text-rose font-medium' : 'text-brand-600 font-medium'}>
                    {t.type === 'out' ? '-' : '+'}
                    {t.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
