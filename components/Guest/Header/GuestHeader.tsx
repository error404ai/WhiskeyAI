import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LoggedIn from "@/components/wrappers/LoggedIn";
import LoggedOut from "@/components/wrappers/LoggedOut";
import { cn } from "@/lib/utils";
import { LayoutPanelTop, Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Logo from "../Common/Logo";
import ConnectButton from "./_partials/ConnectButton";
import DisconnectButton from "./_partials/DisconnectButton";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./_partials/navigation-menu";

const navigationMenuTriggerStyle = "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

// const navigationMenuTriggerStyle =
//   "group inline-flex h-10 w-max items-center justify-center rounded-md bg-gradient-to-r from-[#00ffe0] to-[#00ffe055] px-4 py-2 text-sm font-medium text-black transition-all hover:brightness-110 focus:outline-none disabled:pointer-events-none disabled:opacity-50";


export function GuestHeader() {
  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all", " bg-transparent border-b border-white/10")}>

      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Logo />
          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/agent" className={navigationMenuTriggerStyle}>
                    Agent
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <Link href="/services" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle}>Services</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem> */}
                <NavigationMenuItem>
                  <NavigationMenuLink href="/faq" className={navigationMenuTriggerStyle}>
                    FAQ
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="https://whiskey-ai.gitbook.io/whiskey-ai" target="_blank" rel="noopener noreferrer" className={navigationMenuTriggerStyle}>
                    DOCS
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        {/* <LoggedOut>
          <div className="hidden items-center gap-4 md:flex">
            <ConnectButton />
          </div>
        </LoggedOut> */}
        <LoggedOut>
          <div className="hidden items-center gap-4 md:flex">
            <ConnectButton
              size="lg"
              className="group bg-gradient-to-r from-[#00ffe0] to-[#00ffe055] text-black px-4 py-2 rounded-md shadow-md hover:brightness-110 transition-all"
            />
          </div>
        </LoggedOut>

        <LoggedIn>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <Button link="/my-agents">
                <LayoutPanelTop />
                My Agents
              </Button>
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <DisconnectButton />
            </div>
          </div>
        </LoggedIn>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" parentClass="w-fit md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" title="Menu">
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/agent" className="hover:text-primary text-lg font-semibold">
                Agent
              </Link>
              {/* <Link href="/services" className="hover:text-primary text-lg font-semibold">
                Services
              </Link> */}
              <Link href="/faq" className="hover:text-primary text-lg font-semibold">
                FAQ
              </Link>
              <Link href="https://whiskey-ai.gitbook.io/whiskey-ai" passHref>
                <a target="_blank" rel="noopener noreferrer" className="hover:text-primary text-lg font-semibold">
                  DOCS
                </a>
              </Link>
              <div className="flex flex-col gap-2">
                <ConnectButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a ref={ref} className={cn("hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none", className)} {...props}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
