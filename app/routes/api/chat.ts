import { type Message, appendResponseMessages, streamText } from "ai"
import { and, eq, sql } from "drizzle-orm"
import { redirect } from "react-router"
import { chatsTable, messagesTable } from "~/database/schema"
import type { Route } from "./+types/chat"

export async function action({ request, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const {
    messages,
    data: { model },
    id: chatId,
  } = (await request.json()) as {
    messages: Message[]
    data: {
      model: string
    }
    id: string
  }

  const chat = await context.db.query.chatsTable.findFirst({
    where: and(
      eq(chatsTable.id, chatId),
      eq(chatsTable.userId, session.user.id),
    ),
  })

  if (!chat) {
    throw new Response("Not Found", { status: 404 })
  }

  const result = streamText({
    model: context.openrouter(model),
    messages,
    async onFinish({ response }) {
      const fullMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      })

      await context.db
        .insert(messagesTable)
        .values(
          fullMessages.map(({ id, createdAt, ...message }) => ({
            id,
            content: JSON.stringify(message),
            chatId,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
          })),
        )
        .onConflictDoUpdate({
          target: messagesTable.id,
          set: { content: sql.raw(`excluded.${messagesTable.content.name}`) },
        })

      console.log(
        JSON.stringify(
          {
            chatId,
            fullMessages,
          },
          null,
          2,
        ),
      )
    },
  })

  return result.toDataStreamResponse()
}
