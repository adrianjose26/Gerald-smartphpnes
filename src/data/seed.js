// =========================================================
//  Datos iniciales
//  ---------------------------------------------------------
//  La app arranca VACÍA, lista para usarse desde cero.
//  Solo se incluyen las categorías por defecto (se pueden
//  editar o eliminar en Ajustes). No hay productos, clientes,
//  movimientos ni facturas de ejemplo.
// =========================================================
import { uid } from './storage'

export function buildSeed() {
  // Categorías por defecto de una tienda de tecnología.
  const categorias = [
    { id: uid(), nombre: 'Celulares', color: '#FF6A00' },
    { id: uid(), nombre: 'Laptops', color: '#0EA5B7' },
    { id: uid(), nombre: 'Audio', color: '#F59E0B' },
    { id: uid(), nombre: 'Accesorios', color: '#F43F5E' },
    { id: uid(), nombre: 'Smartwatch', color: '#7C5CFC' },
  ]

  const settings = { currency: 'DOP', theme: 'light', invoiceCounter: 1, autoDeleteDays: 2 }

  return {
    categorias,
    productos: [],
    clientes: [],
    movimientos: [],
    facturas: [],
    settings,
  }
}
