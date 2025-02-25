"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "./navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bot } from "lucide-react"


const products = [
    {
        title: "Task Automation",
        href: "/products/automation",
        description: "Train AI agents to handle repetitive tasks with human-like intelligence.",
    },
    {
        title: "Customer Service",
        href: "/products/customer-service",
        description: "24/7 customer support powered by conversational AI agents.",
    },
    {
        title: "Data Analysis",
        href: "/products/data-analysis",
        description: "Extract insights from your data using intelligent AI analysis.",
    },
    {
        title: "Workflow Integration",
        href: "/products/workflow",
        description: "Seamlessly integrate AI agents into your existing workflows.",
    },
]

const resources = [
    {
        title: "Documentation",
        href: "/docs",
        description: "Learn how to integrate and customize your AI agents.",
    },
    {
        title: "API Reference",
        href: "/api",
        description: "Detailed API documentation for developers.",
    },
    {
        title: "Case Studies",
        href: "/case-studies",
        description: "See how others are succeeding with AI agents.",
    },
    {
        title: "Blog",
        href: "/blog",
        description: "Latest updates, tips, and best practices.",
    },
]

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const pathname = usePathname()

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all",
                isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent",
            )}
        >
            <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <Bot className="h-6 w-6" />
                        <span className="font-bold inline-block italic">whiskeyAI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {/* <NavigationMenuItem>
                                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                            {products.map((product) => (
                                                <ListItem key={product.title} title={product.title} href={product.href}>
                                                    {product.description}
                                                </ListItem>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                            {resources.map((resource) => (
                                                <ListItem key={resource.title} title={resource.title} href={resource.href}>
                                                    {resource.description}
                                                </ListItem>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem> */}
                                <NavigationMenuItem>
                                    <Link href="/agent" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Agent</NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link href="/faq" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>FAQ</NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {/* <Button variant="ghost">
                        <Link href="/login">Sign In</Link>
                    </Button> */}
                    <Button>
                        <Link href="/connect">Connect</Link>
                    </Button>


                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-6">
                            {/* <Link href="/" className="flex items-center gap-2">
                                <Bot className="h-6 w-6" />
                                <span className="font-bold">AI Agents</span>
                            </Link>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg font-semibold">Products</h2>
                                {products.map((product) => (
                                    <Link key={product.title} href={product.href} className="text-muted-foreground hover:text-primary">
                                        {product.title}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg font-semibold">Resources</h2>
                                {resources.map((resource) => (
                                    <Link key={resource.title} href={resource.href} className="text-muted-foreground hover:text-primary">
                                        {resource.title}
                                    </Link>
                                ))}
                            </div> */}
                            <Link href="/agent" className="text-lg font-semibold hover:text-primary">
                                Agent
                            </Link>
                            <Link href="/faq" className="text-lg font-semibold hover:text-primary">
                                FAQ
                            </Link>
                            <div className="flex flex-col gap-2">
                                {/* <Button variant="outline">
                                    <Link href="/login">Sign In</Link>
                                </Button> */}
                                <Button>
                                    <Link href="/connect">Connect</Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className,
                        )}
                        {...props}
                    >
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
                    </a>
                </NavigationMenuLink>
            </li>
        )
    },
)
ListItem.displayName = "ListItem"

