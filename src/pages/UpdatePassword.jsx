import { useState } from 'react'
import toast from 'react-hot-toast'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthFrame } from './Login'
export default function UpdatePassword() {
  const { updatePassword, session } = useAuth(); const navigate = useNavigate(); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false)
  const handleSubmit = async (e) => { e.preventDefault(); if (password !== confirm) { toast.error('Passwords do not match.'); return }; if (!session) { toast.error('Open the reset link from your email to continue.'); return }; setBusy(true); const { error } = await updatePassword(password); setBusy(false); if (error) toast.error(error.message); else { toast.success('Password updated'); navigate('/', { replace: true }) } }
  return <AuthFrame><Typography variant="h5">Choose a new password</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Use at least 8 characters.</Typography><Box component="form" onSubmit={handleSubmit}><Stack spacing={2}><TextField type="password" required minLength={8} label="New password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth /><TextField type="password" required minLength={8} label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth /><Button type="submit" disabled={busy} variant="contained" fullWidth>{busy ? 'Saving…' : 'Update password'}</Button></Stack></Box></AuthFrame>
}
