import { useEffect, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import toast from 'react-hot-toast'
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function Account() {
  const { user, profile, updateProfile, requestPasswordReset, requestEmailChange, deactivateAccount, signOut } = useAuth()
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
    e.preventDefault(); setProfileBusy(true)
    const { error } = await updateProfile({ fullName: fullName.trim(), username: username.trim() })
    setProfileBusy(false); if (error) { toast.error(error.message); return }; toast.success('Profile updated')
  }
  const handleEmailChange = async (e) => {
    e.preventDefault()
    const nextEmail = newEmail.trim().toLowerCase()
    if (nextEmail === user?.email) { toast.error('Enter a different email address.'); return }
    setEmailBusy(true); const { error } = await requestEmailChange(nextEmail); setEmailBusy(false)
    if (error) { toast.error(error.message); return }; setNewEmail(''); toast.success('Check both inboxes. Confirm the change from the links we sent.')
  }
  const handlePasswordReset = async () => {
    if (SITE_KEY && !captchaToken) { toast.error('Please complete the security check.'); return }
    setResetBusy(true); const { error } = await requestPasswordReset(user.email, captchaToken); setResetBusy(false)
    if (error) { toast.error(error.message); return }; toast.success('A password reset link was sent to your email.')
  }
  const handleDeactivate = async () => {
    setDeleteBusy(true); const { error } = await deactivateAccount(); setDeleteBusy(false); setConfirmDelete(false)
    if (error) { toast.error(error.message); return }; toast.success('Your account has been deactivated.')
  }
  const cardSx = { border: 1, borderColor: 'divider', boxShadow: 1 }
  return (
    <Box sx={{ maxWidth: 672 }}>
      <Typography variant="h4">Account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 3 }}>Manage your profile, email, password, and account access.</Typography>
      <Stack spacing={3}>
        <Card sx={cardSx}><CardContent sx={{ p: 3 }}>
          <Typography variant="h6">Profile</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>This display name and username are stored on your profile and in auth metadata.</Typography>
          <Box component="form" onSubmit={handleProfileSave}><Stack spacing={2}>
            <TextField label="Display name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" fullWidth />
            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="stockroom-user" fullWidth />
            <Box><Button type="submit" variant="contained" disabled={profileBusy}>{profileBusy ? 'Saving…' : 'Save profile'}</Button></Box>
          </Stack></Box>
        </CardContent></Card>
        <Card sx={cardSx}><CardContent sx={{ p: 3 }}>
          <Typography variant="h6">Email address</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Current email: <Box component="span" color="text.primary">{user?.email}</Box></Typography>
          <Box component="form" onSubmit={handleEmailChange}><Stack spacing={2}><TextField type="email" required label="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@company.com" fullWidth /><Box><Button type="submit" variant="contained" disabled={emailBusy}>{emailBusy ? 'Sending…' : 'Send confirmation links'}</Button></Box></Stack></Box>
        </CardContent></Card>
        <Card sx={cardSx}><CardContent sx={{ p: 3 }}>
          <Typography variant="h6">Password</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>We’ll email a secure link so you can choose a new password.</Typography>
          {SITE_KEY && <Box sx={{ mb: 2 }}><Turnstile siteKey={SITE_KEY} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => setCaptchaToken('')} /></Box>}
          <Button variant="outlined" onClick={handlePasswordReset} disabled={resetBusy}>{resetBusy ? 'Sending…' : 'Send password reset email'}</Button>
        </CardContent></Card>
        <Card sx={cardSx}><CardContent sx={{ p: 3 }}>
          <Typography variant="h6">Session</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sign out clears local tokens and revokes this account’s active sessions.</Typography><Button variant="outlined" onClick={signOut}>Sign out</Button>
        </CardContent></Card>
        <Card sx={{ ...cardSx, borderColor: 'rgba(177,72,63,.25)' }}><CardContent sx={{ p: 3 }}>
          <Typography variant="h6">Deactivate account</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This soft-deletes your profile and signs you out everywhere. You will not be able to use Stockroom until an administrator restores access.</Typography><Button color="error" variant="contained" onClick={() => setConfirmDelete(true)}>Deactivate account</Button>
        </CardContent></Card>
      </Stack>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDeactivate} title="Deactivate this account?" message="Your profile will be marked inactive and all sessions will be revoked. This cannot be undone from the app." busy={deleteBusy} confirmLabel="Deactivate" busyLabel="Deactivating…" />
    </Box>
  )
}
