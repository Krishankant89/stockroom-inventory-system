import { useEffect, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function Account() {
  const {
    user,
    profile,
    updateProfile,
    requestPasswordReset,
    requestEmailChange,
    deactivateAccount,
    signOut,
  } = useAuth()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [profileBusy, setProfileBusy] = useState(false)
  const [emailBusy, setEmailBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name || user?.user_metadata?.full_name || '')
    setUsername(profile?.username || user?.user_metadata?.username || '')
  }, [profile, user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileBusy(true)
    const { error } = await updateProfile({
      fullName: fullName.trim(),
      username: username.trim(),
    })
    setProfileBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Profile updated')
  }

  const handleEmailChange = async (e) => {
    e.preventDefault()
    const nextEmail = newEmail.trim().toLowerCase()
    if (nextEmail === user?.email) {
      toast.error('Enter a different email address.')
      return
    }
    setEmailBusy(true)
    const { error } = await requestEmailChange(nextEmail)
    setEmailBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setNewEmail('')
    toast.success('Check both inboxes. Confirm the change from the links we sent.')
  }

  const handlePasswordReset = async () => {
    if (SITE_KEY && !captchaToken) {
      toast.error('Please complete the security check.')
      return
    }
    setResetBusy(true)
    const { error } = await requestPasswordReset(user.email, captchaToken)
    setResetBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('A password reset link was sent to your email.')
  }

  const handleDeactivate = async () => {
    setDeleteBusy(true)
    const { error } = await deactivateAccount()
    setDeleteBusy(false)
    setConfirmDelete(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Your account has been deactivated.')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Account</h1>
        <p className="text-sm text-ink/60 mt-1">Manage your profile, email, password, and account access.</p>
      </div>

      <section className="bg-surface border border-line rounded-card shadow-card p-6">
        <h2 className="font-display text-lg text-ink mb-1">Profile</h2>
        <p className="text-sm text-ink/60 mb-5">This display name and username are stored on your profile and in auth metadata.</p>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Display name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="stockroom-user" />
          </div>
          <button disabled={profileBusy} className="bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60">
            {profileBusy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="bg-surface border border-line rounded-card shadow-card p-6">
        <h2 className="font-display text-lg text-ink mb-1">Email address</h2>
        <p className="text-sm text-ink/60 mb-4">Current email: <span className="text-ink">{user?.email}</span></p>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">New email</label>
            <input type="email" required className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@company.com" />
          </div>
          <button disabled={emailBusy} className="bg-brand-600 hover:bg-brand-700 text-paper rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60">
            {emailBusy ? 'Sending…' : 'Send confirmation links'}
          </button>
        </form>
      </section>

      <section className="bg-surface border border-line rounded-card shadow-card p-6">
        <h2 className="font-display text-lg text-ink mb-1">Password</h2>
        <p className="text-sm text-ink/60 mb-4">We’ll email a secure link so you can choose a new password.</p>
        {SITE_KEY ? (
          <div className="mb-4">
            <Turnstile
              siteKey={SITE_KEY}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken('')}
              onError={() => setCaptchaToken('')}
            />
          </div>
        ) : null}
        <button
          onClick={handlePasswordReset}
          disabled={resetBusy}
          className="border border-line rounded-lg px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-60"
        >
          {resetBusy ? 'Sending…' : 'Send password reset email'}
        </button>
      </section>

      <section className="bg-surface border border-line rounded-card shadow-card p-6">
        <h2 className="font-display text-lg text-ink mb-1">Session</h2>
        <p className="text-sm text-ink/60 mb-4">Sign out clears local tokens and revokes this account’s active sessions.</p>
        <button
          onClick={signOut}
          className="border border-line rounded-lg px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
        >
          Sign out
        </button>
      </section>

      <section className="bg-surface border border-rose/20 rounded-card shadow-card p-6">
        <h2 className="font-display text-lg text-ink mb-1">Deactivate account</h2>
        <p className="text-sm text-ink/60 mb-4">
          This soft-deletes your profile and signs you out everywhere. You will not be able to use Stockroom until an administrator restores access.
        </p>
        <button
          onClick={() => setConfirmDelete(true)}
          className="bg-rose text-paper rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Deactivate account
        </button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeactivate}
        title="Deactivate this account?"
        message="Your profile will be marked inactive and all sessions will be revoked. This cannot be undone from the app."
        busy={deleteBusy}
        confirmLabel="Deactivate"
        busyLabel="Deactivating…"
      />
    </div>
  )
}
