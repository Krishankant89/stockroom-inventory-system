import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import toast from 'react-hot-toast'
import { Box, Button, Card, CardContent, Grid, IconButton, Stack, TextField, Typography } from '@mui/material'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Categories() {
  const [categories, setCategories] = useState([]); const [productCounts, setProductCounts] = useState({}); const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false); const [editingId, setEditingId] = useState(null); const [form, setForm] = useState({ name: '', description: '' }); const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null); const [deleting, setDeleting] = useState(false)
  const load = async () => { setLoading(true); const { data: cats } = await supabase.from('categories').select('*').order('name'); const { data: products } = await supabase.from('products').select('category_id'); const counts = {}; (products || []).forEach((p) => { if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1 }); setProductCounts(counts); setCategories(cats || []); setLoading(false) }
  useEffect(() => { load() }, [])
  const openCreate = () => { setEditingId(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditingId(c.id); setForm({ name: c.name, description: c.description || '' }); setModalOpen(true) }
  const handleSave = async (e) => { e.preventDefault(); setSaving(true); const payload = { name: form.name.trim(), description: form.description.trim() || null }; const query = editingId ? supabase.from('categories').update(payload).eq('id', editingId) : supabase.from('categories').insert(payload); const { error } = await query; setSaving(false); if (error) toast.error(error.message); else { toast.success(editingId ? 'Category updated' : 'Category added'); setModalOpen(false); load() } }
  const handleDelete = async () => { setDeleting(true); const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id); setDeleting(false); if (error) toast.error(error.message); else { toast.success('Category deleted'); setDeleteTarget(null); load() } }
  return <Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}><Box><Typography variant="h4">Categories</Typography><Typography variant="body2" color="text.secondary">Group products for easier reporting and filtering.</Typography></Box><Button startIcon={<Plus size={16} />} variant="contained" onClick={openCreate}>Add category</Button></Stack>
    {loading ? <Typography color="text.secondary">Loading…</Typography> : categories.length === 0 ? <Typography color="text.secondary">No categories yet.</Typography> : <Grid container spacing={2}>{categories.map((c) => <Grid item xs={12} sm={6} lg={4} key={c.id}><Card sx={{ height: '100%' }}><CardContent><Stack direction="row" justifyContent="space-between"><Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#eef7f1', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tags size={16} /></Box><Box><IconButton size="small" onClick={() => openEdit(c)}><Pencil size={15} /></IconButton><IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}><Trash2 size={15} /></IconButton></Box></Stack><Typography variant="h6" sx={{ mt: 1.5 }}>{c.name}</Typography>{c.description && <Typography variant="body2" color="text.secondary">{c.description}</Typography>}<Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>{productCounts[c.id] || 0} products</Typography></CardContent></Card></Grid>)}</Grid>}
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit category' : 'Add category'} size="sm"><Box component="form" onSubmit={handleSave}><Stack spacing={2}><TextField required label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth /><TextField label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth /><Stack direction="row" spacing={1.5}><Button fullWidth variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button><Button fullWidth type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></Stack></Stack></Box></Modal>
    <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} message={`Delete category "${deleteTarget?.name}"? Products in it will become uncategorized.`} />
  </Box>
}
