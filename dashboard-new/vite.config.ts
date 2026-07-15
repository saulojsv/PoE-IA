import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const assetsRoot = resolve(repoRoot, 'assets')
const mime: Record<string, string> = {
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function repoAssets() {
  return {
    name: 'repo-assets',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = decodeURIComponent((req.url || '').split('?')[0])
        if (!url.startsWith('/assets/')) return next()
        const file = resolve(assetsRoot, url.slice('/assets/'.length))
        const rel = relative(assetsRoot, file)
        if (rel.startsWith('..') || rel.includes(`..${sep}`) || !existsSync(file) || !statSync(file).isFile()) return next()
        res.setHeader('Content-Type', mime[extname(file).toLowerCase()] || 'application/octet-stream')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), repoAssets()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
