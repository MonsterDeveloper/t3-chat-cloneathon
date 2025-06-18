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
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").$onUpdateFn(() => sql`(current_timestamp)`),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false).notNull(),
})

export type Chat = Omit<typeof chatsTable.$inferSelect, "userId" |  "updatedAt"> 

export const chatsRelations = relations(chatsTable, ({ many }) => ({
  messages: many(messagesTable),
}))

export const messagesTable = sqliteTable("messages", {
  id: text().primaryKey(),
  chatId: text()
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  content: text().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").$onUpdateFn(() => sql`(current_timestamp)`),
})

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
}))

export * from "./auth-schema"
