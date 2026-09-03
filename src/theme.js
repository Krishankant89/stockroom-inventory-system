import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2f7d58', dark: '#246344', light: '#7fc099', contrastText: '#f6f4ee' },
    secondary: { main: '#c1622e' },
    error: { main: '#b1483f' },
    warning: { main: '#c9932f' },
    background: { default: '#f6f4ee', paper: '#ffffff' },
    text: { primary: '#12241f', secondary: 'rgba(18, 36, 31, 0.62)' },
    divider: '#dfe3d8',
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h2: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h3: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h4: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h5: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h6: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiCard: {
      styleOverrides: { root: { border: '1px solid #dfe3d8', boxShadow: '0 2px 8px rgba(18,36,31,0.06)' } },
    },
  },
})

export default theme
