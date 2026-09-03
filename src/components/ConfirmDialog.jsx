import Modal from './Modal'
import { Box, Button, Stack, Typography } from '@mui/material'

export default function ConfirmDialog({
  open, onClose, onConfirm, title = 'Are you sure?', message, busy,
  confirmLabel = 'Delete', busyLabel = 'Deleting…',
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <Typography variant="body2" color="text.secondary">{message}</Typography>
      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        <Button fullWidth variant="outlined" onClick={onClose}>Cancel</Button>
        <Button fullWidth variant="contained" color="error" onClick={onConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </Button>
      </Stack>
    </Modal>
  )
}
