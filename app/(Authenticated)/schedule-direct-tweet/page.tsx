"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { format, addMinutes } from "date-fns"
import { Plus, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Define types
interface Agent {
    id: string
    name: string
}

interface SchedulePost {
    content: string
    scheduledTime: string
    agentId: string
}

interface FormValues {
    delayMinutes: number
    schedulePosts: SchedulePost[]
}

export default function SchedulePosts() {
    // Keep track of the current delay value in a ref to ensure we always have the latest value
    const currentDelayRef = useRef<number>(10)

    // Sample agents data
    const [agents] = useState<Agent[]>([
        { id: "1", name: "Marketing Bot" },
        { id: "2", name: "Support Agent" },
        { id: "3", name: "News Aggregator" },
        { id: "4", name: "Content Creator" },
        { id: "5", name: "Analytics Reporter" },
    ])

    // Initialize form with React Hook Form
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            delayMinutes: 10,
            schedulePosts: [
                {
                    content: "",
                    scheduledTime: format(addMinutes(new Date(), 10), "yyyy-MM-dd'T'HH:mm"),
                    agentId: agents[0]?.id || "",
                },
            ],
        },
    })

    // Use field array for dynamic schedule posts
    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedulePosts",
    })

    // Watch for delay minutes changes
    const delayMinutes = watch("delayMinutes")

    // Update the ref whenever delayMinutes changes
    useEffect(() => {
        currentDelayRef.current = Number(delayMinutes)
        console.log("Updated delay ref to:", currentDelayRef.current)
    }, [delayMinutes])

    // Update all scheduled times when delay changes
    const updateScheduledTimes = () => {
        if (fields.length > 0) {
            // Set the first post to current time + delay
            const now = new Date()
            const firstPostTime = addMinutes(now, Number(delayMinutes))
            setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            // Update all subsequent posts based on the delay
            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }

    // Handle adding a new post
    const handleAddPost = () => {
        const currentPosts = getValues("schedulePosts")
        const lastPost = currentPosts[currentPosts.length - 1]

        // Use the ref value to ensure we have the latest delay value
        const currentDelay = currentDelayRef.current
        console.log("Adding post with delay:", currentDelay)

        // Safely get the last post time
        const lastPostTime = lastPost?.scheduledTime ? new Date(lastPost.scheduledTime) : new Date()

        // Find the next agent index
        const lastAgentId = lastPost?.agentId || agents[0].id
        const lastAgentIndex = agents.findIndex((agent) => agent.id === lastAgentId)
        const nextAgentIndex = (lastAgentIndex + 1) % agents.length

        // Create the new post with calculated time using the current delay value
        const newScheduledTime = addMinutes(lastPostTime, currentDelay)
        console.log("Last post time:", lastPostTime)
        console.log("New scheduled time:", newScheduledTime)

        append({
            content: "",
            scheduledTime: format(newScheduledTime, "yyyy-MM-dd'T'HH:mm"),
            agentId: agents[nextAgentIndex]?.id || agents[0].id,
        })
    }

    // Handle form submission
    const onSubmit = (data: FormValues) => {
        console.log("Form submitted:", data)
        // Here you would typically send this data to your API
        alert("Schedule created successfully!")
    }

    // Initial setup
    useEffect(() => {
        // Update times when component mounts
        updateScheduledTimes()

        // Set up an interval to keep the times current
        const intervalId = setInterval(() => {
            updateScheduledTimes()
        }, 60000) // Update every minute

        return () => clearInterval(intervalId)
    }, [])

    // This effect will run whenever delayMinutes changes
    useEffect(() => {
        console.log("Delay minutes changed to:", delayMinutes)

        if (fields.length > 0) {
            // Update first post time
            const now = new Date()
            const firstPostTime = addMinutes(now, Number(delayMinutes))
            setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            // Update all subsequent posts
            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }, [delayMinutes, fields.length, setValue])

    return (
        <div className="py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Schedule Posts</h1>
                <p className="text-muted-foreground">Create and schedule posts for your AI agents with customizable timing.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Delay Time Setting */}
                    <div className="lg:col-span-12 mb-4">
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <Label htmlFor="delayMinutes" className="font-medium">
                                            Delay Between Posts:
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="delayMinutes"
                                            type="number"
                                            className="w-24"
                                            min="0"
                                            max="1440"
                                            {...register("delayMinutes", {
                                                required: "Delay is required",
                                                min: { value: 0, message: "Minimum delay is 0 minutes" },
                                                max: { value: 1440, message: "Maximum delay is 1440 minutes (24 hours)" },
                                            })}
                                            // Direct onChange handler to ensure immediate updates
                                            onChange={(e) => {
                                                // Allow empty string temporarily during typing
                                                const newDelay = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                                setValue("delayMinutes", newDelay)

                                                // Update our ref to ensure we have the latest value
                                                currentDelayRef.current = newDelay
                                                console.log("onChange updated delay to:", newDelay)

                                                // Force update all scheduled times
                                                if (fields.length > 0) {
                                                    // Update first post time
                                                    const now = new Date()
                                                    const firstPostTime = addMinutes(now, newDelay)
                                                    setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

                                                    // Update all subsequent posts
                                                    let previousTime = firstPostTime
                                                    for (let i = 1; i < fields.length; i++) {
                                                        const nextTime = addMinutes(previousTime, newDelay)
                                                        setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                                                        previousTime = nextTime
                                                    }
                                                }
                                            }}
                                        />
                                        <span className="text-muted-foreground">minutes</span>
                                    </div>
                                    {errors.delayMinutes && <p className="text-sm text-destructive">{errors.delayMinutes.message}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Agents List */}
                    <div className="lg:col-span-3">
                        <Card className="h-full">
                            <CardContent className="p-3">
                                <h2 className="text-lg font-semibold mb-4">Agents</h2>
                                <div className="space-y-2">
                                    {agents.map((agent) => (
                                        <div key={agent.id} className="p-3 rounded-md hover:bg-muted">
                                            <p className="font-medium">{agent.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Posts */}
                    <div className="lg:col-span-9">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold">Post #{index + 1}</h2>
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-12 gap-3">
                                            {/* Labels row */}
                                            <div className="col-span-8">
                                                <Label htmlFor={`content-${index}`}>Post Content</Label>
                                            </div>
                                            <div className="col-span-4">
                                                <Label htmlFor={`scheduledTime-${index}`}>Schedule Date & Time</Label>
                                            </div>

                                            {/* Input fields */}
                                            {/* Post Content - Takes 8 columns */}
                                            <div className="col-span-8">
                                                <Textarea
                                                    id={`content-${index}`}
                                                    placeholder="Enter your post content here..."
                                                    className="min-h-[120px] resize-none"
                                                    {...register(`schedulePosts.${index}.content`, {
                                                        required: "Post content is required",
                                                    })}
                                                />
                                                {errors.schedulePosts?.[index]?.content && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.schedulePosts[index]?.content?.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right column for date/time and agent - Takes 4 columns */}
                                            <div className="col-span-4 flex flex-col gap-3">
                                                {/* Schedule Date & Time */}
                                                <div>
                                                    <Input
                                                        id={`scheduledTime-${index}`}
                                                        type="datetime-local"
                                                        {...register(`schedulePosts.${index}.scheduledTime`, {
                                                            required: "Schedule time is required",
                                                        })}
                                                    />
                                                    {errors.schedulePosts?.[index]?.scheduledTime && (
                                                        <p className="text-sm text-destructive mt-1">
                                                            {errors.schedulePosts[index]?.scheduledTime?.message}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Select Agent */}
                                                <div>
                                                    <Label htmlFor={`agentId-${index}`} className="mb-1 block">
                                                        Select Agent
                                                    </Label>
                                                    <Controller
                                                        control={control}
                                                        name={`schedulePosts.${index}.agentId`}
                                                        rules={{ required: "Agent selection is required" }}
                                                        render={({ field }) => (
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger id={`agentId-${index}`}>
                                                                    <SelectValue placeholder="Select an agent" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {agents.map((agent) => (
                                                                        <SelectItem key={agent.id} value={agent.id}>
                                                                            {agent.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.schedulePosts?.[index]?.agentId && (
                                                        <p className="text-sm text-destructive mt-1">
                                                            {errors.schedulePosts[index]?.agentId?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button type="button" variant="outline" className="w-full" onClick={handleAddPost}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add More
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button type="submit" size="lg" className="px-8">
                        Schedule Posts
                    </Button>
                </div>
            </form>
        </div>
    )
}
