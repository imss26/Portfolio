import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT : ici c’est le nom de ton repo GitHub
  base: '/Portfolio/',
})
