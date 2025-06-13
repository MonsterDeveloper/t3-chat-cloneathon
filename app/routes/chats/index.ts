import { and, eq, isNull, sql } from "drizzle-orm"
import { redirect } from "react-router"
import { chatsTable, messagesTable } from "~/database/schema"
import type { Route } from "./+types/index"

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  // Get an existing empty chat (null title, matching user ID, 0 messages)
  const [emptyChat] = await context.db
    .select({
      id: chatsTable.id,
      userId: chatsTable.userId,
      title: chatsTable.title,
      createdAt: chatsTable.createdAt,
      messageCount: sql<number>`count(${messagesTable.id})`.as("messageCount"),
    })
    .from(chatsTable)
    .leftJoin(messagesTable, eq(chatsTable.id, messagesTable.chatId))
    .where(
      and(eq(chatsTable.userId, session.user.id), isNull(chatsTable.title)),
    )
    .groupBy(chatsTable.id)
    .having(sql`count(${messagesTable.id}) = 0`)
    .limit(1)

  if (emptyChat) {
    return redirect(`/chats/${emptyChat.id}`)
  }

  const [newChat] = await context.db
    .insert(chatsTable)
    .values({
      userId: session.user.id,
    })
    .returning({
      id: chatsTable.id,
    })

  return redirect(`/chats/${newChat.id}`)
}
