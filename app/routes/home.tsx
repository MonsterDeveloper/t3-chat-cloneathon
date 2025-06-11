import { redirect } from "react-router"
import type { Route } from "./+types/home"

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (session) {
    return redirect("/chat")
  }

  return redirect("/sign-in")
}
