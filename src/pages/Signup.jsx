import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await signUp(email, password, fullName)
    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created — check your email if confirmation is required')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-card bg-brand-600 flex items-center justify-center text-paper">
            <Boxes size={20} />
          </div>
          <span className="font-display text-2xl text-ink">Stockroom</span>
        </div>

        <div className="bg-surface border border-line rounded-card shadow-card p-8">
          <h1 className="font-display text-xl text-ink mb-1">Create your account</h1>
          <p className="text-sm text-ink/60 mb-6">Set up access to your team's inventory workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">Full name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper/40 focus:bg-white transition"
                placeholder="Max Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper/40 focus:bg-white transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-paper/40 focus:bg-white transition"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-brand-600 hover:bg-brand-700 text-paper rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60"
            >
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
