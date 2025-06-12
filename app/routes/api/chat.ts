import { type CoreMessage, streamText } from "ai"
import type { Route } from "./+types/chat"

export async function action({ request, context }: Route.ActionArgs) {
  const {
    messages,
    data: { model },
  } = (await request.json()) as {
    messages: CoreMessage[]
    data: {
      model: string
    }
  }

  const result = streamText({
    model: context.openrouter(model),
    messages,
  })

  return result.toDataStreamResponse()
}
