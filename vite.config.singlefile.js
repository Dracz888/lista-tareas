import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build que empaqueta TODA la app (JS + CSS) en un único index.html,
// pensado para abrirse con doble clic desde el escritorio (protocolo file://).
// Sin PWA/service worker, ya que no funcionan sobre file://.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-escritorio',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
