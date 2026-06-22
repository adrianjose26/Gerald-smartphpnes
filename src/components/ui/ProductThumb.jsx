import { Smartphone, Laptop, Headphones, Cable, Watch, Package } from 'lucide-react'

// Miniatura de producto: usa su imagen o, si no hay, un ícono según
// la categoría con el color de marca correspondiente.
const ICON_BY_NAME = (nombre = '') => {
  const n = nombre.toLowerCase()
  if (n.includes('celular')) return Smartphone
  if (n.includes('laptop')) return Laptop
  if (n.includes('audio')) return Headphones
  if (n.includes('accesorio')) return Cable
  if (n.includes('watch') || n.includes('reloj')) return Watch
  return Package
}

export default function ProductThumb({ producto, categoria, size = 44 }) {
  const Icon = ICON_BY_NAME(categoria?.nombre)
  const color = categoria?.color || '#687284'
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-xl"
      style={{ width: size, height: size, backgroundColor: producto?.imagen ? undefined : `${color}1A`, color }}
    >
      {producto?.imagen ? (
        <img src={producto.imagen} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon size={size * 0.5} />
      )}
    </span>
  )
}
