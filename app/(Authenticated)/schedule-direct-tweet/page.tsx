"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { format, addMinutes, setHours, setMinutes, getHours, getMinutes } from "date-fns"
import { Plus, Clock, Trash2, FileSpreadsheet, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuery } from "@tanstack/react-query"
import * as AgentController from "@/server/controllers/agent/AgentController"
import * as XLSX from "xlsx"

// Define types to match what's returned by the real AgentService
interface Agent {
    id: number
    uuid: string
    name: string
    userId: number
    status: "running" | "paused"
    tickerSymbol?: string | null
    tokenAddress?: string | null
    information?: Record<string, unknown> | null
    triggers?: Array<Record<string, unknown>> | null
    paymentTimestamp?: string | null
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

// Define more specific types for Excel data
type ExcelCell = string | number | boolean | null | undefined
type ExcelRow = ExcelCell[]
type ExcelData = ExcelRow[]

export default function SchedulePosts() {
    // Keep track of the current delay value in a ref to ensure we always have the latest value
    const currentDelayRef = useRef<number>(10)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(null)
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
    const [hasImportedPosts, setHasImportedPosts] = useState(false)

    // Agent range state
    const [agentRangeStart, setAgentRangeStart] = useState(1)
    const [agentRangeEnd, setAgentRangeEnd] = useState(1)
    const [activeAgents, setActiveAgents] = useState<Agent[]>([])

    // Add a new state for the start date and time
    const [scheduleStartDate, setScheduleStartDate] = useState<Date>(new Date())
    const [initialTimeSet, setInitialTimeSet] = useState(false)

    // Fetch agents from API
    const { isPending: isAgentsLoading, data: agents = [] } = useQuery({
        queryKey: ["getAgents"],
        queryFn: AgentController.getAgents,
        enabled: true,
    })

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
                    agentId: "",
                },
            ],
        },
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
            const currentPosts = getValues("schedulePosts")
            currentPosts.forEach((_, index) => {
                setValue(`schedulePosts.${index}.agentId`, singleAgentUuid)
            })
        }
    }, [agents, setValue, getValues])

    // Update active agents when range changes or when agents are loaded
    useEffect(() => {
        if (agents && agents.length > 0) {
            // Convert to 0-based index for slicing
            const start = Math.max(0, agentRangeStart - 1)
            const end = Math.min(agents.length, agentRangeEnd)

            // Get agents in the selected range
            const rangeAgents = agents.slice(start, end)
            setActiveAgents(rangeAgents)

            // Update the first post's agent if it's not set
            const currentPosts = getValues("schedulePosts")

            // Update the first post's agent if it's not set
            if (currentPosts[0]) {
                // If there's only one agent available in the entire list, always use it
                if (agents.length === 1) {
                    setValue("schedulePosts.0.agentId", agents[0].uuid)
                }
                // Otherwise, if the agent isn't set or is empty, use the first agent in range
                else if ((!currentPosts[0].agentId || currentPosts[0].agentId === "") && rangeAgents.length > 0) {
                    setValue("schedulePosts.0.agentId", rangeAgents[0].uuid)
                }
            }
        } else {
            setActiveAgents([])
        }
    }, [agentRangeStart, agentRangeEnd, agents, setValue, getValues])

    // Use field array for dynamic schedule posts
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "schedulePosts",
    })

    // Watch for delay minutes changes
    const delayMinutes = watch("delayMinutes")

    // Update the ref whenever delayMinutes changes
    useEffect(() => {
        currentDelayRef.current = Number(delayMinutes)
    }, [delayMinutes])

    // Modify the updateScheduledTimes function to preserve time when date changes
    const updateScheduledTimes = useCallback(() => {
        if (fields.length > 0) {
            // Set the first post to start date + delay
            const firstPostTime = addMinutes(scheduleStartDate, Number(delayMinutes))
            setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            // Update all subsequent posts based on the delay
            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }, [scheduleStartDate, delayMinutes, fields.length, setValue])

    // Apply agent range to existing posts
    const applyAgentRange = () => {
        if (fields.length > 0 && activeAgents.length > 0) {
            const updatedPosts = [...getValues("schedulePosts")]

            updatedPosts.forEach((post, index) => {
                const agentIndex = index % activeAgents.length
                post.agentId = activeAgents[agentIndex].uuid
            })

            replace(updatedPosts)
        }
    }

    // Handle adding a new post
    const handleAddPost = () => {
        const currentPosts = getValues("schedulePosts")
        const lastPost = currentPosts[currentPosts.length - 1]

        // Use the ref value to ensure we have the latest delay value
        const currentDelay = currentDelayRef.current

        // Safely get the last post time
        const lastPostTime = lastPost?.scheduledTime ? new Date(lastPost.scheduledTime) : new Date()

        // Find the next agent index based on the current pattern
        const lastAgentId = lastPost?.agentId || ""

        // Find the current agent index
        let currentAgentIndex = -1
        for (let i = 0; i < activeAgents.length; i++) {
            if (activeAgents[i].uuid === lastAgentId) {
                currentAgentIndex = i
                break
            }
        }

        // Calculate the next agent index
        const nextAgentIndex = activeAgents.length > 0 ? (currentAgentIndex + 1) % activeAgents.length : -1
        const nextAgentId = nextAgentIndex >= 0 ? activeAgents[nextAgentIndex]?.uuid : ""

        // Create the new post with calculated time using the current delay value
        const newScheduledTime = addMinutes(lastPostTime, currentDelay)

        append({
            content: "",
            scheduledTime: format(newScheduledTime, "yyyy-MM-dd'T'HH:mm"),
            agentId: nextAgentId,
        })
    }

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFileName(file.name)
        } else {
            setSelectedFileName(null)
        }
    }

    // Add the handleStartDateChange function that preserves time
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const firstPostTime = addMinutes(newDateWithTime, Number(delayMinutes))
            setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }

    // Modify the handleFileUpload function to use scheduleStartDate
    const handleFileUpload = () => {
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
            alert("No file selected. Please select a file to upload.")
            return
        }

        setIsUploading(true)
        setUploadSuccess(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: "array" })

                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]

                // Convert to JSON with proper typing
                const jsonData: ExcelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

                // Extract tweet content (skip header row if it exists)
                const startRow =
                    jsonData.length > 0 &&
                        jsonData[0] &&
                        jsonData[0].length > 0 &&
                        typeof jsonData[0][0] === "string" &&
                        (jsonData[0][0].toLowerCase() === "tweets" ||
                            jsonData[0][0].toLowerCase() === "tweet" ||
                            (typeof jsonData[0][0] === "string" && jsonData[0][0].toLowerCase().includes("content")))
                        ? 1
                        : 0

                // Process the tweets with proper typing
                const tweets: string[] = []

                for (let i = startRow; i < jsonData.length; i++) {
                    const row = jsonData[i]
                    if (row && row.length > 0) {
                        const content = row[0]
                        if (content && typeof content === "string" && content.trim() !== "") {
                            tweets.push(content.trim())
                        }
                    }
                }

                if (tweets.length === 0) {
                    alert("No content found. The uploaded file doesn't contain any valid tweet content.")
                    setIsUploading(false)
                    return
                }

                // Create schedule posts from tweets
                const currentDelay = currentDelayRef.current

                // Use active agents for assignment
                const agentsToUse = activeAgents

                if (agentsToUse.length === 0) {
                    alert("No agents available. Please create agents first or adjust the agent range.")
                    setIsUploading(false)
                    return
                }

                const newPosts: SchedulePost[] = tweets.map((content, index) => {
                    // Use scheduleStartDate instead of now
                    const postTime = addMinutes(scheduleStartDate, currentDelay * (index + 1))
                    const agentIndex = index % agentsToUse.length

                    return {
                        content,
                        scheduledTime: format(postTime, "yyyy-MM-dd'T'HH:mm"),
                        agentId: agentsToUse[agentIndex].uuid,
                    }
                })

                // Replace existing posts with new ones from file
                replace(newPosts)
                setHasImportedPosts(true)
                setUploadSuccess({ count: tweets.length })
            } catch (error) {
                console.error("Error processing file:", error)
                alert(
                    "Error processing file. There was an error reading the uploaded file. Please make sure it's a valid Excel file.",
                )
            } finally {
                setIsUploading(false)
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                    setSelectedFileName(null)
                }
            }
        }

        reader.onerror = () => {
            alert("Error reading file. There was an error reading the uploaded file.")
            setIsUploading(false)
        }

        reader.readAsArrayBuffer(file)
    }

    // Modify the clearImportedPosts function to use scheduleStartDate
    const clearImportedPosts = () => {
        // Reset to a single empty post
        replace([
            {
                content: "",
                scheduledTime: format(addMinutes(scheduleStartDate, Number(delayMinutes)), "yyyy-MM-dd'T'HH:mm"),
                agentId: activeAgents.length > 0 ? activeAgents[0].uuid : "",
            },
        ])

        // Clear success message and reset state
        setUploadSuccess(null)
        setHasImportedPosts(false)

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
            setSelectedFileName(null)
        }

        alert("Imported posts cleared. All imported posts have been removed.")
    }

    // Handle form submission
    const onSubmit = (data: FormValues) => {
        console.log("Form submitted:", data)
        // Here you would typically send this data to your API
        alert("Schedule created successfully!")
    }

    // Set initial time on component mount
    useEffect(() => {
        if (!initialTimeSet) {
            setScheduleStartDate(new Date())
            setInitialTimeSet(true)
            updateScheduledTimes()
        }

        // Set up an interval to keep the times current
        const intervalId = setInterval(() => {
            updateScheduledTimes()
        }, 60000) // Update every minute

        return () => clearInterval(intervalId)
    }, [initialTimeSet, updateScheduledTimes])

    // Modify the useEffect that runs when delayMinutes changes to use scheduleStartDate
    useEffect(() => {
        if (fields.length > 0) {
            // Update first post time
            const firstPostTime = addMinutes(scheduleStartDate, Number(delayMinutes))
            setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

            // Update all subsequent posts
            let previousTime = firstPostTime
            for (let i = 1; i < fields.length; i++) {
                const nextTime = addMinutes(previousTime, Number(delayMinutes))
                setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                previousTime = nextTime
            }
        }
    }, [delayMinutes, fields.length, setValue, scheduleStartDate])

    // Add a new useEffect that runs when the component mounts to ensure the agent is selected
    useEffect(() => {
        // This will run once when the component mounts and whenever agents change
        if (agents && agents.length === 1) {
            // Force select the single agent for all posts with a slight delay to ensure form is ready
            const timer = setTimeout(() => {
                const posts = getValues("schedulePosts")
                posts.forEach((_, index) => {
                    setValue(`schedulePosts.${index}.agentId`, agents[0].uuid)
                })
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [agents, getValues, setValue])

    return (
        <div className="py-2">
            <div className="mb-4">
                <h1 className="text-2xl font-bold mb-1">Schedule Posts</h1>
                <p className="text-muted-foreground">Create and schedule posts for your AI agents with customizable timing.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                    {/* Delay Time Setting and File Upload in the same row */}
                    <div className="lg:col-span-12 mb-2">
                        <Card className="shadow-sm">
                            <CardContent className="p-2">
                                {/* Replace the existing grid div in the Card with this updated version: */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative">
                                    {/* Delay Time Setting - Left column */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="delayMinutes" className="font-medium">
                                                Delay Between Posts:
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Input
                                                id="delayMinutes"
                                                type="number"
                                                className="w-20 h-8"
                                                min="0"
                                                max="1440"
                                                {...register("delayMinutes", {
                                                    required: "Delay is required",
                                                    min: { value: 0, message: "Minimum delay is 0 minutes" },
                                                    max: { value: 1440, message: "Maximum delay is 1440 minutes (24 hours)" },
                                                })}
                                                onChange={(e) => {
                                                    const newDelay = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                                    setValue("delayMinutes", newDelay)
                                                    currentDelayRef.current = newDelay

                                                    if (fields.length > 0) {
                                                        const firstPostTime = addMinutes(scheduleStartDate, newDelay)
                                                        setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

                                                        let previousTime = firstPostTime
                                                        for (let i = 1; i < fields.length; i++) {
                                                            const nextTime = addMinutes(previousTime, newDelay)
                                                            setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                                                            previousTime = nextTime
                                                        }
                                                    }
                                                }}
                                            />
                                            <span className="text-muted-foreground text-sm">minutes</span>
                                        </div>
                                        {errors.delayMinutes && <p className="text-xs text-destructive">{errors.delayMinutes.message}</p>}
                                    </div>

                                    {/* Schedule Start Date - Middle column - Make this more compact */}
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                                        <Label htmlFor="scheduleStartDate" className="font-medium whitespace-nowrap mr-2">
                                            Start From:
                                        </Label>
                                        <div className="flex-1">
                                            <Input
                                                id="scheduleStartDate"
                                                type="date"
                                                className="h-8"
                                                defaultValue={format(scheduleStartDate, "yyyy-MM-dd")}
                                                onChange={handleStartDateChange}
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload - Right column - Fix responsive issues */}
                                    <div className="flex items-center gap-1">
                                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium whitespace-nowrap text-sm">Import:</span>
                                                <div className="flex-1 flex items-center gap-1 min-w-0">
                                                    <div className="flex-1 min-w-0">
                                                        <Input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept=".xlsx,.xls,.csv"
                                                            className="hidden"
                                                            onChange={handleFileSelect}
                                                            disabled={isUploading}
                                                        />
                                                        <div
                                                            className="flex items-center border rounded-md px-2 py-1 cursor-pointer hover:bg-muted text-sm h-8 min-w-0"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            <span className="text-xs font-medium">Choose File</span>
                                                            <span className="ml-1 text-xs text-muted-foreground truncate max-w-[100px]">
                                                                {selectedFileName || "No file chosen"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={handleFileUpload}
                                                        disabled={isUploading || !selectedFileName}
                                                        className="h-8 text-xs px-2 flex-shrink-0"
                                                    >
                                                        {isUploading ? "Uploading..." : "Upload"}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                Excel/CSV with &quot;Tweets&quot; or &quot;Content&quot; column
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vertical dividers for desktop */}
                                    <div className="hidden md:block absolute h-full w-px bg-border left-1/3 top-0"></div>
                                    <div className="hidden md:block absolute h-full w-px bg-border left-2/3 top-0"></div>

                                    {/* Horizontal dividers for mobile */}
                                    <div className="md:hidden w-full h-px bg-border my-1"></div>
                                    <div className="md:hidden w-full h-px bg-border my-1"></div>
                                </div>

                                {uploadSuccess && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <Alert className="flex-1 bg-green-50 border-green-200 text-green-800 py-1 px-2">
                                            {/* <AlertTitle className="text-green-800 text-sm">Success</AlertTitle> */}
                                            {/* <AlertTitle className="text-green-800 text-sm">✔️ ✓ </AlertTitle> */}
                                            <AlertTitle className="text-green-800 text-sm"> ✓ &nbsp;</AlertTitle>
                                            <AlertDescription className="text-green-700 text-xs">
                                                Successfully imported {uploadSuccess.count} posts from the file
                                            </AlertDescription>
                                        </Alert>
                                        {hasImportedPosts && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="ml-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 h-8 text-xs"
                                                onClick={clearImportedPosts}
                                            >
                                                <X className="mr-1 h-3 w-3" />
                                                Clear Imported Posts
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Agents List */}
                    <div className="lg:col-span-3">
                        <Card className="h-full shadow-sm">
                            <CardContent className="p-2">
                                <h2 className="text-base font-semibold mb-3">Agents</h2>

                                {isAgentsLoading ? (
                                    Array(5)
                                        .fill(0)
                                        .map((_, i) => <div key={i} className="p-2 rounded-md bg-gray-100 animate-pulse h-6 mb-2"></div>)
                                ) : agents && agents.length > 0 ? (
                                    <>
                                        {/* Agent Range Selector - Only show if agents exist */}
                                        <div className="mb-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label htmlFor="agentRangeStart" className="text-sm mb-1 block">
                                                        Start:
                                                    </Label>
                                                    <Input
                                                        id="agentRangeStart"
                                                        type="number"
                                                        className="h-9"
                                                        min="1"
                                                        max={agents.length}
                                                        value={agentRangeStart}
                                                        onChange={(e) => {
                                                            const value = Number.parseInt(e.target.value) || 1
                                                            setAgentRangeStart(Math.min(value, agentRangeEnd))
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="agentRangeEnd" className="text-sm mb-1 block">
                                                        End:
                                                    </Label>
                                                    <Input
                                                        id="agentRangeEnd"
                                                        type="number"
                                                        className="h-9"
                                                        min={agentRangeStart}
                                                        max={agents.length}
                                                        value={agentRangeEnd}
                                                        onChange={(e) => {
                                                            const value = Number.parseInt(e.target.value) || agentRangeStart
                                                            setAgentRangeEnd(Math.max(value, agentRangeStart))
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                className="w-full bg-black hover:bg-gray-800 text-white"
                                                onClick={applyAgentRange}
                                            >
                                                Apply Range
                                            </Button>
                                        </div>

                                        {/* Agents List */}
                                        <div className="space-y-2">
                                            {agents.map((agent, index) => (
                                                <div
                                                    key={agent.uuid}
                                                    className={`p-2 rounded-md hover:bg-muted flex items-center gap-2 ${index + 1 < agentRangeStart || index + 1 > agentRangeEnd ? "opacity-50" : ""
                                                        }`}
                                                >
                                                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                                    <p className="font-medium text-sm">{agent.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center space-y-3">
                                        <p className="text-muted-foreground text-sm">No agents created.</p>
                                        <Button className="w-full bg-black hover:bg-gray-800 text-white hover:text-white" link="/my-agent">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Create agent
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Posts */}
                    <div className="lg:col-span-9">
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="shadow-sm">
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
                                                    placeholder="Enter your post content here..."
                                                    className="min-h-[100px] resize-none text-sm"
                                                    {...register(`schedulePosts.${index}.content`, {
                                                        required: "Post content is required",
                                                    })}
                                                />
                                                {errors.schedulePosts?.[index]?.content && (
                                                    <p className="text-xs text-destructive mt-1">
                                                        {errors.schedulePosts[index]?.content?.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right column for date/time and agent -  Takes 4 columns */}
                                            <div className="col-span-4 flex flex-col gap-2">
                                                {/* Schedule Date & Time */}
                                                <div>
                                                    <Input
                                                        id={`scheduledTime-${index}`}
                                                        type="datetime-local"
                                                        className="text-sm h-9"
                                                        {...register(`schedulePosts.${index}.scheduledTime`, {
                                                            required: "Schedule time is required",
                                                        })}
                                                    />
                                                    {errors.schedulePosts?.[index]?.scheduledTime && (
                                                        <p className="text-xs text-destructive mt-1">
                                                            {errors.schedulePosts[index]?.scheduledTime?.message}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Select Agent */}
                                                <div>
                                                    <Label htmlFor={`agentId-${index}`} className="mb-1 block text-sm">
                                                        Select Agent
                                                    </Label>
                                                    {agents && agents.length > 0 ? (
                                                        <Controller
                                                            control={control}
                                                            name={`schedulePosts.${index}.agentId`}
                                                            rules={{ required: "Agent selection is required" }}
                                                            render={({ field }) => (
                                                                <Select value={field.value} onValueChange={field.onChange}>
                                                                    <SelectTrigger id={`agentId-${index}`} className="h-9 text-sm">
                                                                        <SelectValue placeholder="Select an agent" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {agents.map((agent, agentIndex) => (
                                                                            <SelectItem
                                                                                key={agent.uuid}
                                                                                value={agent.uuid}
                                                                                className={`text-sm ${agentIndex + 1 < agentRangeStart || agentIndex + 1 > agentRangeEnd
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
                                                            )}
                                                        />
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
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button type="submit" size="sm" className="px-4" disabled={agents?.length === 0}>
                        Schedule Posts
                    </Button>
                </div>
            </form>
        </div>
    )
}
