"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Agent, FormValues } from "./types"
import PostItem from "./PostItem"
import { useEffect, useState, useLayoutEffect } from "react"

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
    const [forceRender, setForceRender] = useState(0);
    
    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "schedulePosts"
    })

    // Log when fields change to help with debugging
    useEffect(() => {
        console.log(`Fields length changed: ${fields.length}`)
        // Force update when fields length changes
        if (fields.length !== lastFieldCount) {
            setLastFieldCount(fields.length);
            // Increment to force a re-render
            setForceRender(prev => prev + 1);
        }
    }, [fields.length, lastFieldCount]);
    
    // Force a re-render when fields are updated from Excel import
    useEffect(() => {
        // Using forceRender as a dependency ensures this runs after field updates
        if (fields.length > 0) {
            console.log(`Forcing validation with ${fields.length} posts`)
            // Force form validation which triggers re-render of field components
            methods.trigger("schedulePosts").then(() => {
                console.log("Form validation complete, UI should be updated");
            });
        }
    }, [forceRender, fields.length, methods]);

    // Use layout effect for immediate UI updates after field changes
    useLayoutEffect(() => {
        if (fields.length > 0) {
            console.log(`Layout effect: Immediate rendering of ${fields.length} posts`)
        }
    }, [fields.length]);

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
                
                // If posts exist but fields.length doesn't match, there might be a sync issue
                if (currentPosts.length !== fields.length) {
                    console.log(`Post count mismatch: form has ${currentPosts.length} but fields has ${fields.length}`)
                }
                
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
                    // Force re-render
                    setForceRender(prev => prev + 1);
                }
            }
        }
    }, [agents, fields.length, agentRangeStart, agentRangeEnd, methods]);

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