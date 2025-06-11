import { type Icon, IconCirclePlusFilled } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Input } from "./ui/input";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="New Chat"
              className="min-w-8 items-center justify-center bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconCirclePlusFilled />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) =>
            item.title === "Search" ? (
              <SidebarMenuItem
                key={item.title}
                className="flex items-center gap-2 border-b px-2 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {item.icon && <item.icon className="size-4" />}
                <Input
                  type="text"
                  placeholder="Search your threads"
                  className="w-full border-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                />
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="flex items-center gap-2"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
