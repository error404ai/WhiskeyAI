"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Agent, FormValues } from "./types"
import PostItem from "./PostItem"
import { useEffect, useState } from "react"

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
    'use no memo'
    // Use this to force re-renders when fields change
    const [lastFieldCount, setLastFieldCount] = useState(0);
    
    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "schedulePosts"
    })
    
    // Force a re-render when fields length changes (like after an Excel import)
    useEffect(() => {
        if (fields.length !== lastFieldCount) {
            setLastFieldCount(fields.length);
            // Force form validation
            methods.trigger();
        }
    }, [fields.length, lastFieldCount, methods]);

    // Ensure every post has an agent assigned when agents change or fields change
    useEffect(() => {
        if (agents.length > 0 && fields.length > 0) {
            // Get agents in range
            const start = Math.max(0, agentRangeStart - 1)
            const end = Math.min(agents.length, agentRangeEnd)
            const rangeAgents = agents.slice(start, end)
            
            if (rangeAgents.length > 0) {
                const currentPosts = methods.getValues("schedulePosts")
                let hasUpdates = false
                
                currentPosts.forEach((post, index) => {
                    if (!post.agentId || post.agentId === "") {
                        const agentIndex = index % rangeAgents.length
                        methods.setValue(`schedulePosts.${index}.agentId`, rangeAgents[agentIndex].uuid)
                        hasUpdates = true
                    }
                })
                
                // Force re-render if we had updates
                if (hasUpdates) {
                    methods.trigger("schedulePosts")
                }
            }
        }
    }, [agents, fields.length, agentRangeStart, agentRangeEnd, methods])

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