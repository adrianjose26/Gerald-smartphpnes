import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite para la app de Ventura Smart Phone.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
