"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
    title: string
    href?: string
    icon?: React.ReactNode
    children?: NavItem[]
}

export function SidebarNav({ items }: { items: NavItem[] }) {
    const pathname = usePathname()
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        "Getting Started": true, // Open by default
    })

    const toggleSection = (title: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }))
    }

    const renderNavItems = (items: NavItem[], level = 0) => {
        return items.map((item, index) => {
            // Check if current path is active or is a child of this item
            const isActive = pathname === item.href
            const isActiveParent = item.children?.some(
                (child) => pathname === child.href || child.children?.some((grandchild) => pathname === grandchild.href),
            )
            const hasChildren = !!item.children?.length
            const isOpen = openSections[item.title] || isActiveParent

            // For section headers without links
            if (!item.href && item.children) {
                return (
                    <div key={index} className="mt-6 first:mt-0">
                        <h4 className="mb-1 px-2 text-sm font-semibold tracking-tight text-muted-foreground">{item.title}</h4>
                        <div className="space-y-1">{renderNavItems(item.children, level + 1)}</div>
                    </div>
                )
            }

            // For items with children (dropdowns)
            if (hasChildren) {
                return (
                    <div key={index}>
                        <button
                            onClick={() => toggleSection(item.title)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted",
                                (isActive || isActiveParent) && "bg-muted text-primary",
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {item.icon}
                                {item.title}
                            </span>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        {isOpen && item.children && (
                            <div className="ml-4 mt-1 space-y-1">{renderNavItems(item.children, level + 1)}</div>
                        )}
                    </div>
                )
            }

            // For regular links
            return (
                <Link
                    key={index}
                    href={item.href || "#"}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted",
                        isActive && "bg-muted text-primary font-semibold",
                    )}
                >
                    {item.icon}
                    {item.title}
                </Link>
            )
        })
    }

    // Add this useEffect to automatically open sections based on current path
    useEffect(() => {
        // Find which sections should be open based on current path
        const sectionsToOpen: Record<string, boolean> = { ...openSections }

        const findParentSection = (items: NavItem[]) => {
            items.forEach((item) => {
                if (item.children) {
                    const hasActiveChild = item.children.some(
                        (child) => pathname === child.href || child.children?.some((grandchild) => pathname === grandchild.href),
                    )

                    if (hasActiveChild) {
                        sectionsToOpen[item.title] = true
                    }

                    findParentSection(item.children)
                }
            })
        }

        findParentSection(items)
        setOpenSections(sectionsToOpen)
    }, [pathname, items])

    return <>{renderNavItems(items)}</>
}

