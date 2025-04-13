"use client";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Bot, CalendarClock, Logs } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../Common/Logo";

// Menu items.
const items = [
  {
    title: "My Agents",
    url: "/my-agents",
    icon: Bot,
  },
  {
    title: "Agent Logs",
    url: "/agent-logs",
    icon: Logs,
  },
  {
    title: "Schedule Direct Tweeet",
    url: "/schedule-direct-tweet",
    icon: CalendarClock,
  },
];

export default function AppSidebar() {
  const path = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4 py-0">
        <Logo iconOnly={!open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Chrome Extension</SidebarGroupLabel> */}

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = path === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn("hover:bg-blue-200", {
                        "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-black hover:bg-blue-600 hover:text-white": isActive,
                      })}
                    >
                      <Link href={item.url} prefetch>
                        <div
                          className={cn("b flex size-6 items-center justify-center overflow-hidden rounded-full", {
                            "bg-blue-700 text-white": isActive,
                            "bg-blue-500 text-white": !isActive,
                          })}
                        >
                          <item.icon className="size-4" />
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                <div className="hidden items-center gap-4 md:flex bg-[#ef4444] p-2 rounded-lg w-full">
                  <DisconnectButton />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
