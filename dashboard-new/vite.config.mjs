import { createReadStream, existsSync } from 'node:fs'
import { join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))

function localDataAssets() {
  return {
    name: 'poe-local-data-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = decodeURIComponent((request.url || '').split('?')[0])
        const root = pathname.startsWith('/dashboard/') ? join(repositoryRoot, 'dashboard') : pathname.startsWith('/assets/') ? join(repositoryRoot, 'assets') : ''
        if (!root) return next()
        const relative = pathname.replace(/^\/(dashboard|assets)\//, '')
        const file = normalize(join(root, relative))
        if (!file.startsWith(root) || !existsSync(file)) return next()
        if (file.endsWith('.json')) response.setHeader('Content-Type', 'application/json; charset=utf-8')
        else if (file.endsWith('.png')) response.setHeader('Content-Type', 'image/png')
        else if (file.endsWith('.webp')) response.setHeader('Content-Type', 'image/webp')
        createReadStream(file).pipe(response)
      })
    },
  }
}

export default defineConfig({ plugins: [react(), tailwindcss(), localDataAssets()], server: { host: '127.0.0.1', port: 5173 } })
