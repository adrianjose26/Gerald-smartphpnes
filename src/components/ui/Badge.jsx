// Badge del producto: grado (Tipo A/B/C) o 'Vendido' (usa productBadge).
export default function Badge({ state }) {
  // state = { label, color }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-grotesk font-bold"
      style={{ backgroundColor: `${state.color}1A`, color: state.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: state.color }} />
      {state.label}
    </span>
  )
}
