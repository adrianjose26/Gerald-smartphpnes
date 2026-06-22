// Pill de categoría con su color de marca.
export default function CategoryPill({ categoria }) {
  if (!categoria) return <span className="text-light-muted">—</span>
  return (
    <span
      className="pill"
      style={{ backgroundColor: `${categoria.color}1A`, color: categoria.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: categoria.color }} />
      {categoria.nombre}
    </span>
  )
}
