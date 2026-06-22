// Estado vacío reutilizable.
export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-light-border px-6 py-12 text-center dark:border-dark-border">
      {Icon && (
        <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-light-bg2 text-light-muted dark:bg-dark-border dark:text-dark-muted">
          <Icon size={26} />
        </span>
      )}
      <p className="font-display text-lg font-bold text-light-text dark:text-dark-text">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-light-muted dark:text-dark-muted">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
