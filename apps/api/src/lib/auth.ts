import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { db } from '@packages/db'
import * as schema from '@packages/db'
import * as authSchema from '@packages/types'
import * as orgSchema from '@packages/types'
import { jwt, bearer } from "better-auth/plugins"
import { organization } from "better-auth/plugins"

const resend = new Resend(process.env.RESEND_API_KEY!)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === 'production',
      domain: 'instantcalendar.io',
    },
  },
  trustedOrigins: [
    process.env.WEB_URL ?? 'http://localhost:3000',
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
    'https://instantcalendar.io',
    'https://www.instantcalendar.io',
    'https://api.instantcalendar.io',
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      ...authSchema,
      ...orgSchema,
    },
  }),
  plugins: [
    jwt(),
    bearer(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: 'Your Instant Calendar login link',
          html: `
            <h2>Sign in to Instant Calendar</h2>
            <p>Click the link below to sign in. This link expires in 15 minutes.</p>
            <a href="${url}">Sign in</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        })
      },
    }),
  ]
})

export type Auth = typeof auth