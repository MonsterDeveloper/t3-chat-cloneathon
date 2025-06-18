// import { redirect } from "react-router"
import { redirect } from "react-router"
import type { Route } from "./+types/get-attachment"

export async function loader({
  request,
  context,
  params: { id },
}: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const attachment = await context.cloudflare.env.ATTACHMENTS.get(id)

  if (!attachment || attachment.customMetadata?.userId !== session.user.id) {
    throw new Response("Not found", { status: 404 })
  }

  return new Response(attachment.body, {
    headers: {
      "Content-Type":
        attachment.httpMetadata?.contentType ?? "application/octet-stream",
    },
  })
}
