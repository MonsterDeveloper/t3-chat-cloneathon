import type { Route } from "./+types/auth"

export function loader({ request, context }: Route.LoaderArgs) {
  return context.auth.handler(request)
}

export function action({ request, context }: Route.ActionArgs) {
  return context.auth.handler(request)
}
