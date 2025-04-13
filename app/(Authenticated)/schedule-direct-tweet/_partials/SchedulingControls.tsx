"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMinutes, format } from "date-fns";
import { Clock, FileSpreadsheet, X } from "lucide-react";
import { useRef, useState } from "react";
import { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Agent, ExcelData, FormValues, SchedulePost } from "./types";

interface SchedulingControlsProps {
  methods: UseFormReturn<FormValues>;
  scheduleStartDate: Date;
  handleStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeAgents: Agent[];
  fields: FieldArrayWithId<FormValues, "schedulePosts", "id">[];
  replace: (items: SchedulePost[]) => void;
  setHasImportedPosts: (value: boolean) => void;
  setUploadSuccess: (value: { count: number } | null) => void;
  uploadSuccess: { count: number } | null;
  hasImportedPosts: boolean;
  currentDelayRef: React.RefObject<number>;
  onImportSuccess?: (count: number) => void;
}

export default function SchedulingControls({ methods, scheduleStartDate, handleStartDateChange, activeAgents, fields, replace, setHasImportedPosts, setUploadSuccess, uploadSuccess, hasImportedPosts, currentDelayRef, onImportSuccess }: SchedulingControlsProps) {
  "use no memo";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName(null);
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("No file selected. Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with proper typing
        const jsonData: ExcelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
          toast.error("No data found in the file. The file appears to be empty.");
          setIsUploading(false);
          return;
        }

        // Extract tweet content (skip header row if it exists)
        let startRow = 0;

        // Check if the first row contains headers
        if (jsonData[0] && jsonData[0].length > 0) {
          const firstCell = jsonData[0][0];
          if (typeof firstCell === "string" && (firstCell.toLowerCase() === "tweets" || firstCell.toLowerCase() === "tweet" || firstCell.toLowerCase().includes("content"))) {
            startRow = 1;
          }
        }

        // Process the tweets with proper typing
        const tweets: string[] = [];

        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0) {
            const content = row[0];
            if (content && typeof content === "string" && content.trim() !== "") {
              tweets.push(content.trim());
            }
          }
        }

        if (tweets.length === 0) {
          toast.error("No content found. The uploaded file doesn't contain any valid tweet content.");
          setIsUploading(false);
          return;
        }

        // Create schedule posts from tweets
        const currentDelay = currentDelayRef.current;

        // Use active agents for assignment
        const agentsToUse = activeAgents;

        if (agentsToUse.length === 0) {
          toast.error("No agents available. Please create agents first or adjust the agent range.");
          setIsUploading(false);
          return;
        }

        // First, clear any existing state to avoid UI sync issues
        setHasImportedPosts(false);
        setUploadSuccess(null);

        // Create the new posts with proper scheduling and agent assignment
        const newPosts: SchedulePost[] = tweets.map((content, index) => {
          // For the first post (index 0), use exactly scheduleStartDate
          // For subsequent posts, add accumulated delay based on position
          const postTime = index === 0 ? scheduleStartDate : addMinutes(scheduleStartDate, currentDelay * index);

          const agentIndex = index % agentsToUse.length;

          return {
            content,
            scheduledTime: format(postTime, "yyyy-MM-dd'T'HH:mm"),
            agentId: agentsToUse[agentIndex].uuid,
          };
        });

        console.log(`Importing ${tweets.length} posts from Excel`);

        try {
          // Replace first to ensure clean state
          replace(newPosts);

          // Important: Force-update the UI right away
          Promise.resolve().then(() => {
            // Update state immediately after replacement
            setHasImportedPosts(true);
            setUploadSuccess({ count: tweets.length });

            // Notify parent component about successful import
            if (onImportSuccess) {
              onImportSuccess(tweets.length);
            }

            // Force re-render and validation of all form fields
            methods.trigger("schedulePosts").then(() => {
              console.log(`Validation complete after import: ${tweets.length} posts should be visible`);
            });

            toast.success(`Successfully imported ${tweets.length} posts from the file`);

            // Log completion for debugging
            console.log(`Excel import complete: ${newPosts.length} posts added to form`);
          });
        } catch (error) {
          console.error("Error updating form with imported posts:", error);
          toast.error("Error updating form with imported posts. Please try again.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Error processing file. There was an error reading the uploaded file. Please make sure it's a valid Excel file.");
      } finally {
        setIsUploading(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          setSelectedFileName(null);
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file. There was an error reading the uploaded file.");
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Clear imported posts
  const clearImportedPosts = () => {
    // Reset to a single empty post
    replace([
      {
        content: "",
        scheduledTime: format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"),
        agentId: activeAgents.length > 0 ? activeAgents[0].uuid : "",
      },
    ]);

    // Clear success message and reset state
    setUploadSuccess(null);
    setHasImportedPosts(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setSelectedFileName(null);
    }

    toast.success("Imported posts cleared. All imported posts have been removed.");
  };

  return (
    <Card className="border-[1px] border-blue-100 shadow-md transition-all hover:border-blue-200">
      <CardContent className="p-4">
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Delay Time Setting - Left column */}
          <div className="flex items-center gap-2 rounded-md bg-blue-50/50 p-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <Label htmlFor="delayMinutes" className="font-medium">
                Delay Between Posts:
              </Label>
            </div>
            {methods.getValues("delayMinutes") !== 0 && <span className="text-blue-600">{methods.getValues("delayMinutes")} minutes</span>}
            <div className="flex items-center gap-1">
              <Input
                id="delayMinutes"
                type="number"
                className="h-8 w-20 border-blue-200 focus:border-blue-400"
                min="0"
                max="1440"
                {...methods.register("delayMinutes", {
                  required: "Delay is required",
                  min: { value: 0, message: "Minimum delay is 0 minutes" },
                  max: { value: 1440, message: "Maximum delay is 1440 minutes (24 hours)" },
                })}
                onChange={(e) => {
                  const newDelay = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0;
                  methods.setValue("delayMinutes", newDelay);
                  currentDelayRef.current = newDelay;

                  if (fields.length > 0) {
                    // First post should be at exact scheduleStartDate (not adding delay)
                    methods.setValue("schedulePosts.0.scheduledTime", format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"));

                    // Calculate all subsequent posts using accumulating delay
                    const baseTime = scheduleStartDate;
                    for (let i = 1; i < fields.length; i++) {
                      // Each post is baseTime + (i * delay)
                      const nextTime = addMinutes(baseTime, newDelay * i);
                      methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"));
                    }
                  }
                }}
              />
              <span className="text-muted-foreground text-sm">minutes</span>
            </div>
            {methods.formState.errors.delayMinutes && <p className="text-destructive text-xs">{methods.formState.errors.delayMinutes.message}</p>}
          </div>

          {/* Schedule Start Date - Middle column */}
          <div className="flex items-center rounded-md bg-blue-50/50 p-2">
            <Clock className="mr-1 h-4 w-4 text-blue-600" />
            <Label htmlFor="scheduleStartDate" className="mr-2 font-medium whitespace-nowrap">
              Start From:
            </Label>
            <div className="flex-1">
              <Input id="scheduleStartDate" type="datetime-local" className="h-8 border-blue-200 focus:border-blue-400" defaultValue={format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm")} onChange={handleStartDateChange} />
            </div>
          </div>

          {/* File Upload - Right column */}
          <div className="flex items-center rounded-md bg-blue-50/50 p-2">
            <FileSpreadsheet className="mr-1 h-4 w-4 text-blue-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium whitespace-nowrap">Import:</span>
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <Input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                    <div className="flex h-8 min-w-0 cursor-pointer items-center rounded-md border border-blue-200 px-2 py-1 text-sm hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
                      <span className="text-xs font-medium">Choose File</span>
                      <span className="text-muted-foreground ml-1 max-w-[100px] truncate text-xs">{selectedFileName || "No file chosen"}</span>
                    </div>
                  </div>
                  <Button type="button" onClick={handleFileUpload} disabled={isUploading || !selectedFileName} className="h-8 flex-shrink-0 bg-blue-600 px-2 text-xs hover:bg-blue-700">
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
              <div className="mt-1 truncate text-xs text-blue-500">Excel/CSV with &quot;Tweets&quot; or &quot;Content&quot; column</div>
            </div>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-4 flex items-center justify-between">
            <Alert className="flex-1 rounded-md border-green-200 bg-green-50 px-3 py-2 text-green-800">
              <AlertTitle className="flex items-center text-sm font-medium text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Import Successful
              </AlertTitle>
              <AlertDescription className="text-sm text-green-700">Successfully imported {uploadSuccess.count} posts from the file</AlertDescription>
            </Alert>
            {hasImportedPosts && (
              <Button type="button" variant="outline" className="ml-4 h-9 border-red-200 text-sm text-red-500 hover:bg-red-50 hover:text-red-600" onClick={clearImportedPosts}>
                <X className="mr-1 h-4 w-4" />
                Clear Imported Posts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
