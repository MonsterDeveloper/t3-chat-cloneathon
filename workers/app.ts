import {
  type OpenRouterProvider,
  createOpenRouter,
} from "@openrouter/ai-sdk-provider"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1"
import { type AppLoadContext, createRequestHandler } from "react-router"
import * as schema from "~/database/schema"

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
    db: DrizzleD1Database<typeof schema>
    openrouter: OpenRouterProvider
    auth: ReturnType<typeof betterAuth>
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
)

export default {
  fetch(request, env, ctx) {
    const db = drizzle(env.DB, { schema })

    const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })

    const auth = betterAuth({
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
    })

    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
      openrouter,
      auth,
    } satisfies AppLoadContext)
  },
} satisfies ExportedHandler<Env>
