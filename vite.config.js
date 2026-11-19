import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function resolveApiTarget(env) {
  if (env.VITE_PROXY_TARGET) return env.VITE_PROXY_TARGET
  if (env.VITE_API_URL?.startsWith('http')) {
    return new URL(env.VITE_API_URL).origin
  }
  return 'http://localhost:5000'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const proxy = {
    '/api': {
      target: resolveApiTarget(env),
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
  }
})
