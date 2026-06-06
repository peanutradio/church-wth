import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  esbuild: {
    // 운영 빌드에서 console.log/info/debug 제거 (error/warn은 디버깅용으로 유지)
    pure: ['console.log', 'console.info', 'console.debug'],
  },
})
