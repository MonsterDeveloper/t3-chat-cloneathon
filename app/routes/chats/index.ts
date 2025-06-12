import { redirect } from "react-router"
import type { Route } from "./+types/index"

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  return redirect("/chats/1") // TODO create new chat
}
