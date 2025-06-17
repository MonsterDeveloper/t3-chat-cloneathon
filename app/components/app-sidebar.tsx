import {
  isToday,
  isWithinInterval,
  isYesterday,
  startOfDay,
  subDays,
} from "date-fns"
import type { InferSelectModel } from "drizzle-orm"
import { Pin, Search, X } from "lucide-react"
import { matchSorter } from "match-sorter"
import type * as React from "react"
import {
  type ComponentProps,
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react"
import { Link, useFetcher, useLocation } from "react-router"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import type { chatsTable } from "~/database/schema"
import { useViewer } from "~/lib/auth-client"
import { cn } from "~/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { ToolTipButton } from "./ui/button"
import { Input } from "./ui/input"

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialog as Dialog,
} from "~/components/ui/alert-dialog"

interface Chat
  extends Pick<
    InferSelectModel<typeof chatsTable>,
    "id" | "title" | "createdAt" | "isPinned"
  > {
  messageCount: number
}

interface Props extends ComponentProps<typeof Sidebar> {
  chats: Chat[]
}

function groupChatsByDate(chats: Chat[]) {
  const now = new Date()
  const sevenDaysAgo = startOfDay(subDays(now, 7))
  const thirtyDaysAgo = startOfDay(subDays(now, 30))

  const groups = {
    pinned: [] as Chat[],
    today: [] as Chat[],
    yesterday: [] as Chat[],
    lastWeek: [] as Chat[],
    lastMonth: [] as Chat[],
    older: [] as Chat[],
  }

  for (const chat of chats) {
    const chatDate = new Date(chat.createdAt)

    if (chat.isPinned) {
      groups.pinned.push(chat)
    } else if (isToday(chatDate)) {
      groups.today.push(chat)
    } else if (isYesterday(chatDate)) {
      groups.yesterday.push(chat)
    } else if (
      isWithinInterval(chatDate, {
        start: sevenDaysAgo,
        end: startOfDay(subDays(now, 2)),
      })
    ) {
      groups.lastWeek.push(chat)
    } else if (
      isWithinInterval(chatDate, { start: thirtyDaysAgo, end: sevenDaysAgo })
    ) {
      groups.lastMonth.push(chat)
    } else {
      groups.older.push(chat)
    }
  }

  return groups
}

interface ChatGroupProps {
  title: string
  chats: Chat[]
}

