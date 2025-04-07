import type React from "react"
// import { Search } from "lucide-react"
import { SidebarNav } from "./layout-client"
import { Link } from "next-view-transitions"

interface NavItem {
    title: string
    href?: string
    icon?: React.ReactNode
    children?: NavItem[]
}

const sidebarItems: NavItem[] = [
    {
        title: "BASICS",
        children: [
            { title: "What is Whiskey.io", href: "/docs" },
            { title: "Capabilities", href: "/docs/capabilities" },
            { title: "Product Roadmap", href: "/docs/roadmap" },
            { title: "Official Links", href: "/docs/links" },
            // { title: "Tokenomics", href: "/docs/tokenomics" },
        ],
    },
    {
        title: "CREATE AN AGENT",
        children: [
            {
                title: "Getting Started",
                href: "/docs/getting-started",
                children: [
                    { title: "Agent Dashboard", href: "/docs/getting-started/dashboard" },
                    { title: "Information", href: "/docs/getting-started/information" },
                    { title: "Twitter Configuration", href: "/docs/getting-started/twitter-configuration" },
                    { title: "Configure Triggers", href: "/docs/getting-started/triggers" },
                    { title: "Configure Functions", href: "/docs/getting-started/functions" },
                    { title: "Finalize and Launch", href: "/docs/getting-started/launch" },
                ],
            },
        ],
    },
    // {
    //     title: "API Access",
    //     href: "/docs/api",
    // },
]

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <Link href="/" target="_blank" className="hover:text-primary text-lg font-semibold">
                        <span className="italic">WHISKEY AI</span>
                    </Link>


                </div>
                {/* <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Ask or search..."
                            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[300px] lg:w-[400px]"
                        />
                        <div className="absolute right-2.5 top-2.5 text-xs text-muted-foreground">Ctrl K</div>
                    </div>
                </div> */}
            </header>
            <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
                <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                    <div className="h-full py-6 pl-4 pr-6">
                        <nav className="flex flex-col space-y-1">
                            <SidebarNav items={sidebarItems} />
                        </nav>
                        <div className="mt-10 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Powered by Whiskey AI</span>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="relative max-w-4xl px-4 py-6 lg:px-8">{children}</main>
            </div>
        </div>
    )
}

