import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { auth } from './lib/auth'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.WEB_URL ?? 'http://localhost:3000',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Better Auth handles all /api/auth/* routes
app.on(['GET', 'POST'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

// Health check
app.get('/api/health', (c) => c.json({ ok: true }))

export type AppType = typeof app

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) ?? 3001,
}, (info) => {
  console.log(`API running on http://localhost:${info.port}`)
})