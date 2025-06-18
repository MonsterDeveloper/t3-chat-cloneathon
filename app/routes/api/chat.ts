import { type Message, appendResponseMessages, streamText } from "ai"
import { type InferInsertModel, and, eq, sql } from "drizzle-orm"
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

  for (const message of messages) {
    if (!message.experimental_attachments) {
      continue
    }

    // retrieve the attachments from the bucket by their id
    for (const attachment of message.experimental_attachments) {
      const attachmentId = attachment.url // we store attachment id as the url
      const file = await context.cloudflare.env.ATTACHMENTS.get(attachmentId)

      if (!file || file.customMetadata?.userId !== session.user.id) {
        throw new Response("Attachment Not found", { status: 500 })
      }

      const arrayBuffer = await file.arrayBuffer()

      const base64Content = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      )

      attachment.url = `data:${file.httpMetadata?.contentType};base64,${base64Content}`
      attachment.contentType =
        file.httpMetadata?.contentType ?? "application/octet-stream"
      attachment.name = attachmentId
    }
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
          fullMessages.map<InferInsertModel<typeof messagesTable>>(
            ({ id, createdAt, experimental_attachments, ...message }) => ({
              id,
              attachmentIds: JSON.stringify(
                experimental_attachments?.map(({ name }) => name),
              ),
              content: JSON.stringify(message),
              chatId,
              createdAt: createdAt
                ? new Date(createdAt).toISOString()
                : new Date().toISOString(),
            }),
          ),
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
