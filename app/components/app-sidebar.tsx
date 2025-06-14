import { IconHelp, IconSearch, IconSettings } from "@tabler/icons-react"
import {
  isToday,
  isWithinInterval,
  isYesterday,
  startOfDay,
  subDays,
} from "date-fns"
import type { InferSelectModel } from "drizzle-orm"
import { matchSorter } from "match-sorter"
import { type ComponentProps, useMemo, useState } from "react"
import { Link, useLocation } from "react-router"
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
import { Input } from "./ui/input"

interface Chat
  extends Pick<
    InferSelectModel<typeof chatsTable>,
    "id" | "title" | "createdAt"
  > {
  messageCount: number
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}

interface Props extends ComponentProps<typeof Sidebar> {
  chats: Chat[]
}

function groupChatsByDate(chats: Chat[]) {
  const now = new Date()
  const sevenDaysAgo = startOfDay(subDays(now, 7))
  const thirtyDaysAgo = startOfDay(subDays(now, 30))

  const groups = {
    today: [] as Chat[],
    yesterday: [] as Chat[],
    lastWeek: [] as Chat[],
    lastMonth: [] as Chat[],
    older: [] as Chat[],
  }

  for (const chat of chats) {
    const chatDate = new Date(chat.createdAt)

    if (isToday(chatDate)) {
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

  if (chats.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-medium text-muted-foreground text-xs">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                tooltip={chat.title ? chat.title : undefined}
                className="flex items-center gap-2"
                isActive={location.pathname.includes(chat.id)}
                asChild
              >
                <Link to={`/chats/${chat.id}`} prefetch="intent">
                  <span>{chat.title ?? "Untitled"}</span>
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
      <SidebarContent>
        <NavMain>
          <SidebarMenuItem className="flex items-center gap-2 border-b px-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <IconSearch className="size-4" />
            <Input
              type="text"
              placeholder="Search your threads"
              className="w-full border-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SidebarMenuItem>
        </NavMain>

        <ChatGroup title="Today" chats={groupedChats.today} />
        <ChatGroup title="Yesterday" chats={groupedChats.yesterday} />
        <ChatGroup title="Last 7 days" chats={groupedChats.lastWeek} />
        <ChatGroup title="Last 30 days" chats={groupedChats.lastMonth} />
        <ChatGroup title="Older" chats={groupedChats.older} />

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
