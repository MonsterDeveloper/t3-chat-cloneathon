import { useChat } from "@ai-sdk/react"
import { and, eq } from "drizzle-orm"
import { Moon, Plus, Search, Settings2 } from "lucide-react"
import type * as React from "react"
import { redirect } from "react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { ChatInputBox } from "~/components/chat/chat-box"
import { ChatMessage } from "~/components/chat/chat-message.client"
import { ClientOnly } from "~/components/client-only"
import { SiteHeader } from "~/components/site-header"
import { Button, ToolTipButton } from "~/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar"
import { chatsTable } from "~/database/schema"
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

  const chat = await context.db.query.chatsTable.findFirst({
    where: and(
      eq(chatsTable.id, chatId),
      eq(chatsTable.userId, session.user.id),
    ),
    with: {
      messages: true,
    },
  })

  if (!chat) {
    throw new Response("Not Found", { status: 404 })
  }

  return {
    chatId,
    initialMessages: chat.messages.map((message) => {
      return {
        ...JSON.parse(message.content),
        createdAt: message.createdAt,
        id: message.id,
      }
    }),
  }
}

export default function Chat({
  loaderData: { chatId, initialMessages },
}: Route.ComponentProps) {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({
      id: chatId,
      initialMessages,
      sendExtraMessageFields: true,
    })

  return (
    <SidebarProvider
      style={
        {
          position: "relative",
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <LeftFloatingControls />
      <RightFloatingControls />
      <AppSidebar variant="inset" />
      <SidebarInset className="m-0 h-screen overflow-hidden border border-accent bg-card shadow-none transition-all duration-300 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:rounded-none md:peer-data-[variant=inset]:mr-0 md:peer-data-[variant=inset]:mb-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-scroll pb-24">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col items-center justify-center gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-4">
                <ClientOnly>
                  {() => typeof ChatMessage === "function" ? messages.map((message) => (
                  <ChatMessage
                    key={crypto.randomUUID()}
                    content={message.content}
                    role={message.role}
                    model={"model"}
                  />
                )) : null}
                </ClientOnly>
              </div>
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
        <Button variant="ghost" size="icon" className="p-0.5">
          <Settings2 className="size-4" />
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
