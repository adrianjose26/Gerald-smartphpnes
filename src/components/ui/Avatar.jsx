import { initials } from '../../lib/format'

// Avatar con iniciales y color derivado del nombre.
const PALETTE = ['#FF6A00', '#0EA5B7', '#F59E0B', '#F43F5E', '#7C5CFC', '#06B6D4', '#16A34A']

export default function Avatar({ name = '', size = 40 }) {
  // color estable a partir del nombre
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const color = PALETTE[Math.abs(hash) % PALETTE.length]

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-grotesk font-bold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  )
}
