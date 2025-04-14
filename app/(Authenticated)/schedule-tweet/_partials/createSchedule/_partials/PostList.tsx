/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Agent, FormValues } from "./types"
import PostItem from "./PostItem"
import { useEffect, useState, useLayoutEffect } from "react"
import { addMinutes, format } from "date-fns"

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
    const [lastFieldCount, setLastFieldCount] = useState(0);
    const [forceRender, setForceRender] = useState(0);
    const [lastDelayValue, setLastDelayValue] = useState(methods.getValues("delayMinutes"));
    
    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "schedulePosts"
    })

    useEffect(() => {
        console.log(`Fields length changed: ${fields.length}`)
        if (fields.length !== lastFieldCount) {
            setLastFieldCount(fields.length);
            setForceRender(prev => prev + 1);
        }
    }, [fields.length, lastFieldCount]);
    
    useEffect(() => {
        if (fields.length > 0) {
            console.log(`Forcing validation with ${fields.length} posts`)
            methods.trigger("schedulePosts").then(() => {
                console.log("Form validation complete, UI should be updated");
            });
        }
    }, [forceRender, fields.length, methods]);

    useLayoutEffect(() => {
        if (fields.length > 0) {
            console.log(`Layout effect: Immediate rendering of ${fields.length} posts`)
        }
    }, [fields.length]);

    useEffect(() => {
        const currentDelay = methods.watch("delayMinutes");
                if (currentDelay !== lastDelayValue && fields.length > 1) {
            console.log(`Delay changed from ${lastDelayValue} to ${currentDelay}, recalculating times for ${fields.length} posts`);
            
            const currentPosts = methods.getValues("schedulePosts");
            if (currentPosts.length > 0) {
                const firstPostTime = currentPosts[0]?.scheduledTime ? 
                    new Date(currentPosts[0].scheduledTime) : new Date();
                
                for (let i = 1; i < currentPosts.length; i++) {
                    const newTime = addMinutes(firstPostTime, currentDelay * i);
                    methods.setValue(
                        `schedulePosts.${i}.scheduledTime`, 
                        format(newTime, "yyyy-MM-dd'T'HH:mm")
                    );
                }
                
                methods.trigger("schedulePosts");
                setForceRender(prev => prev + 1);
            }
            
            setLastDelayValue(currentDelay);
        }
    }, [methods.watch("delayMinutes"), fields.length, lastDelayValue, methods]);

    useEffect(() => {
        if (agents.length > 0 && fields.length > 0) {
            const start = Math.max(0, agentRangeStart - 1)
            const end = Math.min(agents.length, agentRangeEnd)
            const rangeAgents = agents.slice(start, end)
            
            if (rangeAgents.length > 0) {
                const currentPosts = methods.getValues("schedulePosts")
                let hasUpdates = false
                
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
        const firstPost = currentPosts[0]
        const lastPost = currentPosts[currentPosts.length - 1]
        
        // Get the delay value
        const currentDelay = Number(methods.getValues("delayMinutes"))
        
        // Safely get the first post time (base time)
        const firstPostTime = firstPost?.scheduledTime ? new Date(firstPost.scheduledTime) : new Date()
        
        // Current post count (before adding new one)
        const currentPostCount = currentPosts.length
        
        console.log('Adding post with:')
        console.log('- First post time:', firstPostTime)
        console.log('- Current post count:', currentPostCount)
        console.log('- Current delay:', currentDelay, 'minutes')

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

        // Create the new post with calculated time using the current delay value and post count
        // Use addMinutes from date-fns for more reliable calculation
        // New post will be at firstPostTime + (currentPostCount * delay)
        const newScheduledTime = addMinutes(firstPostTime, currentDelay * currentPostCount)
        
        console.log('- New scheduled time:', newScheduledTime)

        append({
            content: "",
            scheduledTime: format(newScheduledTime, "yyyy-MM-dd'T'HH:mm"),
            agentId: nextAgentId,
        })
    }

    return (
        <div className="space-y-4">
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
                className="w-full h-10 text-sm border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-medium"
                onClick={handleAddPost}
                disabled={agents?.length === 0}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add More Posts
            </Button>
        </div>
    )
} 