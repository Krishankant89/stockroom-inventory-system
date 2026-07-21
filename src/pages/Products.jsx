import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, PackagePlus, PackageMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyForm = {
  sku: '', name: '', description: '', category_id: '', supplier_id: '',
  unit_price: '', cost_price: '', quantity: '', reorder_level: '10', location_id: '',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [stockModal, setStockModal] = useState(null) // { product, type }
  const [stockQty, setStockQty] = useState('')
  const [stockReason, setStockReason] = useState('')
  const [stockBusy, setStockBusy] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    const [{ data: p }, { data: c }, { data: s }, { data: l }] = await Promise.all([
      supabase.from('products').select('*, categories(name), suppliers(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
    ])
    setProducts(p || [])
    setCategories(c || [])
    setSuppliers(s || [])
    setLocations(l || [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.category_id === categoryFilter
      const matchesStock =
        !stockFilter ||
        (stockFilter === 'low' && p.quantity <= p.reorder_level) ||
        (stockFilter === 'out' && p.quantity === 0) ||
        (stockFilter === 'ok' && p.quantity > p.reorder_level)
      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, search, categoryFilter, stockFilter])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      sku: p.sku, name: p.name, description: p.description || '',
      category_id: p.category_id || '', supplier_id: p.supplier_id || '',
      unit_price: p.unit_price, cost_price: p.cost_price, quantity: p.quantity,
      reorder_level: p.reorder_level, location_id: p.location_id || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      supplier_id: form.supplier_id || null,
      unit_price: Number(form.unit_price) || 0,
      cost_price: Number(form.cost_price) || 0,
      reorder_level: Number(form.reorder_level) || 0,
      location_id: form.location_id || null,
    }
    if (!editingId) payload.quantity = Number(form.quantity) || 0

    const query = editingId
      ? supabase.from('products').update(payload).eq('id', editingId)
      : supabase.from('products').insert(payload)

    const { error } = await query
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editingId ? 'Product updated' : 'Product added')
      setModalOpen(false)
      loadAll()
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Product deleted')
      setDeleteTarget(null)
      loadAll()
    }
  }

  const openStock = (product, type) => {
    setStockModal({ product, type })
    setStockQty('')
    setStockReason('')
  }

  const submitStock = async (e) => {
    e.preventDefault()
    if (!stockQty || Number(stockQty) <= 0) {
      toast.error('Enter a quantity greater than 0')
      return
    }
    setStockBusy(true)
    const { error } = await supabase.rpc('apply_stock_transaction', {
      p_product_id: stockModal.product.id,
      p_type: stockModal.type,
      p_quantity: Number(stockQty),
      p_reason: stockReason || null,
      p_reference_no: null,
    })
    setStockBusy(false)
    if (error) toast.error(error.message)
    else {
      toast.success(`Stock ${stockModal.type === 'in' ? 'added' : 'removed'}`)
      setStockModal(null)
      loadAll()
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="text-sm text-ink/55 mt-1">{filtered.length} of {products.length} items</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium transition self-start"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-surface text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-line bg-surface text-sm px-3 py-2.5"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-line bg-surface text-sm px-3 py-2.5"
        >
          <option value="">All stock levels</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      <div className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/45">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Unit price</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">Loading products…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">No products found. Try adding one.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/60 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.suppliers?.name && <p className="text-xs text-ink/45">{p.suppliers.name}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/60">{p.sku}</td>
                    <td className="px-4 py-3 text-ink/70">{p.categories?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${p.quantity <= p.reorder_level ? 'text-rose' : 'text-ink'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-ink/70">₹{Number(p.unit_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button title="Stock in" onClick={() => openStock(p, 'in')} className="p-1.5 rounded-md text-brand-600 hover:bg-brand-50 transition">
                          <PackagePlus size={16} />
                        </button>
                        <button title="Stock out" onClick={() => openStock(p, 'out')} className="p-1.5 rounded-md text-clay hover:bg-clay/10 transition">
                          <PackageMinus size={16} />
                        </button>
                        <button title="Edit" onClick={() => openEdit(p)} className="p-1.5 rounded-md text-ink/60 hover:bg-paper transition">
                          <Pencil size={16} />
                        </button>
                        <button title="Delete" onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-md text-rose hover:bg-rose/10 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit product' : 'Add product'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU" required>
            <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" />
          </Field>
          <Field label="Name" required>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Supplier">
            <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="input">
              <option value="">None</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Unit price (₹)">
            <input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} className="input" />
          </Field>
          <Field label="Cost price (₹)">
            <input type="number" step="0.01" min="0" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} className="input" />
          </Field>
          {!editingId && (
            <Field label="Opening quantity">
              <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input" />
            </Field>
          )}
          <Field label="Reorder level">
            <input type="number" min="0" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="input" />
          </Field>
          <Field label="Location">
            <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="input">
              <option value="">None</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="Description" full>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </Field>

          <div className="sm:col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-line rounded-lg py-2.5 text-sm font-medium text-ink/70 hover:bg-paper transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand-600 text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock in/out modal */}
      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={stockModal?.type === 'in' ? 'Add stock' : 'Remove stock'} size="sm">
        {stockModal && (
          <form onSubmit={submitStock} className="space-y-4">
            <p className="text-sm text-ink/60">{stockModal.product.name} — currently {stockModal.product.quantity} in stock</p>
            <Field label="Quantity" required>
              <input type="number" min="1" required value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="input" autoFocus />
            </Field>
            <Field label="Reason (optional)">
              <input value={stockReason} onChange={(e) => setStockReason(e.target.value)} placeholder="e.g. New shipment, damaged goods" className="input" />
            </Field>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStockModal(null)} className="flex-1 border border-line rounded-lg py-2.5 text-sm font-medium text-ink/70 hover:bg-paper transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={stockBusy}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-paper transition disabled:opacity-60 ${stockModal.type === 'in' ? 'bg-brand-600 hover:bg-brand-700' : 'bg-clay hover:opacity-90'}`}
              >
                {stockBusy ? 'Saving…' : stockModal.type === 'in' ? 'Add stock' : 'Remove stock'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        message={`Delete "${deleteTarget?.name}"? This will also remove its stock movement history.`}
      />
    </div>
  )
}

function Field({ label, children, required, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-ink/70 mb-1.5">
        {label} {required && <span className="text-rose">*</span>}
      </label>
      {children}
    </div>
  )
}
