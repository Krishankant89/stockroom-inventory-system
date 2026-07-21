import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [productCounts, setProductCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: cats } = await supabase.from('categories').select('*').order('name')
    const { data: products } = await supabase.from('products').select('category_id')
    const counts = {}
    ;(products || []).forEach((p) => {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1
    })
    setProductCounts(counts)
    setCategories(cats || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditingId(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, description: c.description || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { name: form.name.trim(), description: form.description.trim() || null }
    const query = editingId
      ? supabase.from('categories').update(payload).eq('id', editingId)
      : supabase.from('categories').insert(payload)
    const { error } = await query
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success(editingId ? 'Category updated' : 'Category added'); setModalOpen(false); load() }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) toast.error(error.message)
    else { toast.success('Category deleted'); setDeleteTarget(null); load() }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Categories</h1>
          <p className="text-sm text-ink/55 mt-1">Group products for easier reporting and filtering.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium transition self-start">
          <Plus size={16} /> Add category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-ink/50">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-surface border border-line rounded-card shadow-card p-5 animate-fadeUp">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Tags size={16} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-ink/50 hover:bg-paper transition"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md text-rose hover:bg-rose/10 transition"><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-display text-base text-ink mt-3">{c.name}</h3>
              {c.description && <p className="text-sm text-ink/55 mt-1">{c.description}</p>}
              <p className="text-xs text-ink/45 mt-3">{productCounts[c.id] || 0} products</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit category' : 'Add category'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-line rounded-lg py-2.5 text-sm font-medium text-ink/70 hover:bg-paper transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand-600 text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        message={`Delete category "${deleteTarget?.name}"? Products in it will become uncategorized.`}
      />
    </div>
  )
}
