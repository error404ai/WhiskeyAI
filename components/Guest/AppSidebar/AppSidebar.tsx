"use client";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, CalendarClock, ChevronDown, Loader2, Logs, LucideIcon, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "../Common/Logo";
import useIsAdmin from "@/hooks/useIsAdmin";

interface MenuItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  submenu?: Array<{
    title: string;
    url: string;
    icon?: LucideIcon;
  }>;
}

// User menu items
const userItems: MenuItem[] = [
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
    title: "Schedule Tweet",
    icon: CalendarClock,
    url: "/schedule-tweet",
  },
];

// Admin menu items
const adminItems: MenuItem[] = [

  {
    title: "Manage Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

interface MenuItemProps {
  item: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    submenu?: Array<{
      title: string;
      url: string;
      icon?: LucideIcon;
    }>;
  };
  isActive: boolean;
  open: boolean;
}

const MenuItem = ({ item, isActive, open }: MenuItemProps) => {
  // Check if current path is in submenu
  const path = usePathname();
  const isSubmenuActive = item.submenu?.some((subItem) => path === subItem.url);

  // Initialize submenuOpen state based on whether a submenu item is active
  const [submenuOpen, setSubmenuOpen] = useState(isSubmenuActive);

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  // Toggle submenu
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setSubmenuOpen(!submenuOpen);
    }
  };

  // Animation variants for dropdown
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: "hidden",
      margin: 0,
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.05,
        when: "beforeChildren",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  // Animation for individual submenu items
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild={!hasSubmenu}
          className={cn("hover:bg-blue-200", {
            "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-black hover:bg-blue-600 hover:text-white": isActive,
          })}
          onClick={hasSubmenu ? toggleSubmenu : undefined}
        >
          {hasSubmenu ? (
            <div className="flex w-full items-center">
              <div
                className={cn("b flex size-6 items-center justify-center overflow-hidden rounded-full", {
                  "bg-blue-700 text-white": isActive,
                  "bg-blue-500 text-white": !isActive,
                })}
              >
                {item.icon && <item.icon className="size-4" />}
              </div>
              <span className="ml-2 flex-1">{item.title}</span>
              <motion.div initial={false} animate={{ rotate: submenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
                <ChevronDown className="size-4" />
              </motion.div>
            </div>
          ) : (
            <Link href={item.url || "#"} prefetch>
              <div
                className={cn("b flex size-6 items-center justify-center overflow-hidden rounded-full", {
                  "bg-blue-700 text-white": isActive,
                  "bg-blue-500 text-white": !isActive,
                })}
              >
                {item.icon && <item.icon className="size-4" />}
              </div>
              <span>{item.title}</span>
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Submenu with animation */}
      <AnimatePresence>
        {hasSubmenu && submenuOpen && (
          <motion.div initial="hidden" animate="visible" exit="exit" variants={dropdownVariants} className="overflow-hidden">
            <div className={cn("ml-6 border-l border-blue-100/70 pl-2", { "pt-1": open })}>
              <SidebarMenu>
                {item.submenu?.map((subItem) => {
                  const isSubItemActive = path === subItem.url;
                  return (
                    <motion.div key={subItem.title} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={cn("rounded-md py-1.5 hover:bg-blue-200", {
                            "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-black hover:bg-blue-600 hover:text-white": isSubItemActive,
                          })}
                        >
                          <Link href={subItem.url} prefetch>
                            {subItem.icon ? (
                              <div
                                className={cn("b flex size-5 items-center justify-center overflow-hidden rounded-full", {
                                  "bg-blue-700 text-white": isSubItemActive,
                                  "bg-blue-500 text-white": !isSubItemActive,
                                })}
                              >
                                <subItem.icon className="size-3" />
                              </div>
                            ) : (
                              <div className="w-0"></div>
                            )}
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function AppSidebar() {
  const path = usePathname();
  const { open } = useSidebar();
  const {isAdmin, isLoading} = useIsAdmin();
  
  // Choose menu items based on admin status
  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4 py-0">
        <Logo iconOnly={!open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Chrome Extension</SidebarGroupLabel> */}

          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Loader2 className="size-8 animate-spin text-blue-500 mb-3" />
                <p className={cn("text-sm text-slate-500", { "hidden": !open })}>Loading menu...</p>
              </div>
            ) : (
              <SidebarMenu>
                {items.map((item) => {
                  // Check if current item or any of its submenu items are active
                  const isActive = path === item.url;
                  const isSubmenuActive = item.submenu?.some((subItem) => path === subItem.url) || false;
                  const activeState = isActive || isSubmenuActive;

                  return <MenuItem key={item.title} item={item} isActive={activeState} open={open} />;
                })}
              </SidebarMenu>
            )}
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
