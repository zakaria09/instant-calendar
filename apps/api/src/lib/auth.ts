import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { db } from '@repo/db'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [
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
  ],
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:3000'],
})

export type Auth = typeof auth