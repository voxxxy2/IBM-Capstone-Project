import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // if deploying to GitHub Pages, set base like below:
  // base: '/IBM-Capstone-Project/',
})
