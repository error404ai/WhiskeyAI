"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Agent, FormValues } from "./types"
import { useEffect, useState } from "react"

interface PostItemProps {
    index: number
    methods: UseFormReturn<FormValues>
    remove: (index: number) => void
    agents: Agent[]
    agentRangeStart: number
    agentRangeEnd: number
}

export default function PostItem({
    index,
    methods,
    remove,
    agents,
    agentRangeStart,
    agentRangeEnd
}: PostItemProps) {
    'use no memo'
    
    // Debug rendering - log when this component renders with its index
    console.log(`Rendering PostItem index ${index}`);
    
    const { setValue, formState: { errors }, watch } = methods
    const [currentAgentId, setCurrentAgentId] = useState<string>("")
    const [content, setContent] = useState<string>("")
    
    // Watch for changes to this post's content and agent ID
    const postContent = watch(`schedulePosts.${index}.content`)
    const postAgentId = watch(`schedulePosts.${index}.agentId`)
    
    // Update local state when form values change (e.g., after Excel import)
    useEffect(() => {
        if (postContent !== content) {
            setContent(postContent || "")
        }
        
        if (postAgentId !== currentAgentId) {
            setCurrentAgentId(postAgentId || "")
        }
    }, [postContent, postAgentId, content, currentAgentId])

    // If no agent is selected and agents are available, select one
    useEffect(() => {
        if ((!postAgentId || postAgentId === "") && agents.length > 0) {
            // Filter agents by range
            const agentsInRange = agents.filter((_, idx) => 
                idx + 1 >= agentRangeStart && idx + 1 <= agentRangeEnd
            )
            
            if (agentsInRange.length > 0) {
                // Handle agent selection logic
                const agentIndex = index % agentsInRange.length
                const newAgentId = agentsInRange[agentIndex].uuid
                setValue(`schedulePosts.${index}.agentId`, newAgentId)
                setCurrentAgentId(newAgentId)
            }
        }
    }, [agents, agentRangeStart, agentRangeEnd, index, setValue, postAgentId])

    // Handler for content changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value)
        setValue(`schedulePosts.${index}.content`, e.target.value)
    }

    return (
        <Card className="shadow-sm">
            <CardContent className="p-2">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-base font-semibold">Post #{index + 1}</h2>
                    {index > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-2">
                    {/* Labels row */}
                    <div className="col-span-8">
                        <Label htmlFor={`content-${index}`} className="text-sm">
                            Post Content
                        </Label>
                    </div>
                    <div className="col-span-4">
                        <Label htmlFor={`scheduledTime-${index}`} className="text-sm">
                            Schedule Date & Time
                        </Label>
                    </div>

                    {/* Input fields */}
                    {/* Post Content - Takes 8 columns */}
                    <div className="col-span-8">
                        <Textarea 
                            id={`content-${index}`}
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Enter your post content here..."
                            className="min-h-[100px] resize-none text-sm"
                        />
                    </div>

                    {/* Right column for date/time and agent -  Takes 4 columns */}
                    <div className="col-span-4 flex flex-col gap-2">
                        {/* Schedule Date & Time */}
                        <div>
                            <Input
                                id={`scheduledTime-${index}`}
                                {...methods.register(`schedulePosts.${index}.scheduledTime`, { required: true })}
                                type="datetime-local"
                                className="text-sm h-9"
                            />
                        </div>

                        {/* Select Agent */}
                        <div>
                            <Label htmlFor={`agentId-${index}`} className="mb-1 block text-sm">
                                Select Agent
                            </Label>
                            {agents && agents.length > 0 ? (
                                <Select 
                                    value={currentAgentId}
                                    onValueChange={(value) => {
                                        setValue(`schedulePosts.${index}.agentId`, value)
                                        setCurrentAgentId(value)
                                    }}
                                >
                                    <SelectTrigger id={`agentId-${index}`} className="h-9 text-sm">
                                        <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent, agentIndex) => (
                                            <SelectItem
                                                key={agent.uuid}
                                                value={agent.uuid}
                                                className={`text-sm ${
                                                    agentIndex + 1 < agentRangeStart || agentIndex + 1 > agentRangeEnd
                                                        ? "opacity-50"
                                                        : ""
                                                }`}
                                                disabled={agentIndex + 1 < agentRangeStart || agentIndex + 1 > agentRangeEnd}
                                            >
                                                #{agentIndex + 1} - {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sm text-muted-foreground border rounded-md p-2">
                                    No agents available
                                </div>
                            )}
                            {errors.schedulePosts?.[index]?.agentId && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.schedulePosts[index]?.agentId?.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 