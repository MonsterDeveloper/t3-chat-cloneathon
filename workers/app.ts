import {
  type OpenRouterProvider,
  createOpenRouter,
} from "@openrouter/ai-sdk-provider"
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1"
import { type AppLoadContext, createRequestHandler } from "react-router"
import * as schema from "../database/schema"

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
    db: DrizzleD1Database<typeof schema>
    openrouter: OpenRouterProvider
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

    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
      openrouter,
    } satisfies AppLoadContext)
  },
} satisfies ExportedHandler<Env>
