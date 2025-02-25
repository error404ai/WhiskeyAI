import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LoggedIn from "@/components/wrappers/LoggedIn";
import LoggedOut from "@/components/wrappers/LoggedOut";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Logo from "../Common/Logo";
import ConnectButton from "./_partials/ConnectButton";
import DisconnectButton from "./_partials/DisconnectButton";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./_partials/navigation-menu";

const navigationMenuTriggerStyle = "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

export function GuestHeader() {
  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all", "bg-background/80 border-b backdrop-blur-sm")}>
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Logo />
          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/agent" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle}>Agent</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/faq" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle}>FAQ</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <LoggedOut>
          <div className="hidden items-center gap-4 md:flex">
            <ConnectButton />
          </div>
        </LoggedOut>
        <LoggedIn>
          <div className="hidden items-center gap-4 md:flex">
            <DisconnectButton />
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
              <Link href="/faq" className="hover:text-primary text-lg font-semibold">
                FAQ
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
