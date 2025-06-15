import {
  type OpenRouterProvider,
  createOpenRouter,
} from "@openrouter/ai-sdk-provider"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { anonymous } from "better-auth/plugins"
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1"
import type { AppLoadContext } from "react-router"
import * as schema from "./database/schema"

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment
      ctx: Omit<ExecutionContext, "props">
    }
    db: DrizzleD1Database<typeof schema>
    openrouter: OpenRouterProvider
    auth: ReturnType<typeof betterAuth>
  }
}

type GetLoadContextArgs = {
  request: Request
  context: Pick<AppLoadContext, "cloudflare">
}

export function getLoadContext({
  context,
}: GetLoadContextArgs): AppLoadContext {
  const env = context.cloudflare.env
  const db = drizzle(env.DB, { schema })

  const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })

  const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [anonymous()],
  })

  return {
    cloudflare: { env, ctx: context.cloudflare.ctx },
    db,
    openrouter,
    auth,
  } satisfies AppLoadContext
}
