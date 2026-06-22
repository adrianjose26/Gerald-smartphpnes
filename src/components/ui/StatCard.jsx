// Tarjeta de resumen con barra de progreso y color de marca.
export default function StatCard({ icon: Icon, label, value, hint, color, progress = 0 }) {
  const pct = Math.max(0, Math.min(100, progress))
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-grotesk font-bold uppercase tracking-wide text-light-muted dark:text-dark-muted">
            {label}
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-light-text dark:text-dark-text sm:text-3xl">
            {value}
          </p>
        </div>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <Icon size={20} />
        </span>
      </div>

      {/* barra de progreso */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-pill bg-light-bg2 dark:bg-dark-border">
        <div
          className="h-full rounded-pill transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {hint && <p className="mt-2 text-xs text-light-muted dark:text-dark-muted">{hint}</p>}
    </div>
  )
}
