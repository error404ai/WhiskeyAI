"use client"

import { useState } from "react"
import {
    ArrowUpRight,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    Filter,
    MoreHorizontal,
    Search,
    Server,
    Settings,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progess"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for services
const generateMockServices = () => {
    const statuses = ["active", "inactive", "pending", "completed"]
    const types = ["API Integration", "Data Processing", "Automation", "Analytics", "Customer Support"]

    return Array.from({ length: 100 }, (_, i) => ({
        id: `srv-${i + 1000}`,
        name: `${types[Math.floor(Math.random() * types.length)]} Service ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
        performance: Math.floor(Math.random() * 100),
        requests: Math.floor(Math.random() * 10000),
        url: `https://api.aiagents.com/services/${i + 1000}`,
    }))
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date)
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-500"
        case "inactive":
            return "bg-gray-500"
        case "pending":
            return "bg-yellow-500"
        case "completed":
            return "bg-blue-500"
        default:
            return "bg-gray-500"
    }
}

export default function ServicesPage() {
    const allServices = generateMockServices()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    const itemsPerPage = 15

    // Filter services based on search query and status filter
    const filteredServices = allServices.filter((service) => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter ? service.status === statusFilter : true

        return matchesSearch && matchesStatus
    })

    // Calculate pagination
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

    // Calculate statistics
    const totalServices = allServices.length
    const activeServices = allServices.filter((s) => s.status === "active").length
    const completedTasks = allServices.filter((s) => s.status === "completed").length
    const averagePerformance = Math.floor(
        allServices.reduce((sum, service) => sum + service.performance, 0) / totalServices,
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage your AI agent services from a central dashboard
                    </p>
                </div>

                {/* Tabs for different views */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-background to-background/80 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Services</CardDescription>
                                    <CardTitle className="text-3xl">{totalServices}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Server className="mr-2 h-4 w-4" />
                                        <span>Across all platforms</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                                        View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-background/80 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardDescription>Active Services</CardDescription>
                                    <CardTitle className="text-3xl">{activeServices}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Zap className="mr-2 h-4 w-4" />
                                        <span>Currently running</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                                        View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-background/80 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardDescription>Completed Tasks</CardDescription>
                                    <CardTitle className="text-3xl">{completedTasks}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        <span>Successfully executed</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                                        View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-background/80 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardDescription>Success Rate</CardDescription>
                                    <CardTitle className="text-3xl">{averagePerformance}%</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Progress value={averagePerformance} className="h-2" />
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            <span>Average performance</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                                        View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Table Section */}
                        <Card className="shadow-md">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <CardTitle>Service Endpoints</CardTitle>
                                        <CardDescription>Manage and monitor your service endpoints and their performance</CardDescription>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="search"
                                                placeholder="Search services..."
                                                className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value)
                                                    setCurrentPage(1) // Reset to first page on search
                                                }}
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Filter className="h-4 w-4" />
                                                    <span className="sr-only">Filter</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" size="icon">
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Download</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Service Name</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="hidden md:table-cell">Created</TableHead>
                                                <TableHead className="hidden md:table-cell">Last Activity</TableHead>
                                                <TableHead className="hidden lg:table-cell">Performance</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedServices.length > 0 ? (
                                                paginatedServices.map((service) => (
                                                    <TableRow key={service.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{service.name}</span>
                                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                    {service.url}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize flex items-center w-fit gap-1.5">
                                                                <span className={`h-2 w-2 rounded-full ${getStatusColor(service.status)}`} />
                                                                {service.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">{formatDate(service.created)}</TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                {formatDate(service.lastActivity)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={service.performance} className="h-2 w-[60px]" />
                                                                <span className="text-xs">{service.performance}%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Actions</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Edit Service</DropdownMenuItem>
                                                                    <DropdownMenuItem>Copy URL</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive">Delete Service</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">
                                                        No services found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="w-full flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <strong>{paginatedServices.length}</strong> of <strong>{filteredServices.length}</strong>{" "}
                                        services
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                                                    }}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum

                                                // Logic to show relevant page numbers
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i
                                                } else {
                                                    pageNum = currentPage - 2 + i
                                                }

                                                // Only render if pageNum is valid
                                                if (pageNum > 0 && pageNum <= totalPages) {
                                                    return (
                                                        <PaginationItem key={pageNum}>
                                                            <PaginationLink
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    setCurrentPage(pageNum)
                                                                }}
                                                                isActive={currentPage === pageNum}
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    )
                                                }
                                                return null
                                            })}

                                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                                    }}
                                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle>Performance Analytics</CardTitle>
                                <CardDescription>Detailed performance metrics for your AI agent services</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                                    <div className="text-center space-y-2">
                                        <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                                        <p className="text-muted-foreground">Performance analytics will appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle>Service Settings</CardTitle>
                                <CardDescription>Configure global settings for your AI agent services</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                                    <div className="text-center space-y-2">
                                        <Settings className="h-10 w-10 mx-auto text-muted-foreground" />
                                        <p className="text-muted-foreground">Settings configuration will appear here</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

