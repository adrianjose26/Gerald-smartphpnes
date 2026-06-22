// =========================================================
//  Store central (Zustand)
//  ---------------------------------------------------------
//  Única fuente de verdad de la UI. Carga los datos desde la
//  capa de persistencia (data/storage) y los escribe de vuelta.
//  Aquí viven las reglas de negocio (existencia derivada,
//  marcar como vendido al facturar, etc.).
// =========================================================
import { create } from 'zustand'
import { read, write, isSeeded, markSeeded, uid } from '../data/storage'
import { buildSeed } from '../data/seed'
import { generateSku } from '../lib/sku'

const TABLES = ['categorias', 'productos', 'clientes', 'movimientos', 'facturas', 'settings']

// autoDeleteDays: días tras la venta para eliminar el producto (0 = nunca)
const DEFAULT_SETTINGS = { currency: 'DOP', theme: 'light', invoiceCounter: 1, autoDeleteDays: 2 }

export const useStore = create((set, get) => ({
  // ---- estado ----
  ready: false,
  categorias: [],
  productos: [],
  clientes: [],
  movimientos: [],
  facturas: [],
  settings: DEFAULT_SETTINGS,
  toast: null, // { msg, tone }

  // ---- inicialización ----
  async init() {
    if (!(await isSeeded())) {
      const seed = buildSeed()
      for (const t of TABLES) await write(t, seed[t])
      await markSeeded()
    }
    const [categorias, productos, clientes, movimientos, facturas, settings] = await Promise.all(
      TABLES.map((t) => read(t, t === 'settings' ? DEFAULT_SETTINGS : []))
    )
    set({
      categorias,
      productos,
      clientes,
      movimientos,
      facturas,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      ready: true,
    })
    get()._applyTheme()
    get().purgeSoldProducts() // limpia vendidos con más de 2 días al arrancar
  },

  // persiste una tabla concreta
  async _persist(table) {
    await write(table, get()[table])
  },

  // ---- toasts ----
  notify(msg, tone = 'success') {
    set({ toast: { msg, tone, id: uid() } })
    setTimeout(() => {
      // solo limpia si sigue siendo el mismo toast
      set((s) => (s.toast && s.toast.msg === msg ? { toast: null } : {}))
    }, 3200)
  },
  clearToast: () => set({ toast: null }),

  // =======================================================
  //  SELECTORES / DERIVADOS
  // =======================================================
  categoriaById(id) {
    return get().categorias.find((c) => c.id === id) || null
  },
  productoById(id) {
    return get().productos.find((p) => p.id === id) || null
  },
  clienteById(id) {
    return get().clientes.find((c) => c.id === id) || null
  },
  movimientosDe(productId) {
    return get()
      .movimientos.filter((m) => m.productoId === productId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  },

  // =======================================================
  //  CATEGORÍAS
  // =======================================================
  addCategoria({ nombre, color }) {
    const cat = { id: uid(), nombre: nombre.trim(), color: color || '#FF6A00' }
    set((s) => ({ categorias: [...s.categorias, cat] }))
    get()._persist('categorias')
    return cat
  },
  updateCategoria(id, patch) {
    set((s) => ({ categorias: s.categorias.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    get()._persist('categorias')
  },
  /** Borra una categoría. Si tiene productos, los reasigna a "Otros". */
  deleteCategoria(id) {
    const { productos } = get()
    const enUso = productos.some((p) => p.categoriaId === id)
    if (enUso) {
      // crear/obtener categoría "Otros" y reasignar
      let otros = get().categorias.find((c) => c.nombre.toLowerCase() === 'otros')
      if (!otros) otros = get().addCategoria({ nombre: 'Otros', color: '#687284' })
      set((s) => ({
        productos: s.productos.map((p) => (p.categoriaId === id ? { ...p, categoriaId: otros.id } : p)),
      }))
      get()._persist('productos')
    }
    set((s) => ({ categorias: s.categorias.filter((c) => c.id !== id) }))
    get()._persist('categorias')
    get().notify(enUso ? 'Categoría eliminada · productos movidos a "Otros"' : 'Categoría eliminada')
  },

  // =======================================================
  //  PRODUCTOS
  // =======================================================
  /**
   * Crea un producto (1 unidad única). Registra en el historial el alta
   * del producto y le asigna un grado (Tipo A/B/C).
   */
  addProducto(data) {
    const cat = get().categoriaById(data.categoriaId)
    const prod = {
      id: uid(),
      nombre: data.nombre.trim(),
      categoriaId: data.categoriaId,
      sku: (data.sku || '').trim() || generateSku(cat?.nombre),
      imagen: data.imagen || '',
      precioCompra: Number(data.precioCompra) || 0,
      precioVenta: Number(data.precioVenta) || 0,
      proveedor: data.proveedor || '',
      estado: 'activo', // 'activo' (disponible) | 'vendido'
      tipo: data.tipo || 'A', // grado: A | B | C
      capacidad: data.capacidad || '',
      imei: data.imei || '',
      red: data.red || '',
      condicion: data.condicion || '',
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ productos: [prod, ...s.productos] }))
    get()._persist('productos')

    // Historial: registra el alta (1 unidad)
    get().addMovimiento({ productoId: prod.id, tipo: 'entrada', cantidad: 1, motivo: 'Producto agregado' })

    get().notify(`Producto "${prod.nombre}" guardado`)
    return prod
  },

  updateProducto(id, patch) {
    const cat = get().categoriaById(patch.categoriaId)
    set((s) => ({
      productos: s.productos.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              sku: (patch.sku || '').trim() || p.sku || generateSku(cat?.nombre),
              precioCompra: Number(patch.precioCompra ?? p.precioCompra) || 0,
              precioVenta: Number(patch.precioVenta ?? p.precioVenta) || 0,
              tipo: patch.tipo || p.tipo || 'A',
            }
          : p
      ),
    }))
    get()._persist('productos')
    get().notify('Producto actualizado')
  },

  deleteProducto(id) {
    set((s) => ({
      productos: s.productos.filter((p) => p.id !== id),
      movimientos: s.movimientos.filter((m) => m.productoId !== id),
    }))
    get()._persist('productos')
    get()._persist('movimientos')
    get().notify('Producto eliminado')
  },

  // =======================================================
  //  MOVIMIENTOS
  // =======================================================
  // Registra un evento en el historial (alta de producto o venta).
  addMovimiento({ productoId, tipo, cantidad, motivo, referencia = '' }) {
    const mov = {
      id: uid(),
      productoId,
      tipo, // entrada (alta) | salida (venta)
      cantidad: Number(cantidad),
      motivo: motivo || '',
      referencia,
      fecha: new Date().toISOString(),
    }
    set((s) => ({ movimientos: [mov, ...s.movimientos] }))
    get()._persist('movimientos')
    return mov
  },

  updateProductoEstado(id, estado, silent = false) {
    set((s) => ({
      productos: s.productos.map((p) =>
        p.id === id
          ? {
              ...p,
              estado,
              // Marca la fecha de venta para la eliminación automática a los 2 días.
              soldAt: estado === 'vendido' ? p.soldAt || new Date().toISOString() : null,
            }
          : p
      ),
    }))
    get()._persist('productos')
    if (!silent) get().notify('Estado del producto actualizado')
  },

  // Elimina automáticamente los productos vendidos pasado el período
  // configurado (Ajustes → autoDeleteDays; 0 = nunca). Conserva las
  // facturas (historial de ventas); solo borra el producto y sus
  // movimientos. Devuelve cuántos se eliminaron.
  purgeSoldProducts() {
    const dias = Number(get().settings.autoDeleteDays)
    if (!dias || dias <= 0) return 0 // 0 = desactivado
    const limite = dias * 86400000
    const now = Date.now()
    const expirados = get()
      .productos.filter((p) => p.estado === 'vendido' && p.soldAt && now - new Date(p.soldAt).getTime() >= limite)
      .map((p) => p.id)
    if (expirados.length === 0) return 0
    const idset = new Set(expirados)
    set((s) => ({
      productos: s.productos.filter((p) => !idset.has(p.id)),
      movimientos: s.movimientos.filter((m) => !idset.has(m.productoId)),
    }))
    get()._persist('productos')
    get()._persist('movimientos')
    return expirados.length
  },

  // =======================================================
  //  CLIENTES
  // =======================================================
  addCliente(data) {
    const cli = {
      id: uid(),
      nombre: data.nombre.trim(),
      telefono: data.telefono || '',
      email: data.email || '',
      nota: data.nota || '',
      fechaRegistro: new Date().toISOString(),
    }
    set((s) => ({ clientes: [cli, ...s.clientes] }))
    get()._persist('clientes')
    get().notify(`Cliente "${cli.nombre}" agregado`)
    return cli
  },
  updateCliente(id, patch) {
    set((s) => ({ clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    get()._persist('clientes')
    get().notify('Cliente actualizado')
  },
  deleteCliente(id) {
    set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }))
    get()._persist('clientes')
    get().notify('Cliente eliminado')
  },

  // =======================================================
  //  FACTURAS  (regla de negocio principal)
  // =======================================================
  /**
   * Genera una factura:
   *   1) crea el documento
   *   2) registra movimiento de Salida (venta) que deja el equipo en 0
   *   3) marca el producto como "vendido"
   * Devuelve la factura creada.
   */
  generarFactura(data) {
    const settings = get().settings
    const numero = `F-${String(settings.invoiceCounter || 1).padStart(4, '0')}`
    const cliente = data.clienteId ? get().clienteById(data.clienteId) : null

    const factura = {
      id: uid(),
      numero,
      fecha: new Date().toISOString(),
      clienteId: data.clienteId || null,
      clienteNombre: data.clienteNombre || cliente?.nombre || 'Cliente genérico',
      clienteTelefono: data.clienteTelefono || cliente?.telefono || '',
      productoId: data.productoId || null,
      equipo: data.equipo || '',
      capacidad: data.capacidad || '',
      imei: data.imei || '',
      red: data.red || '',
      precio: Number(data.precio) || 0,
      condicion: data.condicion || 'factory',
      nota: data.nota || '',
      garantia: data.garantia || '',
      estado: 'emitida',
    }

    set((s) => ({
      facturas: [factura, ...s.facturas],
      settings: { ...s.settings, invoiceCounter: (s.settings.invoiceCounter || 1) + 1 },
    }))
    get()._persist('facturas')
    get()._persist('settings')

    // 2) y 3) — solo si la factura está ligada a un producto del inventario
    if (data.productoId) {
      // historial de venta (1 unidad)
      get().addMovimiento({
        productoId: data.productoId,
        tipo: 'salida',
        cantidad: 1,
        motivo: 'Venta',
        referencia: factura.id,
      })
      get().updateProductoEstado(data.productoId, 'vendido', true)
    }

    get().notify(`Factura ${numero} generada · ${factura.equipo} vendido a ${factura.clienteNombre}`)
    return factura
  },

  // =======================================================
  //  AJUSTES
  // =======================================================
  setCurrency(currency) {
    set((s) => ({ settings: { ...s.settings, currency } }))
    get()._persist('settings')
  },
  setAutoDeleteDays(dias) {
    set((s) => ({ settings: { ...s.settings, autoDeleteDays: Number(dias) } }))
    get()._persist('settings')
    get().purgeSoldProducts() // aplica el nuevo período de inmediato
  },
  setTheme(theme) {
    set((s) => ({ settings: { ...s.settings, theme } }))
    get()._persist('settings')
    get()._applyTheme()
  },
  toggleTheme() {
    get().setTheme(get().settings.theme === 'dark' ? 'light' : 'dark')
  },
  _applyTheme() {
    const dark = get().settings.theme === 'dark'
    document.documentElement.classList.toggle('dark', dark)
  },

  // Reinicia todo a los datos de ejemplo (útil para demos).
  async resetDemo() {
    const seed = buildSeed()
    for (const t of TABLES) await write(t, seed[t])
    await markSeeded()
    set({
      categorias: seed.categorias,
      productos: seed.productos,
      clientes: seed.clientes,
      movimientos: seed.movimientos,
      facturas: seed.facturas,
      settings: { ...DEFAULT_SETTINGS, ...seed.settings },
    })
    get()._applyTheme()
    get().notify('Datos de ejemplo restaurados')
  },
}))
