import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Package, Tags, Truck, ArrowLeftRight, BarChart3, Boxes, UserCircle, LogOut, Menu } from 'lucide-react'
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Button, AppBar, Toolbar, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/transactions', label: 'Stock Movements', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/account', label: 'Account', icon: UserCircle },
]

export default function Layout() {
  const { profile, user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))

  const NavContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: 256 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 3 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Boxes size={18} /></Box>
        <Typography variant="h6">Stockroom</Typography>
      </Box>
      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <ListItemButton selected={isActive} sx={{ borderRadius: 1, mb: .5, color: isActive ? 'primary.contrastText' : 'text.secondary', bgcolor: isActive ? 'primary.main' : 'transparent', '&.Mui-selected': { bgcolor: 'primary.main' }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' }, '&:hover': { bgcolor: isActive ? 'primary.dark' : '#eef7f1' } }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><Icon size={17} /></ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#d7ecdd', color: 'primary.dark', fontSize: 13, fontWeight: 600 }}>{(profile?.full_name || user?.email || '?')[0].toUpperCase()}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>{profile?.full_name || 'Team member'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{user?.email}</Typography>
          </Box>
        </Box>
        <Button fullWidth startIcon={<LogOut size={16} />} onClick={signOut} sx={{ justifyContent: 'flex-start', color: 'text.secondary', px: 1, '&:hover': { color: 'error.main', bgcolor: 'rgba(177,72,63,.08)' } }}>Sign out</Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {mobile ? (
        <>
          <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar sx={{ minHeight: 56, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Boxes size={15} /></Box><Typography variant="h6">Stockroom</Typography></Box>
              <IconButton onClick={() => setMobileOpen(true)}><Menu size={22} /></IconButton>
            </Toolbar>
          </AppBar>
          <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { bgcolor: 'background.paper' } }}><NavContent /></Drawer>
        </>
      ) : <Box component="aside" sx={{ width: 256, flexShrink: 0, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}><NavContent /></Box>}
      <Box component="main" sx={{ flex: 1, minWidth: 0, pt: mobile ? 7 : 0 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, lg: 4 } }}><Outlet /></Box>
      </Box>
    </Box>
  )
}
