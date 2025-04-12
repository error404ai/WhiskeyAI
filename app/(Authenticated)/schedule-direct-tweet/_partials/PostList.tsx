"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Agent, FormValues } from "./types"
import PostItem from "./PostItem"

interface PostListProps {
    methods: UseFormReturn<FormValues>
    agents: Agent[]
    agentRangeStart: number
    agentRangeEnd: number
}

export default function PostList({
    methods,
    agents,
    agentRangeStart,
    agentRangeEnd
}: PostListProps) {
    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "schedulePosts"
    })

    // Handle adding a new post
    const handleAddPost = () => {
        const currentPosts = methods.getValues("schedulePosts")
        const lastPost = currentPosts[currentPosts.length - 1]

        // Get the delay value
        const currentDelay = methods.getValues("delayMinutes")

        // Safely get the last post time
        const lastPostTime = lastPost?.scheduledTime ? new Date(lastPost.scheduledTime) : new Date()

        // Find the next agent index based on the current pattern
        const lastAgentId = lastPost?.agentId || ""

        // Find the current agent index
        let currentAgentIndex = -1
        for (let i = 0; i < agents.length; i++) {
            if (agents[i].uuid === lastAgentId) {
                currentAgentIndex = i
                break
            }
        }

        // Calculate the next agent index (from agents within the range)
        const agentsInRange = agents.filter((_, index) => 
            index + 1 >= agentRangeStart && index + 1 <= agentRangeEnd
        )

        // Use modulo to get the next agent in range
        const nextAgentIndex = agentsInRange.length > 0 ? 
            (currentAgentIndex + 1) % agentsInRange.length : -1
        
        const nextAgentId = nextAgentIndex >= 0 ? 
            agentsInRange[nextAgentIndex]?.uuid : ""

        // Create the new post with calculated time using the current delay value
        const newScheduledTime = new Date(lastPostTime)
        newScheduledTime.setMinutes(newScheduledTime.getMinutes() + currentDelay)

        append({
            content: "",
            scheduledTime: newScheduledTime.toISOString().slice(0, 16), // Format as yyyy-MM-ddTHH:mm
            agentId: nextAgentId,
        })
    }

    return (
        <div className="space-y-2">
            {fields.map((field, index) => (
                <PostItem
                    key={field.id}
                    index={index}
                    methods={methods}
                    remove={remove}
                    agents={agents}
                    agentRangeStart={agentRangeStart}
                    agentRangeEnd={agentRangeEnd}
                />
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full h-8 text-sm"
                onClick={handleAddPost}
                disabled={agents?.length === 0}
            >
                <Plus className="mr-1 h-3 w-3" />
                Add More
            </Button>
        </div>
    )
} 