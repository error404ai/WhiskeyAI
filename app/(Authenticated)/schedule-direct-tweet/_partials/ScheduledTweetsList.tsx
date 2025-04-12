"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format as formatDate } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, Trash, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { ScheduledTweetWithAgent } from "./types"
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function ScheduledTweetsList() {
    'use no memo'
    const [showScheduledTweets, setShowScheduledTweets] = useState(false)
    
    // Add query for scheduled tweets
    const { 
        data: scheduledTweets = [], 
        isLoading: isLoadingScheduledTweets,
        refetch: refetchScheduledTweets
    } = useQuery({
        queryKey: ["scheduledTweets"],
        queryFn: ScheduledTweetController.getScheduledTweets,
        enabled: showScheduledTweets,
    })
    
    // Handler for deleting a scheduled tweet
    const handleDeleteTweet = async (tweetId: number) => {
        try {
            // Show loading toast
            toast.loading("Deleting tweet...")
            
            const response = await ScheduledTweetController.deleteScheduledTweet(tweetId)
            
            // Dismiss loading toast
            toast.dismiss()
            
            if (response.success) {
                toast.success("Tweet deleted successfully")
                refetchScheduledTweets()
            } else {
                toast.error(response.message || "Failed to delete tweet")
            }
        } catch (error) {
            toast.dismiss()
            toast.error("Error deleting tweet")
            console.error("Error deleting tweet:", error)
        }
    }
    
    // Function to get badge color based on status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
            case "completed":
                return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
            case "failed":
                return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
            default:
                return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>
        }
    }

    return (
        <div className="mb-6">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                    setShowScheduledTweets(!showScheduledTweets)
                    if (!showScheduledTweets) {
                        refetchScheduledTweets()
                    }
                }}
                className="mb-4"
            >
                {showScheduledTweets ? "Hide" : "View"} Scheduled Tweets
            </Button>
            
            {showScheduledTweets && (
                <Card className="shadow-sm mb-6">
                    <CardContent className="p-4">
                        <h2 className="text-xl font-bold mb-4">Your Scheduled Tweets</h2>
                        
                        {isLoadingScheduledTweets ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : scheduledTweets.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No scheduled tweets found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {scheduledTweets.map((tweet: ScheduledTweetWithAgent) => (
                                    <Card key={tweet.id} className="p-4 relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{tweet.agent?.name || "Unknown Agent"}</span>
                                                    {getStatusBadge(tweet.status || "pending")}
                                                </div>
                                                <p className="my-2">{tweet.content}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(new Date(tweet.scheduledAt), "MMM d, yyyy")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{formatDate(new Date(tweet.scheduledAt), "h:mm a")}</span>
                                                    </div>
                                                    {tweet.status === "failed" && tweet.errorMessage && (
                                                        <div className="text-red-500">
                                                            <span>Error: {tweet.errorMessage}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {tweet.status === "pending" && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            className="text-red-500 cursor-pointer"
                                                            onClick={() => handleDeleteTweet(tweet.id)}
                                                        >
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 