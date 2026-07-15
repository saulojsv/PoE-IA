import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, createReadStream, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)))
const staticMounts: Record<string, string> = {
  '/data/dashboard/': resolve(rootDir, 'dashboard'),
  '/data/items/': resolve(rootDir, 'data/items'),
  '/assets/': resolve(rootDir, 'assets'),
}

const mime: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function serveRepoStatic() {
  return {
    name: 'serve-poe-repo-static',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = decodeURIComponent((req.url || '').split('?')[0])
        const mount = Object.keys(staticMounts).find(prefix => url.startsWith(prefix))
        if (!mount) return next()

        const base = staticMounts[mount]
        const file = normalize(join(base, url.slice(mount.length)))
        if (!file.startsWith(base) || !existsSync(file) || !statSync(file).isFile()) return next()

        res.setHeader('Content-Type', mime[extname(file).toLowerCase()] || 'application/octet-stream')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveRepoStatic()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
