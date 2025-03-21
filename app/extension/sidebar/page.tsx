"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, ChevronRight, RefreshCw, ArrowLeft, LogIn } from "lucide-react"
import Link from "next/link"

export default function SidebarPage() {
    const [isConnected, setIsConnected] = useState(false)
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "0x8f72...",
            content: "This token has great fundamentals, looking bullish!",
            timestamp: "10 min ago",
        },
        {
            id: 2,
            user: "0x3a91...",
            content: "Volume is picking up, might be a good entry point soon.",
            timestamp: "25 min ago",
        },
        {
            id: 3,
            user: "0xb4e2...",
            content: "Be careful, there's some selling pressure at $0.45",
            timestamp: "1 hour ago",
        },
        {
            id: 4,
            user: "0xc7d9...",
            content: "The team just announced a new partnership, this could be huge!",
            timestamp: "2 hours ago",
        },
        {
            id: 5,
            user: "0x5e3f...",
            content: "I'm holding this one long-term, the roadmap looks promising.",
            timestamp: "3 hours ago",
        },
    ])
    const [newComment, setNewComment] = useState("")

    const connectWallet = () => {
        setIsConnected(true)
    }

    const handleSubmitComment = () => {
        if (!newComment.trim()) return

        const comment = {
            id: comments.length + 1,
            user: "0x7F9a...",
            content: newComment,
            timestamp: "Just now",
        }

        setComments([comment, ...comments])
        setNewComment("")
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-background border-b p-4">
                <div className="container mx-auto flex items-center">
                    <Link href="/dextalk" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-xl font-bold mx-auto">DexTalk Sidebar Preview</h1>
                </div>
            </header>

            <main className="flex-1 container mx-auto py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Dexscreener Sidebar Integration</h2>
                        <p className="text-muted-foreground mb-6">
                            This is how the DexTalk sidebar appears when you are browsing token pages on Dexscreener.com.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/extension">
                                <Button variant="outline">View Popup Design</Button>
                            </Link>
                            <Link href="/extension#install">
                                <Button className="bg-[#2D48D2] hover:bg-[#1C3B9C]">Install Extension</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-background p-8 rounded-xl shadow-xl">
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
                                        <span className="text-xl font-bold text-primary-foreground">DexTalk</span>
                                        <span className="text-xs text-primary-foreground">by Whiskey AI</span>
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
                                                Connect your wallet to join the conversation about this token
                                            </p>
                                            <Button onClick={connectWallet} className="w-full bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                                Connect Phantom Wallet
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Comment Input */}
                                            <form onSubmit={handleSubmitComment} className="p-3 border-b">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs bg-[#2D48D2] text-primary-foreground">0x7F</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">0x7F9a...</span>
                                                </div>
                                                <Textarea
                                                    placeholder="Share your thoughts on this token..."
                                                    className="min-h-[80px] resize-none"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <Button type="submit" size="sm" className="bg-[#2D48D2] hover:bg-[#1C3B9C]">
                                                        Post Comment
                                                    </Button>
                                                </div>
                                            </form>

                                            {/* Comments List */}
                                            <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100% - 180px)" }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium">Comments</h3>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {comments.map((comment) => (
                                                        <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback className="text-xs bg-[#2D48D2]/80 text-primary-foreground">
                                                                        {comment.user.substring(0, 2)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm font-medium">{comment.user}</span>
                                                                <span className="text-xs text-muted-foreground ml-auto">{comment.timestamp}</span>
                                                            </div>
                                                            <p className="text-sm">{comment.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">Sidebar Features</h3>
                        <ul className="space-y-4 list-disc pl-5">
                            <li>
                                <strong>Non-intrusive Design:</strong> The sidebar can be collapsed to a small button when not in use.
                            </li>
                            <li>
                                <strong>Context-Aware:</strong> Automatically detects which token you are viewing on Dexscreener.
                            </li>
                            <li>
                                <strong>Real-time Updates:</strong> Comments are updated in real-time as other traders post their
                                insights.
                            </li>
                            <li>
                                <strong>Seamless Integration:</strong> Blends naturally with the Dexscreener interface while maintaining
                                its own distinct identity.
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <footer className="bg-background border-t py-6">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} DexTalk. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

