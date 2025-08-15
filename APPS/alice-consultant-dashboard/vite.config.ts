import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { config } from "dotenv"

// Load environment variables from .env file
config()

export default defineConfig(({ mode }) => {
  // Use GitHub Pages base path in production, local path in development
  const getBase = (mode: string) => {
    if (mode === 'production') {
      return '/alice-suite/' // Repository name for GitHub Pages
    }
    return '/'
  }

  return {
    plugins: [react()],
    base: getBase(mode),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@data': path.resolve(__dirname, './src/data'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@theme': path.resolve(__dirname, './src/theme'),
    },
  },
  define: {
    'process.env': JSON.stringify({
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
      REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    }),
  },
  server: {
    port: 5174,
    host: true,
    open: true,
    fs: {
      allow: [
        // Allow access to the current directory
        '.',
        // Allow access to the parent directory (for shared packages)
        '..',
        // Allow access to the api-client package
        '../alice-suite-monorepo/packages/api-client',
        // Allow access to the entire APPS directory
        '../'
      ]
    }
  }
  })
