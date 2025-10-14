import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Production optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['@heroicons/react'],
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },

  // Development server optimizations
  server: {
    port: 5173,
    host: true,
    cors: true,
    hmr: {
      overlay: false
    }
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@heroicons/react'],
  },

  // CSS optimizations
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  }
})
