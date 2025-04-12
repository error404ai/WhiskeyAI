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
    currentDelayRef
}: SchedulingControlsProps) {
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
            alert("Error reading file. There was an error reading the uploaded file.")
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
                scheduledTime: format(addMinutes(scheduleStartDate, Number(methods.getValues("delayMinutes"))), "yyyy-MM-dd'T'HH:mm"),
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

    return (
        <Card className="shadow-sm">
            <CardContent className="p-2">
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
                                        const firstPostTime = addMinutes(scheduleStartDate, newDelay)
                                        methods.setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"))

                                        let previousTime = firstPostTime
                                        for (let i = 1; i < fields.length; i++) {
                                            const nextTime = addMinutes(previousTime, newDelay)
                                            methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"))
                                            previousTime = nextTime
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

                    {/* File Upload - Right column */}
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
    )
} 