export default function StatCard({ label, value, icon: Icon, accent = 'brand', hint }) {
  const accentMap = {
    brand: 'bg-brand-50 text-brand-700',
    clay: 'bg-clay/10 text-clay',
    amber: 'bg-amber/10 text-amber',
    rose: 'bg-rose/10 text-rose',
  }
  return (
    <div className="bg-surface border border-line rounded-card shadow-card p-5 flex items-start justify-between animate-fadeUp">
      <div>
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">{label}</p>
        <p className="font-display text-3xl text-ink mt-1.5">{value}</p>
        {hint && <p className="text-xs text-ink/45 mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accentMap[accent]}`}>
          <Icon size={19} />
        </div>
      )}
    </div>
  )
}
