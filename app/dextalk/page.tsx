"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MessageSquare,
    Download,
    Shield,
    Users,
    Zap,
    ChevronRight,
    Github,
    Twitter,
    LogOut,
    RefreshCw,
    LogIn,
} from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LandingPage() {
    //   const [activeTab, setActiveTab] = useState("popup")
    const [isConnected, setIsConnected] = useState(false)

    const connectWallet = () => {
        setIsConnected(true)
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                    <div className="flex gap-2 items-center">
                        <MessageSquare className="h-6 w-6 text-[#2D48D2]" />
                        <span className="text-xl font-bold">DexTalk</span>
                        <span className="text-xs text-muted-foreground">by Whiskey AI</span>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
                                Features
                            </Link>
                            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
                                How It Works
                            </Link>
                            <Link href="#install" className="text-sm font-medium hover:underline underline-offset-4">
                                Install
                            </Link>
                            <Link href="/extension" className="text-sm font-medium hover:underline underline-offset-4">
                                View Extension
                            </Link>
                            <Button size="sm" className="bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                <Download className="mr-2 h-4 w-4" />
                                Add to Chrome
                            </Button>

                        </nav>
                    </div>
                </div>
            </header>
            <main className="container flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        Join the conversation on Dexscreener
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        DexTalk adds a token-specific comment section to Dexscreener, allowing traders to share insights and
                                        discuss tokens in real-time.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button size="lg" className="gap-1 bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                        <Download className="h-5 w-5" />
                                        Add to Chrome
                                    </Button>
                                    <Link href="/extension">
                                        <Button size="lg" variant="outline">
                                            View Extension
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="mx-auto flex items-center justify-center lg:justify-end">
                                <Link
                                    href="/extension"
                                    className="block relative w-[350px] h-[500px] rounded-xl border bg-background shadow-xl hover:shadow-2xl transition-shadow overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 rounded-xl" />
                                    <div className="w-full h-full flex flex-col">
                                        {/* Header */}
                                        <div className="p-3 flex items-center justify-between bg-[#2D48D2]">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                                <h1 className="text-lg font-bold text-primary-foreground">DexTalk</h1>
                                                <span className="text-xs text-primary-foreground/80">by Whiskey AI</span>
                                            </div>
                                        </div>

                                        {/* Token Info */}
                                        <div className="bg-muted p-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h2 className="font-bold">PEPE</h2>
                                                    <p className="text-sm text-muted-foreground">PEPE/ETH</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">$0.00000812</p>
                                                    <p className="text-sm text-green-500">+5.2%</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connect Wallet Section */}
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                                            <div className="bg-muted rounded-full p-6">
                                                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-center">Connect your Phantom Wallet</h2>
                                            <p className="text-center text-muted-foreground mb-2">
                                                Connect your wallet to join the conversation about this token
                                            </p>
                                            <Button className="w-full bg-[#2D48D2] hover:bg-[#1C3B9C]">Connect Phantom Wallet</Button>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-20">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className="h-5 w-5 text-[#2D48D2]" />
                                                    <h3 className="font-semibold">Live Token Discussions</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Click to view the extension design in detail</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-[#2D48D2] px-3 py-1 text-sm text-primary-foreground">
                                    Key Features
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Everything you need for token discussions
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    DexTalk enhances your Dexscreener experience with these powerful features
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2]/10">
                                        <Shield className="h-6 w-6 text-[#2D48D2]" />
                                    </div>
                                    <h3 className="text-xl font-bold">Phantom Wallet Login</h3>
                                    <p className="text-muted-foreground">
                                        Securely connect with your Phantom Wallet for a seamless authentication experience.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2]/10">
                                        <MessageSquare className="h-6 w-6 text-[#2D48D2]" />
                                    </div>
                                    <h3 className="text-xl font-bold">Token-Specific Comments</h3>
                                    <p className="text-muted-foreground">
                                        Each token has its own dedicated comment section, ensuring relevant discussions.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2]/10">
                                        <Users className="h-6 w-6 text-[#2D48D2]" />
                                    </div>
                                    <h3 className="text-xl font-bold">Community Insights</h3>
                                    <p className="text-muted-foreground">
                                        Share and receive valuable insights from other traders and investors in real-time.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-[#2D48D2] px-3 py-1 text-sm text-primary-foreground">
                                    How It Works
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Simple, seamless integration with Dexscreener
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Get started in just a few simple steps
                                </p>
                            </div>
                        </div>

                        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2] text-primary-foreground text-xl font-bold mb-4">
                                    1
                                </div>
                                <h3 className="text-xl font-bold mb-2">Install the Extension</h3>
                                <p className="text-muted-foreground">Add DexTalk to your Chrome browser from the Chrome Web Store.</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2] text-primary-foreground text-xl font-bold mb-4">
                                    2
                                </div>
                                <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                                <p className="text-muted-foreground">Click the connect button and authorize your Phantom Wallet.</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D48D2] text-primary-foreground text-xl font-bold mb-4">
                                    3
                                </div>
                                <h3 className="text-xl font-bold mb-2">Join the Conversation</h3>
                                <p className="text-muted-foreground">
                                    Start commenting and engaging with other traders on any token page.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Screenshots Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">See DexTalk in action</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Enhance your trading experience with real-time community insights
                                </p>
                            </div>
                        </div>

                        <Tabs defaultValue="popup" className="mx-auto max-w-4xl">
                            <div className="flex justify-center mb-8">
                                <TabsList>
                                    <TabsTrigger value="popup" >
                                        Extension Popup
                                    </TabsTrigger>
                                    <TabsTrigger value="sidebar" >
                                        Dexscreener Sidebar
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="popup" className="border rounded-xl overflow-hidden shadow-lg">
                                <div className="bg-background p-4 flex justify-center">
                                    <div className="w-[350px] h-[500px] bg-background flex flex-col border rounded-xl shadow-lg overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-[#2D48D2] p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                                <h1 className="text-lg font-bold text-primary-foreground">DexTalk</h1>
                                                <span className="text-xs text-primary-foreground/80">by Whiskey AI</span>
                                            </div>
                                            {isConnected && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground">
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Token Info */}
                                        <div className="bg-muted p-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h2 className="font-bold">PEPE</h2>
                                                    <p className="text-sm text-muted-foreground">PEPE/ETH</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">$0.00000812</p>
                                                    <p className="text-sm text-green-500">+5.2%</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 overflow-hidden flex flex-col">
                                            {!isConnected ? (
                                                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                                                    <div className="bg-muted rounded-full p-6">
                                                        <MessageSquare className="h-12 w-12 text-muted-foreground" />
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-center">Connect your Phantom Wallet</h2>
                                                    <p className="text-center text-muted-foreground mb-2">
                                                        Connect your wallet to join the conversation about this token
                                                    </p>
                                                    <Button onClick={connectWallet} className="w-full bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                                        Connect Phantom Wallet
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Comment Input */}
                                                    <div className="p-3 border-b">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs bg-[#2D48D2] text-primary-foreground">
                                                                    0x7F9a
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium">0x7F9a...</span>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Share your thoughts on this token..."
                                                            className="min-h-[80px] resize-none"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <Button size="sm" className="bg-[#2D48D2] hover:bg-[#1C3B9C]">Post Comment</Button>
                                                        </div>
                                                    </div>

                                                    {/* Comments List */}
                                                    <div className="flex-1 overflow-y-auto p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-medium">Comments</h3>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                            0x
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">0x8f72...</span>
                                                                    <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
                                                                </div>
                                                                <p className="text-sm">This token has great fundamentals, looking bullish!</p>
                                                            </div>
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                            0x
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">0x3a91...</span>
                                                                    <span className="text-xs text-muted-foreground ml-auto">25 min ago</span>
                                                                </div>
                                                                <p className="text-sm">Volume is picking up, might be a good entry point soon.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted p-4 flex justify-center">
                                    <Link href="/extension">
                                        <Button className="bg-[#2D48D2] hover:bg-[#1C3B9C]">View Full Extension Design</Button>
                                    </Link>
                                </div>
                            </TabsContent>
                            <TabsContent value="sidebar" className="border rounded-xl overflow-hidden shadow-lg">
                                <div className="bg-gray-100 p-6 relative" style={{ height: "600px" }}>
                                    {/* Mock Dexscreener interface */}
                                    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-xl">PEPE/ETH</div>
                                            <div className="text-green-500 font-semibold">$0.00000812 (+5.2%)</div>
                                        </div>
                                        <div className="h-64 bg-gray-100 mt-4 rounded flex items-center justify-center">
                                            <p className="text-muted-foreground">Chart Placeholder</p>
                                        </div>
                                    </div>

                                    {/* DexTalk Sidebar */}
                                    <div className="absolute right-6 top-0 bottom-0 w-80 bg-background border-l border-border shadow-xl flex flex-col">
                                        {/* Header */}
                                        <div className="bg-[#2D48D2] p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                                <h1 className="text-lg font-bold text-primary-foreground">DexTalk</h1>
                                                <span className="text-xs text-primary-foreground/80">by Whiskey AI</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Token Info */}
                                        <div className="bg-muted p-3">
                                            <div className="flex flex-col">
                                                <h2 className="font-bold">PEPE</h2>
                                                <p className="text-sm text-muted-foreground">PEPE/ETH</p>
                                                <p className="text-xs text-muted-foreground truncate mt-1">
                                                    0x6982508145454ce325ddbe47a25d4ec3d2311933
                                                </p>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 overflow-hidden flex flex-col">
                                            {!isConnected ? (
                                                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
                                                    <div className="bg-muted rounded-full p-6">
                                                        <LogIn className="h-12 w-12 text-muted-foreground" />
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-center">Connect your Phantom Wallet</h2>
                                                    <p className="text-center text-muted-foreground mb-2">
                                                        Connect your wallet to join the conversation
                                                    </p>
                                                    <Button onClick={connectWallet} className="w-full bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                                        Connect Phantom Wallet
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Comment Input */}
                                                    <div className="p-3 border-b">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs bg-[#2D48D2] text-primary-foreground">
                                                                    0x7F
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium">0x7F9a...</span>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Share your thoughts on this token..."
                                                            className="min-h-[80px] resize-none"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <Button size="sm">Post Comment</Button>
                                                        </div>
                                                    </div>

                                                    {/* Comments List */}
                                                    <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100% - 180px)" }}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-medium">Comments</h3>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                            0x
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">0x8f72...</span>
                                                                    <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
                                                                </div>
                                                                <p className="text-sm">This token has great fundamentals, looking bullish!</p>
                                                            </div>
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                            0x
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">0x3a91...</span>
                                                                    <span className="text-xs text-muted-foreground ml-auto">25 min ago</span>
                                                                </div>
                                                                <p className="text-sm">Volume is picking up, might be a good entry point soon.</p>
                                                            </div>
                                                            <div className="bg-muted/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                            0x
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm font-medium">0xb4e2...</span>
                                                                    <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                                                                </div>
                                                                <p className="text-sm">Be careful, there is some selling pressure at $0.45</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted p-4 flex justify-center">
                                    <Link href="/extension/sidebar">
                                        <Button className="bg-[#2D48D2] hover:bg-[#1C3B9C]">View Full Sidebar Design</Button>
                                    </Link>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>

                {/* Installation Section */}
                <section id="install" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-[#2D48D2] px-3 py-1 text-sm text-primary-foreground">
                                    Get Started
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Ready to join the conversation?
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Install DexTalk today and start engaging with the community
                                </p>
                            </div>
                            <div className="mx-auto w-full max-w-sm space-y-2 pt-4">
                                <Button size="lg" className="w-full bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                    <Download className="mr-2 h-5 w-5" />
                                    Add to Chrome
                                </Button>
                                <p className="text-xs text-muted-foreground pt-2">
                                    Available for Chrome, Brave, and other Chromium-based browsers
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why use DexTalk?</h2>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                        DexTalk transforms your trading experience by adding a social layer to Dexscreener
                                    </p>
                                </div>
                                <ul className="grid gap-6">
                                    <li className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D48D2]/10 text-primary">
                                            <Zap className="h-5 w-5 text-[#2D48D2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">Enhanced Community Engagement</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">Enhanced Community Engagement</h3>
                                            <p className="text-muted-foreground">
                                                Connect with other traders and investors to share insights and strategies.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D48D2]/10 text-primary">
                                            <Zap className="h-5 w-5 text-[#2D48D2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">Real-Time Token Discussions</h3>
                                            <p className="text-muted-foreground">
                                                Get immediate feedback and opinions on tokens you are researching.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D48D2]/10 text-primary">
                                            <Zap className="h-5 w-5 text-[#2D48D2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">Secure Wallet Integration</h3>
                                            <p className="text-muted-foreground">
                                                Seamless and secure authentication with your existing Phantom Wallet.
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="mx-auto flex items-center justify-center lg:justify-end">
                                <div className="w-full max-w-[400px] h-auto rounded-xl border bg-background shadow-xl overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="bg-[#2D48D2] p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                            <h1 className="text-lg font-bold text-primary-foreground">DexTalk</h1>
                                            <span className="text-xs text-primary-foreground/80">by Whiskey AI</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground">
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Token Info */}
                                    <div className="bg-muted p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="font-bold">PEPE</h2>
                                                <p className="text-sm text-muted-foreground">PEPE/ETH</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">$0.00000812</p>
                                                <p className="text-sm text-green-500">+5.2%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comment Input */}
                                    <div className="p-3 border-b">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs bg-[#2D48D2] text-primary-foreground">0x7F</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">0x7F9a...</span>
                                        </div>
                                        <Textarea placeholder="Share your thoughts on this token..." className="min-h-[80px] resize-none" />
                                        <div className="flex justify-end mt-2">
                                            <Button size="sm" className="bg-[#2D48D2] hover:bg-[#1C3B9C]">Post Comment</Button>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    <div className="overflow-y-auto p-3" style={{ maxHeight: "200px" }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">Comments</h3>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-muted/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                            0x
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">0x8f72...</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
                                                </div>
                                                <p className="text-sm">This token has great fundamentals, looking bullish!</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                            0x
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">0x3a91...</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">25 min ago</span>
                                                </div>
                                                <p className="text-sm">Volume is picking up, might be a good entry point soon.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="container w-full border-t bg-background py-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
                    <div className="flex gap-2 items-center">
                        <MessageSquare className="h-5 w-5 text-[#2D48D2]" />
                        <span className="text-lg font-semibold ">DexTalk</span>
                        <span className="text-xs text-muted-foreground">by Whiskey AI</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} DexTalk by Whiskey AI. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-foreground">
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground">
                            <Twitter className="h-5 w-5" />
                            <span className="sr-only">Twitter</span>
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

