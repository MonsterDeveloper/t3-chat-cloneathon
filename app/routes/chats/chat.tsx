import { useChat } from "@ai-sdk/react"
import { Moon, Search, Settings2 } from "lucide-react"
import { Plus } from "lucide-react"
import type * as React from "react"
import { redirect } from "react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { ChatInputBox } from "~/components/chat-box"
import { SiteHeader } from "~/components/site-header"
import { Button } from "~/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "~/components/ui/sidebar"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Tooltip } from "~/components/ui/tooltip"
import { TooltipTrigger } from "~/components/ui/tooltip"
import { TooltipContent } from "~/components/ui/tooltip"
import { cn } from "~/lib/utils"
import type { Route } from "./+types/chat"

export function meta() {
  return [
    { title: "not T3 Chat" },
    { name: "description", content: "Define your goal for the chat." },
  ]
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }
  return null
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  console.log(messages)

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
      <SidebarInset className="m-0 border border-accent shadow-none transition-all duration-300 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:rounded-none md:peer-data-[variant=inset]:mr-0 md:peer-data-[variant=inset]:mb-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <h1 className="font-bold text-2xl">Definitely not T3 Chat</h1>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0">
              <ChatInputBox
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const LeftFloatingControls = () => {
  const { state } = useSidebar()
  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-4 left-4 z-50 flex items-center justify-center gap-2 rounded-sm bg-accent px-2",
        {
          hidden: state === "expanded",
        },
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" title="Toggle Sidebar">
          <p>Toggle Sidebar</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="p-0.5">
            <Search className="size-5 stroke-2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" title="Search chats">
          <p>Search chats</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="p-0.5">
            <Plus className="size-5 stroke-2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" title="Add new chat">
          <p>Add new chat</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
const RightFloatingControls = () => {
  const { state } = useSidebar()

  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-4 right-4 z-50 flex items-center justify-center gap-2 rounded-sm bg-accent px-2",
        {
          hidden: state === "expanded",
        },
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="p-0.5">
            <Settings2 className="size-5 stroke-2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" title="Settings">
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="p-0.5">
            <Moon className="size-5 stroke-2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" title="Toggle Dark Mode">
          <p>Toggle Dark Mode</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
