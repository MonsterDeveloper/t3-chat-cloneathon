import { type Message, useChat } from "@ai-sdk/react"
import { and, eq, sql } from "drizzle-orm"
import { Moon, Plus, Search, Settings2 } from "lucide-react"
import * as React from "react"
import { Link, redirect, useLocation } from "react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { ChatInputBox } from "~/components/chat/chat-box"
import { ChatMessage } from "~/components/chat/chat-message"
import { SiteHeader } from "~/components/site-header"
import { Button, ToolTipButton } from "~/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar"
import { chatsTable, messagesTable } from "~/database/schema"
import { cn } from "~/lib/utils"
import type { Route } from "./+types/chat"

export function meta() {
  return [
    { title: "not T3 Chat" },
    { name: "description", content: "Define your goal for the chat." },
  ]
}

export async function loader({
  context,
  request,
  params: { chatId },
}: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const [chat, chats] = await Promise.all([
    context.db.query.chatsTable.findFirst({
      where: and(
        eq(chatsTable.id, chatId),
        eq(chatsTable.userId, session.user.id),
      ),
      with: {
        messages: true,
      },
    }),
    context.db
      .select({
        id: chatsTable.id,
        title: chatsTable.title,
        createdAt: chatsTable.createdAt,
        isPinned: chatsTable.isPinned,
        messageCount: sql<number>`count(${messagesTable.id})`.as(
          "message_count",
        ),
      })
      .from(chatsTable)
      .leftJoin(messagesTable, eq(chatsTable.id, messagesTable.chatId))
      .where(eq(chatsTable.userId, session.user.id))
      .groupBy(chatsTable.id),
  ])

  if (!chat) {
    throw new Response("Not Found", { status: 404 })
  }

  return {
    chatId,
    chats,
    initialMessages: chat.messages.map((message) => {
      return {
        ...(JSON.parse(message.content) as Message),
        createdAt: new Date(message.createdAt),
        id: message.id,
      }
    }),
  }
}

export default function Chat({
  loaderData: { chatId, initialMessages, chats },
}: Route.ComponentProps) {
  const {
    messages,
    input,
    status,
    error,
    handleInputChange,
    handleSubmit,
    stop,
  } = useChat({
    id: chatId,
    initialMessages,
    sendExtraMessageFields: true,
  })
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  return (
    <SidebarProvider>
      <LeftFloatingControls />
      <RightFloatingControls />
      <AppSidebar variant="inset" chats={chats} />
      <SidebarInset className="m-0 h-screen overflow-hidden border border-accent bg-card shadow-none transition-all duration-300 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:rounded-none md:peer-data-[variant=inset]:mr-0 md:peer-data-[variant=inset]:mb-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-scroll pb-24">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col items-center justify-center gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={crypto.randomUUID()}
                    content={message.content}
                    role={message.role}
                    model={"model"}
                  />
                ))}
                {error && (
                  <div className="w-full rounded-md bg-destructive/10 p-2 text-red-500 text-sm">
                    {error.message}
                  </div>
                )}
              </div>
              <div className="mb-5" ref={messagesEndRef} />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <ChatInputBox
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            status={status}
            stop={stop}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const LeftFloatingControls = () => {
  const { state, isMobile } = useSidebar()
  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-4 left-4 z-50 flex items-center justify-center gap-1 rounded-sm bg-accent px-2",
        {
          hidden: state === "expanded" && !isMobile,
        },
      )}
    >
      <ToolTipButton content="Toggle Sidebar">
        <SidebarTrigger />
      </ToolTipButton>
      <ToolTipButton content="Search chats">
        <Button variant="ghost" size="icon" className="p-0.5">
          <Search className="size-4 stroke-2" />
        </Button>
      </ToolTipButton>
      <ToolTipButton content="New chat">
        <Button variant="ghost" size="icon" className="p-0.5">
          <Plus className="size-5 stroke-2" />
        </Button>
      </ToolTipButton>
    </div>
  )
}
const RightFloatingControls = () => {
  const { isMobile } = useSidebar()
  const location = useLocation()
  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-4 right-4 z-50 flex items-center justify-center gap-1 rounded-sm bg-accent px-2",
        {
          hidden: isMobile,
        },
      )}
    >
      <ToolTipButton content="Settings">
        <Button variant="ghost" size="icon" className="p-0.5" asChild>
          <Link
            to={{
              pathname: "/settings",
              search: location.pathname.startsWith("/chats/")
                ? new URLSearchParams({
                    rt: location.pathname.split("/").at(-1)!,
                  }).toString()
                : undefined,
            }}
            prefetch="intent"
          >
            <Settings2 className="size-4" />
          </Link>
        </Button>
      </ToolTipButton>

      <ToolTipButton content="Toggle Dark Mode">
        <Button variant="ghost" size="icon" className="p-0.5">
          <Moon className="size-4" />
        </Button>
      </ToolTipButton>
    </div>
  )
}

export async function action({ context, request }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const formData = await request.formData()
  const chatId = String(formData.get("chatId"))

  const chat = await context.db.query.chatsTable.findFirst({
    where: and(
      eq(chatsTable.id, chatId),
      eq(chatsTable.userId, session.user.id),
    ),
    columns: {
      id: true,
    },
  })

  if (!chat) {
    return redirect("/chats")
  }

  const intent = String(formData.get("intent"))

  if (intent === "delete") {
    await context.db
      .delete(chatsTable)
      .where(
        and(eq(chatsTable.id, chatId), eq(chatsTable.userId, session.user.id)),
      )

    return redirect("/chats")
  }

  if (intent === "rename") {
    const title = String(formData.get("title")).trim()

    if (title.length === 0) {
      return {
        error: "Title is required",
      }
    }

    await context.db
      .update(chatsTable)
      .set({ title })
      .where(
        and(eq(chatsTable.id, chatId), eq(chatsTable.userId, session.user.id)),
      )

    return {
      success: "Chat renamed",
    }
  }

  if (intent === "pin") {
    const isPinned = formData.get("isPinned") === "true"

    await context.db
      .update(chatsTable)
      .set({
        isPinned,
      })
      .where(
        and(eq(chatsTable.id, chatId), eq(chatsTable.userId, session.user.id)),
      )

    return {
      success: "Chat pinned",
    }
  }

  throw new Response("Invalid intent", { status: 400 })
}
