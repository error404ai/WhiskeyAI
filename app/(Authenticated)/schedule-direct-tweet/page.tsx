/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { format, addMinutes, setHours, setMinutes, getHours, getMinutes } from "date-fns"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuery } from "@tanstack/react-query"
import * as AgentController from "@/server/controllers/agent/AgentController"
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController"
import { toast } from "sonner"

// Import types and components
import { FormStatus, FormValues, Agent } from "./_partials/types"
import ScheduledTweetsList from "./_partials/ScheduledTweetsList"
import SchedulingControls from "./_partials/SchedulingControls"
import AgentSelector from "./_partials/AgentSelector"
import PostList from "./_partials/PostList"

export default function SchedulePosts() {
    // Keep track of the current delay value in a ref to ensure we always have the latest value
    const currentDelayRef = useRef<number>(10)
    const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(null)
    const [hasImportedPosts, setHasImportedPosts] = useState(false)

    // Agent range state
    const [agentRangeStart, setAgentRangeStart] = useState(1)
    const [agentRangeEnd, setAgentRangeEnd] = useState(1)
    const [activeAgents, setActiveAgents] = useState<Agent[]>([])

    // Add a new state for the start date and time
    const [scheduleStartDate, setScheduleStartDate] = useState<Date>(new Date())
    const [initialTimeSet, setInitialTimeSet] = useState(false)

    // Add state variables to track form submission status
    const [formStatus, setFormStatus] = useState<FormStatus>('idle')
    const [formError, setFormError] = useState<string | null>(null)

    // Fetch agents from API
    const { isPending: isAgentsLoading, data: agents = [] } = useQuery({
        queryKey: ["getAgents"],
        queryFn: AgentController.getAgents,
        enabled: true,
    })

    // Initialize form with React Hook Form
    const methods = useForm<FormValues>({
        defaultValues: {
            delayMinutes: 10,
            schedulePosts: [
                {
                    content: "",
                    scheduledTime: format(addMinutes(new Date(), 10), "yyyy-MM-dd'T'HH:mm"),
                    agentId: "",
                },
            ],
        },
    })

    // Get field array functionality
    const { fields, replace } = useFieldArray({
        control: methods.control,
        name: "schedulePosts"
    })

    // Set initial agent range end based on agent count
    useEffect(() => {
        if (agents && agents.length > 0) {
            setAgentRangeEnd(agents.length)
        }
    }, [agents])

    // Force select the first agent for all posts when there's only one agent
    useEffect(() => {
        if (agents && agents.length === 1) {
            // Get the single agent's UUID
            const singleAgentUuid = agents[0].uuid

            // Apply to all posts immediately
            const currentPosts = methods.getValues("schedulePosts")
            currentPosts.forEach((_, index) => {
                methods.setValue(`schedulePosts.${index}.agentId`, singleAgentUuid)
            })
        }
    }, [agents, methods])

    // Update active agents when range changes or when agents are loaded
    useEffect(() => {
        // Skip effect if agents aren't loaded yet
        if (!agents || agents.length === 0) {
            if (activeAgents.length !== 0) {
                setActiveAgents([])
            }
            return
        }

        // Convert to 0-based index for slicing
        const start = Math.max(0, agentRangeStart - 1)
        const end = Math.min(agents.length, agentRangeEnd)

        // Get agents in the selected range
        const rangeAgents = agents.slice(start, end)
        
        // Don't update state if the arrays have the same agents
        // This deep comparison prevents unnecessary re-renders
        const currentAgentIds = activeAgents.map(agent => agent.id).sort().join(',');
        const newAgentIds = rangeAgents.map(agent => agent.id).sort().join(',');
        
        if (currentAgentIds !== newAgentIds) {
            setActiveAgents(rangeAgents)
        }

        // Only update the first post's agent if needed
        const currentPosts = methods.getValues("schedulePosts")
        if (currentPosts && currentPosts[0]) {
            // If there's only one agent available in the entire list, always use it
            if (agents.length === 1 && (!currentPosts[0].agentId || currentPosts[0].agentId === "")) {
                methods.setValue("schedulePosts.0.agentId", agents[0].uuid)
            }
            // Otherwise, if the agent isn't set or is empty, use the first agent in range
            else if ((!currentPosts[0].agentId || currentPosts[0].agentId === "") && rangeAgents.length > 0) {
                methods.setValue("schedulePosts.0.agentId", rangeAgents[0].uuid)
            }
        }
    }, [agentRangeStart, agentRangeEnd, agents, methods])

    // Apply agent range to existing posts
    const applyAgentRange = () => {
        if (fields.length > 0 && activeAgents.length > 0) {
            const updatedPosts = [...methods.getValues("schedulePosts")]

            updatedPosts.forEach((post, index) => {
                const agentIndex = index % activeAgents.length
                post.agentId = activeAgents[agentIndex].uuid
            })

            replace(updatedPosts)
        }
    }

    // Add the handleStartDateChange function that preserves time
    const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return

        // Get the current time from scheduleStartDate
        const currentHours = getHours(scheduleStartDate)
        const currentMinutes = getMinutes(scheduleStartDate)

        // Parse the new date from the input
        const newDateOnly = new Date(e.target.value)

        // Set the time from the current scheduleStartDate to the new date
        const newDateWithTime = setMinutes(setHours(newDateOnly, currentHours), currentMinutes)

        // Update the state
        setScheduleStartDate(newDateWithTime)

        // Update all scheduled times based on the new start date while preserving time
        if (fields.length > 0) {
            const delayMinutes = methods.getValues("delayMinutes");
            const firstPostTime = addMinutes(newDateWithTime, Number(delayMinutes))
            methods.setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }, [scheduleStartDate, fields.length, methods])

    // Modify the updateScheduledTimes function to preserve time when date changes
    const updateScheduledTimes = useCallback(() => {
        if (fields.length > 0) {
            // Set the first post to start date + delay
            const delayMinutes = methods.getValues("delayMinutes");
            const firstPostTime = addMinutes(scheduleStartDate, Number(delayMinutes))
            methods.setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            // Update all subsequent posts based on the delay
            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }, [scheduleStartDate, fields.length, methods])

    // Set initial time on component mount
    useEffect(() => {
        if (!initialTimeSet) {
            setScheduleStartDate(new Date())
            setInitialTimeSet(true)
            // Don't call updateScheduledTimes here, it will be triggered when scheduleStartDate changes
        } else {
            // Set up an interval to keep the times current
            const intervalId = setInterval(() => {
                updateScheduledTimes()
            }, 60000) // Update every minute

            return () => clearInterval(intervalId)
        }
    }, [initialTimeSet, updateScheduledTimes])

    // Update times when delayMinutes changes
    useEffect(() => {
        const subscription = methods.watch((value, { name }) => {
            if (name === "delayMinutes") {
                currentDelayRef.current = Number(value.delayMinutes)
                updateScheduledTimes()
            }
        })
        
        return () => subscription.unsubscribe()
    }, [methods, updateScheduledTimes])

    // Update times when scheduleStartDate changes
    useEffect(() => {
        if (initialTimeSet) {
            updateScheduledTimes()
        }
    }, [scheduleStartDate, initialTimeSet, updateScheduledTimes])

    // Form submission handler
    const onSubmit = async (data: FormValues) => {
        try {
            setFormStatus('submitting')
            setFormError(null)
            
            // Validate the form data - our custom Textarea component handles required validation
            const validation = { valid: true }
            // Check each post for empty content
            for (let i = 0; i < data.schedulePosts.length; i++) {
                const post = data.schedulePosts[i]
                if (!post.content || post.content.trim().length === 0) {
                    validation.valid = false
                    toast.error(`Post #${i + 1} has empty content. Please fill in all posts.`)
                    setFormStatus('error')
                    return
                }
                if (!post.agentId) {
                    validation.valid = false
                    toast.error(`Post #${i + 1} has no agent selected. Please select agents for all posts.`)
                    setFormStatus('error')
                    return
                }
            }
            
            // Show loading toast
            toast.loading("Scheduling tweets...")

            // Build an array of scheduled tweets
            const scheduledTweets = data.schedulePosts.map(post => ({
                agentId: Number(agents.find(agent => agent.uuid === post.agentId)?.id || 0),
                content: post.content,
                scheduledAt: new Date(post.scheduledTime)
            }))
            
            // Submit all tweets to the API
            const response = await ScheduledTweetController.bulkCreateScheduledTweets(scheduledTweets)
            
            // Dismiss loading toast
            toast.dismiss()
            
            if (response.success) {
                setFormStatus('success')
                // Clear the form or show success message
                setUploadSuccess({ count: scheduledTweets.length })
                
                // Show success toast
                toast.success(`Successfully scheduled ${scheduledTweets.length} tweets!`)
                
                // Optionally reset form to a single empty tweet
                replace([
                    {
                        content: "",
                        scheduledTime: format(addMinutes(scheduleStartDate, Number(methods.getValues("delayMinutes"))), "yyyy-MM-dd'T'HH:mm"),
                        agentId: activeAgents.length > 0 ? activeAgents[0].uuid : "",
                    }
                ])
                
                // Auto-hide the success status after 5 seconds
                setTimeout(() => {
                    setFormStatus('idle')
                }, 5000)
            } else {
                // Show error toast with the message from the backend
                setFormStatus('error')
                setFormError(response.message || "Failed to schedule tweets")
                toast.error(response.message || "Failed to schedule tweets")
                console.error("Failed to schedule tweets:", response.message)
            }
        } catch (error) {
            // Dismiss loading toast
            toast.dismiss()
            
            // Set error state
            setFormStatus('error')
            setFormError(error instanceof Error ? error.message : "Error scheduling tweets")
            
            // Show error toast
            toast.error(error instanceof Error ? error.message : "Error scheduling tweets")
            console.error("Error scheduling tweets:", error)
        }
    }

    return (
        <div className="py-2">
            {/* Scheduled Tweets List */}
            <ScheduledTweetsList />
            
            <div className="mb-4">
                <h1 className="text-2xl font-bold mb-1">Schedule Posts</h1>
                <p className="text-muted-foreground">Create and schedule posts for your AI agents with customizable timing.</p>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                        {/* Scheduling Controls (Delay, Start Date, File Upload) */}
                        <div className="lg:col-span-12 mb-2">
                            <SchedulingControls 
                                methods={methods}
                                scheduleStartDate={scheduleStartDate}
                                handleStartDateChange={handleStartDateChange}
                                activeAgents={activeAgents}
                                fields={fields}
                                replace={replace}
                                setHasImportedPosts={setHasImportedPosts}
                                setUploadSuccess={setUploadSuccess}
                                uploadSuccess={uploadSuccess}
                                hasImportedPosts={hasImportedPosts}
                                currentDelayRef={currentDelayRef}
                            />
                        </div>

                        {/* Agents List */}
                        <div className="lg:col-span-3">
                            <AgentSelector 
                                agents={agents}
                                isAgentsLoading={isAgentsLoading}
                                agentRangeStart={agentRangeStart}
                                agentRangeEnd={agentRangeEnd}
                                setAgentRangeStart={setAgentRangeStart}
                                setAgentRangeEnd={setAgentRangeEnd}
                                applyAgentRange={applyAgentRange}
                            />
                        </div>

                        {/* Schedule Posts */}
                        <div className="lg:col-span-9">
                            <PostList 
                                methods={methods}
                                agents={agents}
                                agentRangeStart={agentRangeStart}
                                agentRangeEnd={agentRangeEnd}
                            />
                        </div>
                    </div>

                    {formStatus === 'error' && formError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                    )}

                    {formStatus === 'success' && (
                        <Alert className="mt-4 bg-green-50 border-green-200 text-green-700">
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>Your tweets have been scheduled successfully.</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-4 flex justify-end">
                        <Button 
                            type="submit" 
                            size="sm" 
                            className="px-4" 
                            disabled={agents?.length === 0 || formStatus === 'submitting'}
                        >
                            {formStatus === 'submitting' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                'Schedule Posts'
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
} 