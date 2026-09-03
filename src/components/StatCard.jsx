import { Card, CardContent, Box, Typography } from '@mui/material'

export default function StatCard({ label, value, icon: Icon, accent = 'brand', hint }) {
  const colors = {
    brand: { bg: '#eef7f1', fg: '#2f7d58' },
    clay: { bg: 'rgba(193,98,46,.1)', fg: '#c1622e' },
    amber: { bg: 'rgba(201,147,47,.1)', fg: '#c9932f' },
    rose: { bg: 'rgba(177,72,63,.1)', fg: '#b1483f' },
  }
  const color = colors[accent] || colors.brand
  return (
    <Card sx={{ height: '100%', animation: 'fadeUp .35s ease both' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, lineHeight: 1.3 }}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>{value}</Typography>
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
        {Icon && <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: color.bg, color: color.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} /></Box>}
      </CardContent>
    </Card>
  )
}
