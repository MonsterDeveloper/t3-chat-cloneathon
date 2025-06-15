import { type Message, appendResponseMessages, streamText } from "ai"
import { and, eq, sql } from "drizzle-orm"
import { redirect } from "react-router"
import { chatsTable, messagesTable } from "~/database/schema"
import { generateChatTitle } from "~/lib/generate-chat-title.server"
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
            createdAt: createdAt
              ? new Date(createdAt).toISOString()
              : new Date().toISOString(),
          })),
        )
        .onConflictDoUpdate({
          target: messagesTable.id,
          set: { content: sql.raw(`excluded.${messagesTable.content.name}`) },
        })

      if (!chat.title) {
        await context.db
          .update(chatsTable)
          .set({
            title: await generateChatTitle(
              context.openrouter,
              fullMessages[0].content,
            ),
          })
          .where(eq(chatsTable.id, chatId))
      }

      if (fullMessages.length <= 2) {
        await context.db
          .update(chatsTable)
          .set({
            createdAt: new Date().toISOString(),
          })
          .where(eq(chatsTable.id, chatId))
      }
    },
  })

  return result.toDataStreamResponse()
}