function ChatGroup({ title, chats }: ChatGroupProps) {
  const location = useLocation()
  const fetcher = useFetcher()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Use useOptimistic with React Router's fetcher
  const [optimisticChats, updateOptimisticChats] = useOptimistic(
    chats,
    (
      state,
      action: {
        type: string
        chatId: string
        title?: string
        isPinned?: boolean
      },
    ) => {
      switch (action.type) {
        case "rename":
          return state.map((chat) =>
            chat.id === action.chatId
              ? { ...chat, title: action.title! }
              : chat,
          )
        case "pin":
          return state.map((chat) =>
            chat.id === action.chatId
              ? { ...chat, isPinned: action.isPinned! }
              : chat,
          )
        case "delete":
          return state.filter((chat) => chat.id !== action.chatId)
        default:
          return state
      }
    },
  )

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  // Handle edit mode
  const startEditing = (chat: Chat) => {
    setEditingId(chat.id)
    setEditingTitle(chat.title || "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  // Optimistic updates with React Router
  const handleRename = (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      cancelEditing()
      return
    }

    startTransition(() => {
      updateOptimisticChats({ type: "rename", chatId, title: newTitle })
    })

    const formData = new FormData()
    formData.append("intent", "rename")
    formData.append("title", newTitle)

    fetcher.submit(formData, {
      method: "POST",
      action: `/chats/${chatId}`,
    })

    cancelEditing()
  }

  const handlePin = (chatId: string, isPinned: boolean) => {
    startTransition(() => {
      updateOptimisticChats({ type: "pin", chatId, isPinned })
    })

    const formData = new FormData()
    formData.append("intent", "pin")
    formData.append("isPinned", String(isPinned))

    fetcher.submit(formData, {
      method: "POST",
      action: `/chats/${chatId}`,
    })
  }

  const handleDelete = (chatId: string) => {
    startTransition(() => {
      updateOptimisticChats({ type: "delete", chatId })
    })

    const formData = new FormData()
    formData.append("intent", "delete")

    fetcher.submit(formData, {
      method: "POST",
      action: `/chats/${chatId}`,
    })
  }

  if (optimisticChats.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {optimisticChats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                tooltip={chat.title || "Untitled"}
                className="group/chat flex items-center gap-2"
                isActive={location.pathname.includes(chat.id)}
                asChild
              >
                <Link to={`/chats/${chat.id}`} prefetch="intent">
                  {editingId === chat.id ? (
                    <div
                      className="w-full"
                      onKeyDown={(e) => e.preventDefault()}
                    >
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleRename(chat.id, editingTitle)
                        }}
                        className="w-full"
                      >
                        <Input
                          ref={inputRef}
                          className="border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleRename(chat.id, editingTitle)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              cancelEditing()
                            }
                          }}
                        />
                      </form>
                    </div>
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        startEditing(chat)
                      }}
                      className="line-clamp-1 flex-1"
                    >
                      {chat.title || "Untitled"}
                    </span>
                  )}

                  {editingId !== chat.id && (
                    <div className="absolute right-0 flex h-full translate-x-full items-center justify-center gap-1 rounded-md bg-sidebar-accent px-1 opacity-0 shadow-[-2px_0_4px_var(--sidebar-accent)] backdrop-blur-[2px] transition-all duration-100 group-hover/chat:translate-x-0 group-hover/chat:opacity-100">
                      <ToolTipButton content={chat.isPinned ? "Unpin" : "Pin"}>
                        <Button
                          variant="ghost"
                          className="size-7 p-0 hover:bg-accent"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePin(chat.id, !chat.isPinned)
                          }}
                          disabled={fetcher.state !== "idle"}
                        >
                          <Pin
                            className={`size-4 ${chat.isPinned ? "fill-current" : ""}`}
                          />
                        </Button>
                      </ToolTipButton>
                      <AlertDialog
                        title="Delete thread"
                        disabled={fetcher.state !== "idle"}
                        description={`Are you sure you want to delete ${chat.title || "thread"}? This action cannot be undone.`}
                        onCancel={() => null}
                        onConfirm={(e) => {
                          e.preventDefault()
                          handleDelete(chat.id)
                        }}
                      >
                      <ToolTipButton content="Delete Thread">
                        <div className="rounded-md p-1.5 hover:bg-destructive hover:text-destructive-foreground">
                          <X className="size-4" />
                        </div>
                      </ToolTipButton>

                      </AlertDialog>

                      
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ chats, ...props }: Props) {
  const location = useLocation()
  const viewer = useViewer()
  const [searchQuery, setSearchQuery] = useState("")
  const groupedChats = useMemo(() => {
    const filteredChats = matchSorter(
      chats.filter((chat) => chat.messageCount > 0),
      searchQuery,
      { keys: ["title"] },
    )

    return groupChatsByDate(filteredChats)
  }, [searchQuery, chats])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-8">
              <SidebarTrigger className="-ml-1" />
              <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
                <Link
                  className="relative flex h-8 w-24 items-center justify-center font-semibold text-foreground text-sm"
                  to="/chat"
                  data-discover="true"
                >
                  <div className="h-3.5 select-none">
                    <svg
                      version="1.1"
                      id="Layer_1"
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      viewBox="0 0 247.7 53"
                      className="size-full text-[--wordmark-color]"
                      aria-label="T3 Logo"
                    >
                      <title>T3 Logo</title>
                      <path
                        fill="currentcolor"
                        d="M205.6,50.3c1.9-1,3.5-2.2,4.7-3.6v4.4v0.4h0.4h7.7h0.4v-0.4V13.5v-0.4h-0.4h-7.7h-0.4v0.4v4.3
	c-1.2-1.4-2.8-2.6-4.6-3.5c-2.2-1.2-4.8-1.8-7.8-1.8c-3.3,0-6.3,0.8-9,2.5c-2.7,1.7-4.9,4-6.4,6.9l0,0c-1.6,3-2.4,6.4-2.4,10.2
	c0,3.8,0.8,7.3,2.4,10.3c1.6,3,3.7,5.4,6.4,7.1c2.7,1.7,5.7,2.6,8.9,2.6C200.6,52.1,203.3,51.5,205.6,50.3z M208.7,25.7l0.3,0.5
	c0.8,1.7,1.2,3.7,1.2,6c0,2.5-0.5,4.7-1.5,6.6c-1,1.9-2.4,3.3-4,4.2c-1.6,1-3.4,1.5-5.3,1.5c-1.9,0-3.6-0.5-5.3-1.5
	c-1.7-1-3-2.4-4-4.3c-1-1.9-1.5-4.1-1.5-6.6c0-2.5,0.5-4.7,1.5-6.5c1-1.8,2.3-3.2,4-4.1c1.6-1,3.4-1.4,5.3-1.4
	c1.9,0,3.7,0.5,5.3,1.4C206.4,22.5,207.7,23.9,208.7,25.7z"
                      />
                      <path
                        fill="currentcolor"
                        d="M99.6,21.4L99.6,21.4l-0.3,0.5c-1.6,3-2.4,6.5-2.4,10.4s0.8,7.4,2.4,10.4c1.6,3,3.8,5.3,6.6,7
	c2.8,1.7,6,2.5,9.6,2.5c4.5,0,8.2-1.2,11.3-3.5c3-2.3,5.1-5.4,6.2-9.3l0.1-0.5h-0.5h-8.3H124l-0.1,0.3c-0.7,1.9-1.7,3.3-3.1,4.3
	c-1.4,0.9-3.1,1.4-5.3,1.4c-3,0-5.4-1.1-7.2-3.3l0,0c-1.8-2.2-2.7-5.3-2.7-9.3c0-4,0.9-7,2.7-9.2c1.8-2.2,4.2-3.2,7.2-3.2
	c2.2,0,3.9,0.5,5.3,1.5c1.4,1,2.4,2.4,3.1,4.2l0.1,0.3h0.3h8.3h0.5l-0.1-0.5c-1-4.1-3.1-7.3-6.1-9.5c-3-2.2-6.8-3.3-11.4-3.3
	c-3.6,0-6.8,0.8-9.6,2.5l0,0C103.2,16.4,101.1,18.6,99.6,21.4z"
                      />
                      <g>
                        <polygon
                          fill="currentcolor"
                          points="237.8,13.2 237.8,3.9 229.1,3.9 229.1,13.2 224.8,13.2 224.8,20.5 229.1,20.5 229.1,52.1 230,51.2 
		230,51.2 232,49.2 237.8,43.2 237.8,20.5 246.8,20.5 246.8,13.2 	"
                        />
                        <path
                          fill="currentcolor"
                          d="M71.7,3.4H51.5l-7.1,7.2h18.8"
                        />
                        <path
                          fill="currentcolor"
                          d="M166.8,14.5l-0.1-0.1c-2.3-1.3-4.9-1.9-7.7-1.9c-2.4,0-4.6,0.5-6.7,1.3c-1.6,0.7-3,1.7-4.2,2.8V0.1l-8.6,8.8
		v42.7h8.6V30.1c0-3.2,0.8-5.7,2.4-7.3c1.6-1.7,3.7-2.5,6.4-2.5s4.8,0.8,6.4,2.5c1.6,1.7,2.3,4.2,2.3,7.4v21.4h8.5V29
		c0-3.5-0.6-6.4-1.9-8.9C170.8,17.6,169,15.7,166.8,14.5z"
                        />
                        <path
                          fill="currentcolor"
                          d="M43,3.4H0v0.5l0,0v3.2v3.7h3.5l0,0h11.9v40.8H24V10.7h11.8L43,3.4z"
                        />
                      </g>
                      <path
                        fill="currentcolor"
                        d="M71.9,25.4l-0.2-0.2h0c-2.2-2.3-5.3-3.7-9.1-4.2L73.4,9.8V3.4H54.8l-9.4,7.2h17.7L52.5,21.8v5.9h7
	c2.5,0,4.4,0.7,5.9,2.2c1.4,1.4,2.1,3.4,2.1,6.1c0,2.6-0.7,4.7-2.1,6.2c-1.4,1.5-3.4,2.2-5.9,2.2c-2.5,0-4.4-0.7-5.7-2
	c-1.4-1.4-2.1-3.1-2.3-5.2l0-0.5h-8.1l0,0.5c0.2,4.6,1.8,8.1,4.8,10.5c2.9,2.4,6.7,3.7,11.3,3.7c5,0,9-1.4,11.9-4.2
	c2.9-2.8,4.4-6.6,4.4-11.3C75.6,31.5,74.4,28,71.9,25.4z"
                      />
                      <rect
                        x="84.3"
                        y="44.2"
                        fill="currentcolor"
                        width="6.9"
                        height="6.9"
                      />
                    </svg>
                  </div>
                </Link>
              </h1>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <NavMain>
          <SidebarMenuItem className="flex items-center gap-2 border-b px-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Search className="size-4" />
            <Input
              type="text"
              placeholder="Search your threads"
              className="w-full border-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SidebarMenuItem>
        </NavMain>

        {/* Show pinned chats first if they exist */}
        {groupedChats.pinned.length > 0 && (
          <ChatGroup title="Pinned" chats={groupedChats.pinned} />
        )}

        <ChatGroup title="Today" chats={groupedChats.today} />
        <ChatGroup title="Yesterday" chats={groupedChats.yesterday} />
        <ChatGroup title="Last 7 days" chats={groupedChats.lastWeek} />
        <ChatGroup title="Last 30 days" chats={groupedChats.lastMonth} />
        <ChatGroup title="Older" chats={groupedChats.older} />

        <NavSecondary className="mt-auto">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto p-3">
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
                aria-label="Go to settings"
              >
                <div className="flex w-full min-w-0 flex-row items-center gap-3">
                  <Avatar
                    className={cn(
                      "size-8",
                      viewer.isHidePersonalInfoEnabled && "blur-sm",
                    )}
                  >
                    <AvatarImage src={viewer.image ?? undefined} />
                    <AvatarFallback className="bg-muted text-xs">
                      {viewer.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col text-foreground">
                    <span
                      className={cn(
                        "truncate font-medium text-sm",
                        viewer.isHidePersonalInfoEnabled && "blur-sm",
                      )}
                    >
                      {viewer.name}
                    </span>
                    <span className="text-xs">Free plan</span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </NavSecondary>
      </SidebarContent>
    </Sidebar>
  )
}

export function AlertDialog({
  children,
  title,
  description,
  onConfirm,
  onCancel,
  disabled = false,
}: {
  children: React.ReactNode
  title: string
  description: string
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}) {
  return (
    <Dialog>
      <AlertDialogTrigger
        className="flex items-center justify-center"
        disabled={disabled}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-primary">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={disabled}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={disabled}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </Dialog>
  )
}
