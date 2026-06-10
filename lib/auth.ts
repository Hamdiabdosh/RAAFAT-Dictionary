import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/db'

const authUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

function buildTrustedOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
  for (const url of [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!url) continue
    origins.add(url)
    try {
      const parsed = new URL(url)
      if (parsed.hostname.startsWith('www.')) {
        origins.add(`${parsed.protocol}//${parsed.hostname.slice(4)}${parsed.port ? `:${parsed.port}` : ''}`)
      } else {
        origins.add(`${parsed.protocol}//www.${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`)
      }
    } catch {
      // ignore invalid URLs
    }
  }
  return [...origins]
}

export const auth = betterAuth({
  baseURL: isProduction
    ? authUrl
    : {
        allowedHosts: ['localhost:*', '127.0.0.1:*'],
        protocol: 'http',
        fallback: authUrl,
      },
  trustedOrigins: buildTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    modelName: 'User',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'contributor',
        input: false,
      },
      reputation: {
        type: 'number',
        required: false,
        defaultValue: 0,
        input: false,
      },
    },
  },
  session: {
    modelName: 'Session',
  },
  account: {
    modelName: 'Account',
  },
  verification: {
    modelName: 'Verification',
  },
})
