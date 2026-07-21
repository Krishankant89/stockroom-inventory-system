import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Truck, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const empty = { name: '', contact_name: '', email: '', phone: '', address: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('suppliers').select('*').order('name')
    setSuppliers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditingId(null); setForm(empty); setModalOpen(true) }
  const openEdit = (s) => {
    setEditingId(s.id)
    setForm({ name: s.name, contact_name: s.contact_name || '', email: s.email || '', phone: s.phone || '', address: s.address || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    }
    const query = editingId
      ? supabase.from('suppliers').update(payload).eq('id', editingId)
      : supabase.from('suppliers').insert(payload)
    const { error } = await query
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success(editingId ? 'Supplier updated' : 'Supplier added'); setModalOpen(false); load() }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('suppliers').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) toast.error(error.message)
    else { toast.success('Supplier deleted'); setDeleteTarget(null); load() }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Suppliers</h1>
          <p className="text-sm text-ink/55 mt-1">Vendors you restock from.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium transition self-start">
          <Plus size={16} /> Add supplier
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-ink/50">No suppliers yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-surface border border-line rounded-card shadow-card p-5 animate-fadeUp">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-clay/10 text-clay flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-md text-ink/50 hover:bg-paper transition"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-md text-rose hover:bg-rose/10 transition"><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-display text-base text-ink mt-3">{s.name}</h3>
              {s.contact_name && <p className="text-sm text-ink/55">{s.contact_name}</p>}
              <div className="mt-3 space-y-1">
                {s.email && <p className="text-xs text-ink/50 flex items-center gap-1.5"><Mail size={12} /> {s.email}</p>}
                {s.phone && <p className="text-xs text-ink/50 flex items-center gap-1.5"><Phone size={12} /> {s.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit supplier' : 'Add supplier'}>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Company name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Contact person</label>
            <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2 flex gap-3 mt-1">
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
        message={`Delete supplier "${deleteTarget?.name}"?`}
      />
    </div>
  )
}
