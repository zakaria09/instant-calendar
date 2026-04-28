import { createMiddleware } from 'hono/factory'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { auth } from '../lib/auth'

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.BETTER_AUTH_URL ?? 'http://localhost:3001'}/api/auth/jwks`)
)

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    // JWT path (mobile / Postman)
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
        audience: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
      })
      c.set('user', payload.sub) // payload contains user info
      return next()
    } catch (err) {
      return c.json({ error: 'Invalid token' }, 401)
    }
  }

  // Cookie path (web)
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  c.set('session', session.session)
  return next()
})