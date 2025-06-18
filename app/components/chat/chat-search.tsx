import { Search } from "lucide-react"
import * as React from "react"
import { useNavigate } from "react-router"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command"
import type { Chat } from "~/database/schema"
import { Button, ToolTipButton } from "../ui/button"

export function ChatSearch({ chats }: { chats: Chat[] }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigate = useNavigate()

  return (
    <>
      <ToolTipButton content="Search chats">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="size-7 p-0.5"
        >
          <Search className="size-4 stroke-2" />
        </Button>
      </ToolTipButton>

      <CommandDialog
        className="dark:bg-sidebar"
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput placeholder="Search or press enter for new chat..." />
        <CommandList>
          <CommandGroup heading="Recent chats">
            <CommandEmpty>No results found.</CommandEmpty>
            {chats.map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() => {
                  setOpen(false)
                  new Promise((resolve) => {
                    setTimeout(() => {
                      navigate(`/chats/${chat.id}`, { replace: true })
                      resolve(true)
                    }, 500)
                  })
                }}
              >
                <div onKeyDown={() => setOpen(false)}>{chat.title}</div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  )
}
