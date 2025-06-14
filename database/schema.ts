import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { composeId } from "../app/lib/compose-id"
import { user } from "./auth-schema"

export const chatsTable = sqliteTable("chats", {
  id: text()
    .primaryKey()
    .$defaultFn(() => composeId("chat")),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date(),
  ),
})

export const chatsRelations = relations(chatsTable, ({ many }) => ({
  messages: many(messagesTable),
}))

export const messagesTable = sqliteTable("messages", {
  id: text().primaryKey(),
  chatId: text()
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  content: text().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
    () => new Date(),
  ),
})

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
}))

export * from "./auth-schema"
