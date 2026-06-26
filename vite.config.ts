import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path is set for GitHub Pages project-site deployment.
// When served at https://<user>.github.io/ai-compliance-workspace/ the
// app assets must be requested relative to that sub-path.
export default defineConfig({
  base: '/ai-compliance-workspace/',
  plugins: [react(), tailwindcss()],
})
