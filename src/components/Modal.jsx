import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const maxWidth = { sm: 'xs', md: 'sm', lg: 'md' }[size] || 'sm'
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} scroll="paper">
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pr: 6 }}>
        {title}
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ position: 'absolute', right: 16, top: 14 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>
    </Dialog>
  )
}
