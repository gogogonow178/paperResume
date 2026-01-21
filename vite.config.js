import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://paper-resume-git-feature-serverless-pdf-binghanlius-projects.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
