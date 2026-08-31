import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function UpdatePassword() {
  const { updatePassword, session } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (!session) {
      toast.error('Open the reset link from your email to continue.')
      return
    }
    setBusy(true)
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password updated')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-card bg-brand-600 flex items-center justify-center text-paper"><Boxes size={20} /></div>
          <span className="font-display text-2xl text-ink">Stockroom</span>
        </div>

        <div className="bg-surface border border-line rounded-card shadow-card p-8">
          <h1 className="font-display text-xl text-ink mb-1">Choose a new password</h1>
          <p className="text-sm text-ink/60 mb-6">Use at least 8 characters.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="New password" />
            <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="Confirm password" />
            <button disabled={busy} className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
