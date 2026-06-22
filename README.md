# Ventura Smart Phone · Inventario y Facturación

App web responsiva (móvil y escritorio) para el control de **inventario** y la
**facturación** de la tienda de tecnología *Ventura Smart Phone*.

## Stack

- **React + Vite + TailwindCSS** (mobile-first, accesible)
- **Zustand** como store central
- Persistencia local en **localStorage** a través de una **capa de datos aislada**
  (`src/data/storage.js`) lista para migrar a Supabase sin reescribir la UI.
- **PDF** de la factura con `jspdf` + `html2canvas` (cargados de forma diferida)
- Compartir por **WhatsApp** con enlaces `wa.me`

## Cómo ejecutar

```bash
npm install      # instala dependencias
npm run dev      # entorno de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
npm run preview  # sirve el build de producción
```

La primera vez se **siembran datos de ejemplo** (iPhone, Galaxy, MacBook,
AirPods, accesorios, clientes y movimientos). Puedes restaurarlos desde
**Ajustes → Restaurar demo**.

## Estructura

```
src/
  data/        storage.js (capa aislada) · seed.js (datos demo)
  store/       useStore.js  (estado + reglas de negocio)
  lib/         stock, format, sku, whatsapp, pdf, invoiceText
  components/  ui/ (primitivas) · layout/ (shell) · formularios
  pages/       Dashboard, Products, ProductDetail, Movements,
               InvoiceCreate, InvoiceView, Reports, Customers, Settings
```

## Reglas de negocio clave

- La **existencia** de cada producto se **deriva de los movimientos**
  (entrada suma, salida resta, ajuste corrige); nunca se edita a mano.
- **Stock bajo** = existencia ≤ stock mínimo · **Agotado** = existencia 0.
- Al **generar una factura**: se crea el documento, se registra una **salida (venta)**
  que deja el equipo en 0 y el producto se marca como **Vendido · no disponible**
  (no se puede vender dos veces el mismo equipo).
- **Moneda configurable** (RD$, US$, MXN) en Ajustes.

## Migrar a Supabase (futuro)

Reemplaza el cuerpo de `read/write/remove` en `src/data/storage.js` por llamadas
a Supabase. Las funciones ya son asíncronas, así que el resto de la app no cambia.
