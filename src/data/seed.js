// =========================================================
//  Datos de ejemplo (solo se siembran la primera vez)
//  Tienda de tecnología: iPhone, Galaxy, MacBook, AirPods, accesorios.
// =========================================================
import { uid } from './storage'

export function buildSeed() {
  const now = Date.now()
  const day = 86400000
  const ago = (d) => new Date(now - d * day).toISOString()

  // ---- Categorías (el usuario puede crear más) ----
  const cats = {
    celulares: { id: uid(), nombre: 'Celulares', color: '#FF6A00' },
    laptops: { id: uid(), nombre: 'Laptops', color: '#0EA5B7' },
    audio: { id: uid(), nombre: 'Audio', color: '#F59E0B' },
    accesorios: { id: uid(), nombre: 'Accesorios', color: '#F43F5E' },
    smartwatch: { id: uid(), nombre: 'Smartwatch', color: '#7C5CFC' },
  }
  const categorias = Object.values(cats)

  // ---- Clientes ----
  const clientes = [
    { id: uid(), nombre: 'Carlos Martínez', telefono: '+1 809-555-0142', email: 'carlos.m@gmail.com', nota: '', fechaRegistro: ago(40) },
    { id: uid(), nombre: 'María Fernández', telefono: '+1 829-555-0198', email: '', nota: 'Cliente frecuente', fechaRegistro: ago(28) },
    { id: uid(), nombre: 'José Ramírez', telefono: '+1 849-555-0177', email: '', nota: '', fechaRegistro: ago(15) },
    { id: uid(), nombre: 'Ana Polanco', telefono: '+1 809-555-0231', email: 'ana.polanco@hotmail.com', nota: '', fechaRegistro: ago(9) },
    { id: uid(), nombre: 'Luis Encarnación', telefono: '+1 809-555-0290', email: '', nota: 'Mayorista', fechaRegistro: ago(3) },
  ]

  // ---- Productos ----
  // helper para crear producto + su movimiento de entrada inicial
  const productos = []
  const movimientos = []

  const GRADOS = ['A', 'B', 'C']
  function add(p) {
    const id = uid()
    const prod = {
      id,
      nombre: p.nombre,
      categoriaId: p.categoriaId,
      sku: p.sku,
      imagen: p.imagen || '',
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      proveedor: p.proveedor || '',
      estado: 'activo', // disponible
      tipo: p.tipo || GRADOS[productos.length % 3], // grado A/B/C
      // específicos de equipos
      capacidad: p.capacidad || '',
      imei: p.imei || '',
      red: p.red || '',
      condicion: p.condicion || '',
      createdAt: p.createdAt || ago(20),
    }
    productos.push(prod)
    // historial: alta del producto (1 unidad)
    movimientos.push({
      id: uid(),
      productoId: id,
      tipo: 'entrada',
      cantidad: 1,
      motivo: 'Producto agregado',
      referencia: '',
      fecha: prod.createdAt,
    })
    return prod
  }

  add({ nombre: 'iPhone 15 Pro Max', categoriaId: cats.celulares.id, sku: 'CEL-15PM1', precioCompra: 52000, precioVenta: 64900, capacidad: '256GB', imei: '356789102345671', red: 'Liberado', condicion: 'factory', proveedor: 'TechImport RD', stockMinimo: 1, stockMaximo: 5 }, 2)
  add({ nombre: 'iPhone 14', categoriaId: cats.celulares.id, sku: 'CEL-14X2', precioCompra: 33000, precioVenta: 41500, capacidad: '128GB', imei: '356789102345672', red: 'Liberado', condicion: 'factory', proveedor: 'TechImport RD', stockMinimo: 1, stockMaximo: 6 }, 3)
  add({ nombre: 'Samsung Galaxy S24 Ultra', categoriaId: cats.celulares.id, sku: 'CEL-S24U', precioCompra: 45000, precioVenta: 56900, capacidad: '512GB', imei: '356789102345673', red: 'Liberado', condicion: 'factory', proveedor: 'Mobile Depot', stockMinimo: 1, stockMaximo: 5 }, 1)
  add({ nombre: 'Samsung Galaxy A55', categoriaId: cats.celulares.id, sku: 'CEL-A55', precioCompra: 14500, precioVenta: 19900, capacidad: '256GB', imei: '356789102345674', red: 'Liberado', condicion: 'factory', proveedor: 'Mobile Depot', stockMinimo: 2, stockMaximo: 8 }, 1)
  add({ nombre: 'Xiaomi Redmi Note 13', categoriaId: cats.celulares.id, sku: 'CEL-RN13', precioCompra: 9800, precioVenta: 13900, capacidad: '128GB', imei: '356789102345675', red: 'Liberado', condicion: 'factory', proveedor: 'Mobile Depot', stockMinimo: 2, stockMaximo: 10 }, 4)

  add({ nombre: 'MacBook Air M3 13"', categoriaId: cats.laptops.id, sku: 'LAP-MBA3', precioCompra: 58000, precioVenta: 72000, capacidad: '512GB SSD / 16GB', proveedor: 'Apple Caribe', unidad: 'pza', stockMinimo: 1, stockMaximo: 4 }, 2)
  add({ nombre: 'MacBook Pro 14" M3 Pro', categoriaId: cats.laptops.id, sku: 'LAP-MBP14', precioCompra: 92000, precioVenta: 115000, capacidad: '1TB SSD / 18GB', proveedor: 'Apple Caribe', stockMinimo: 1, stockMaximo: 3 }, 1)
  add({ nombre: 'Dell XPS 13', categoriaId: cats.laptops.id, sku: 'LAP-XPS13', precioCompra: 41000, precioVenta: 52900, capacidad: '512GB SSD / 16GB', proveedor: 'TechImport RD', stockMinimo: 1, stockMaximo: 4 }, 1)
  add({ nombre: 'Lenovo IdeaPad 5', categoriaId: cats.laptops.id, sku: 'LAP-IP5', precioCompra: 24000, precioVenta: 32900, capacidad: '512GB SSD / 8GB', proveedor: 'TechImport RD', stockMinimo: 1, stockMaximo: 6 }, 0)

  add({ nombre: 'AirPods Pro (2da gen)', categoriaId: cats.audio.id, sku: 'AUD-APP2', precioCompra: 8500, precioVenta: 12900, proveedor: 'Apple Caribe', stockMinimo: 3, stockMaximo: 15 }, 6)
  add({ nombre: 'AirPods (3ra gen)', categoriaId: cats.audio.id, sku: 'AUD-AP3', precioCompra: 6200, precioVenta: 9500, proveedor: 'Apple Caribe', stockMinimo: 3, stockMaximo: 15 }, 2)
  add({ nombre: 'JBL Flip 6', categoriaId: cats.audio.id, sku: 'AUD-JBL6', precioCompra: 4800, precioVenta: 7200, proveedor: 'Audio Center', stockMinimo: 2, stockMaximo: 12 }, 5)
  add({ nombre: 'Sony WH-1000XM5', categoriaId: cats.audio.id, sku: 'AUD-XM5', precioCompra: 14500, precioVenta: 19900, proveedor: 'Audio Center', stockMinimo: 2, stockMaximo: 8 }, 1)

  add({ nombre: 'Cargador USB-C 35W', categoriaId: cats.accesorios.id, sku: 'ACC-35W', precioCompra: 650, precioVenta: 1290, proveedor: 'Accesorios SD', stockMinimo: 5, stockMaximo: 40 }, 24)
  add({ nombre: 'Cable USB-C a Lightning', categoriaId: cats.accesorios.id, sku: 'ACC-CL', precioCompra: 320, precioVenta: 790, proveedor: 'Accesorios SD', stockMinimo: 10, stockMaximo: 60 }, 8)
  add({ nombre: 'Funda iPhone 15 Pro Max', categoriaId: cats.accesorios.id, sku: 'ACC-F15', precioCompra: 280, precioVenta: 690, proveedor: 'Accesorios SD', stockMinimo: 5, stockMaximo: 50 }, 3)
  add({ nombre: 'Power Bank 20.000mAh', categoriaId: cats.accesorios.id, sku: 'ACC-PB20', precioCompra: 1100, precioVenta: 1990, proveedor: 'Accesorios SD', stockMinimo: 4, stockMaximo: 30 }, 12)

  add({ nombre: 'Apple Watch Series 9', categoriaId: cats.smartwatch.id, sku: 'SMA-AW9', precioCompra: 18000, precioVenta: 24900, capacidad: '45mm GPS', proveedor: 'Apple Caribe', stockMinimo: 1, stockMaximo: 6 }, 2)
  add({ nombre: 'Galaxy Watch 6', categoriaId: cats.smartwatch.id, sku: 'SMA-GW6', precioCompra: 11000, precioVenta: 15900, capacidad: '44mm', proveedor: 'Mobile Depot', stockMinimo: 1, stockMaximo: 6 }, 1)

  // ---- Una factura de ejemplo (equipo ya vendido) ----
  const sold = add(
    { nombre: 'iPhone 13', categoriaId: cats.celulares.id, sku: 'CEL-13', precioCompra: 26000, precioVenta: 33900, capacidad: '128GB', imei: '356789102345699', red: 'Liberado', condicion: 'factory', proveedor: 'TechImport RD', stockMinimo: 1, stockMaximo: 4, createdAt: ago(30) },
    1
  )
  sold.estado = 'vendido'
  sold.soldAt = ago(1) // vendido hace 1 día (aún no se auto-elimina; eso ocurre a los 2 días)
  const facturaId = uid()
  // salida que deja el equipo en 0
  movimientos.push({
    id: uid(),
    productoId: sold.id,
    tipo: 'salida',
    cantidad: 1,
    motivo: 'Venta',
    referencia: facturaId,
    fecha: ago(1),
  })
  const facturas = [
    {
      id: facturaId,
      numero: 'F-0001',
      fecha: ago(1),
      clienteId: clientes[0].id,
      clienteNombre: clientes[0].nombre,
      clienteTelefono: clientes[0].telefono,
      productoId: sold.id,
      equipo: sold.nombre,
      capacidad: sold.capacidad,
      imei: sold.imei,
      red: sold.red,
      precio: sold.precioVenta,
      condicion: 'factory',
      nota: '',
      garantia: '',
      estado: 'emitida',
    },
  ]

  const settings = { currency: 'DOP', theme: 'light', invoiceCounter: 2 }

  return { categorias, productos, clientes, movimientos, facturas, settings }
}
