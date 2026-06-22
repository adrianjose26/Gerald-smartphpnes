/** @type {import('tailwindcss').Config} */
// Tokens de diseño tomados de la identidad visual de Ventura Smart Phone.
// Se exponen dos temas: claro/energético (principal) y oscuro/premium.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // el tema oscuro se activa con la clase .dark en <html>
  theme: {
    extend: {
      colors: {
        // Marca
        brand: {
          orange: '#FF6A00',
          yellow: '#F5B301',
          red: '#EF4444',
          cyan: '#06B6D4',
        },
        // Tema claro (energético)
        light: {
          bg: '#F4F6F9',
          bg2: '#EEF1F5',
          surface: '#FFFFFF',
          border: '#E6EAF0',
          text: '#131820',
          muted: '#687284',
        },
        // Tema oscuro (premium)
        dark: {
          bg: '#0A0D13',
          surface: '#10151E',
          border: '#1C2433',
          text: '#EAEEF5',
          muted: '#7C8699',
          yellow: '#FBBF24',
          red: '#F87171',
          cyan: '#22D3EE',
        },
        // Estados de stock
        stock: {
          ok: '#16A34A',
          low: '#D97706',
          out: '#E11D48',
          sold: '#1F2735',
        },
        // Categorías
        cat: {
          celulares: '#FF6A00',
          laptops: '#0EA5B7',
          audio: '#F59E0B',
          accesorios: '#F43F5E',
          smartwatch: '#7C5CFC',
        },
        // Acento azul marino de la factura
        invoice: '#1E2A52',
      },
      fontFamily: {
        display: ['Archivo', 'Space Grotesk', 'system-ui', 'sans-serif'],
        grotesk: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sora: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF6A00, #FFB300)',
        'brand-gradient-premium': 'linear-gradient(135deg, #FF6A2C, #FF2D6F)',
        'sidebar-gradient': 'linear-gradient(180deg, #161B26 0%, #11151E 100%)',
      },
      borderRadius: {
        card: '18px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 4px 20px -8px rgba(19, 24, 32, 0.18)',
        card: '0 6px 24px -12px rgba(19, 24, 32, 0.22)',
      },
    },
  },
  plugins: [],
}
