"use client"

import { useRef, useState } from "react"
import { UseFormReturn, FieldArrayWithId } from "react-hook-form"
import { addMinutes, format } from "date-fns"
import { Clock, FileSpreadsheet, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import * as XLSX from "xlsx"
import { FormValues, ExcelData, Agent, SchedulePost } from "./types"
import { toast } from "sonner"

interface SchedulingControlsProps {
    methods: UseFormReturn<FormValues>
    scheduleStartDate: Date
    handleStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    activeAgents: Agent[]
    fields: FieldArrayWithId<FormValues, "schedulePosts", "id">[]
    replace: (items: SchedulePost[]) => void
    setHasImportedPosts: (value: boolean) => void
    setUploadSuccess: (value: { count: number } | null) => void
    uploadSuccess: { count: number } | null
    hasImportedPosts: boolean
    currentDelayRef: React.RefObject<number>
    onImportSuccess?: (count: number) => void
}

export default function SchedulingControls({
    methods,
    scheduleStartDate,
    handleStartDateChange,
    activeAgents,
    fields,
    replace,
    setHasImportedPosts,
    setUploadSuccess,
    uploadSuccess,
    hasImportedPosts,
    currentDelayRef,
    onImportSuccess
}: SchedulingControlsProps) {
    'use no memo'
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFileName(file.name)
        } else {
            setSelectedFileName(null)
        }
    }

    // Handle file upload
    const handleFileUpload = () => {
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
            toast.error("No file selected. Please select a file to upload.")
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

                if (!jsonData || jsonData.length === 0) {
                    toast.error("No data found in the file. The file appears to be empty.")
                    setIsUploading(false)
                    return
                }

                // Extract tweet content (skip header row if it exists)
                let startRow = 0
                
                // Check if the first row contains headers
                if (jsonData[0] && jsonData[0].length > 0) {
                    const firstCell = jsonData[0][0]
                    if (typeof firstCell === "string" && (
                        firstCell.toLowerCase() === "tweets" ||
                        firstCell.toLowerCase() === "tweet" ||
                        firstCell.toLowerCase().includes("content")
                    )) {
                        startRow = 1
                    }
                }

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
                    toast.error("No content found. The uploaded file doesn't contain any valid tweet content.")
                    setIsUploading(false)
                    return
                }

                // Create schedule posts from tweets
                const currentDelay = currentDelayRef.current

                // Use active agents for assignment
                const agentsToUse = activeAgents

                if (agentsToUse.length === 0) {
                    toast.error("No agents available. Please create agents first or adjust the agent range.")
                    setIsUploading(false)
                    return
                }

                // First, clear any existing state to avoid UI sync issues
                setHasImportedPosts(false)
                setUploadSuccess(null)
                
                // Create the new posts with proper scheduling and agent assignment
                const newPosts: SchedulePost[] = tweets.map((content, index) => {
                    // For the first post (index 0), use exactly scheduleStartDate
                    // For subsequent posts, add accumulated delay based on position
                    const postTime = index === 0 
                        ? scheduleStartDate 
                        : addMinutes(scheduleStartDate, currentDelay * index);
                    
                    const agentIndex = index % agentsToUse.length

                    return {
                        content,
                        scheduledTime: format(postTime, "yyyy-MM-dd'T'HH:mm"),
                        agentId: agentsToUse[agentIndex].uuid,
                    }
                })

                console.log(`Importing ${tweets.length} posts from Excel`)
                
                try {
                    // Replace first to ensure clean state
                    replace(newPosts)
                    
                    // Important: Force-update the UI right away
                    Promise.resolve().then(() => {
                        // Update state immediately after replacement
                        setHasImportedPosts(true)
                        setUploadSuccess({ count: tweets.length })
                        
                        // Notify parent component about successful import
                        if (onImportSuccess) {
                            onImportSuccess(tweets.length);
                        }
                        
                        // Force re-render and validation of all form fields
                        methods.trigger("schedulePosts").then(() => {
                            console.log(`Validation complete after import: ${tweets.length} posts should be visible`)
                        })
                        
                        toast.success(`Successfully imported ${tweets.length} posts from the file`)
                        
                        // Log completion for debugging
                        console.log(`Excel import complete: ${newPosts.length} posts added to form`)
                    })
                } catch (error) {
                    console.error("Error updating form with imported posts:", error)
                    toast.error("Error updating form with imported posts. Please try again.")
                }
                
            } catch (error) {
                console.error("Error processing file:", error)
                toast.error(
                    "Error processing file. There was an error reading the uploaded file. Please make sure it's a valid Excel file."
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
            toast.error("Error reading file. There was an error reading the uploaded file.")
            setIsUploading(false)
        }

        reader.readAsArrayBuffer(file)
    }

    // Clear imported posts
    const clearImportedPosts = () => {
        // Reset to a single empty post
        replace([
            {
                content: "",
                scheduledTime: format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"),
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

        toast.success("Imported posts cleared. All imported posts have been removed.")
    }

    return (
        <Card className="shadow-md border-[1px] border-blue-100 hover:border-blue-200 transition-all">
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                    {/* Delay Time Setting - Left column */}
                    <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-md">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <Label htmlFor="delayMinutes" className="font-medium">
                                Delay Between Posts:
                            </Label>
                        </div>
                        <div className="flex items-center gap-1">
                            <Input
                                id="delayMinutes"
                                type="number"
                                className="w-20 h-8 border-blue-200 focus:border-blue-400"
                                min="0"
                                max="1440"
                                {...methods.register("delayMinutes", {
                                    required: "Delay is required",
                                    min: { value: 0, message: "Minimum delay is 0 minutes" },
                                    max: { value: 1440, message: "Maximum delay is 1440 minutes (24 hours)" },
                                })}
                                onChange={(e) => {
                                    const newDelay = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                                    methods.setValue("delayMinutes", newDelay)
                                    currentDelayRef.current = newDelay

                                    if (fields.length > 0) {
                                        // First post should be at exact scheduleStartDate (not adding delay)
                                        methods.setValue("schedulePosts.0.scheduledTime", format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"))

                                        // Calculate all subsequent posts using accumulating delay
                                        const baseTime = scheduleStartDate
                                        for (let i = 1; i < fields.length; i++) {
                                            // Each post is baseTime + (i * delay)
                                            const nextTime = addMinutes(baseTime, newDelay * i)
                                            methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                                        }
                                    }
                                }}
                            />
                            <span className="text-muted-foreground text-sm">minutes</span>
                        </div>
                        {methods.formState.errors.delayMinutes && (
                            <p className="text-xs text-destructive">{methods.formState.errors.delayMinutes.message}</p>
                        )}
                    </div>

                    {/* Schedule Start Date - Middle column */}
                    <div className="flex items-center bg-blue-50/50 p-2 rounded-md">
                        <Clock className="h-4 w-4 text-blue-600 mr-1" />
                        <Label htmlFor="scheduleStartDate" className="font-medium whitespace-nowrap mr-2">
                            Start From:
                        </Label>
                        <div className="flex-1">
                            <Input
                                id="scheduleStartDate"
                                type="datetime-local"
                                className="h-8 border-blue-200 focus:border-blue-400"
                                defaultValue={format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm")}
                                onChange={handleStartDateChange}
                            />
                        </div>
                    </div>

                    {/* File Upload - Right column */}
                    <div className="flex items-center bg-blue-50/50 p-2 rounded-md">
                        <FileSpreadsheet className="h-4 w-4 text-blue-600 mr-1" />
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
                                            className="flex items-center border border-blue-200 rounded-md px-2 py-1 cursor-pointer hover:bg-blue-50 text-sm h-8 min-w-0"
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
                                        className="h-8 text-xs px-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isUploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </div>
                            </div>
                            <div className="text-xs text-blue-500 truncate mt-1">
                                Excel/CSV with &quot;Tweets&quot; or &quot;Content&quot; column
                            </div>
                        </div>
                    </div>
                </div>

                {uploadSuccess && (
                    <div className="mt-4 flex items-center justify-between">
                        <Alert className="flex-1 bg-green-50 border-green-200 text-green-800 py-2 px-3 rounded-md">
                            <AlertTitle className="text-green-800 text-sm font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Import Successful
                            </AlertTitle>
                            <AlertDescription className="text-green-700 text-sm">
                                Successfully imported {uploadSuccess.count} posts from the file
                            </AlertDescription>
                        </Alert>
                        {hasImportedPosts && (
                            <Button
                                type="button"
                                variant="outline"
                                className="ml-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 h-9 text-sm"
                                onClick={clearImportedPosts}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Clear Imported Posts
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 