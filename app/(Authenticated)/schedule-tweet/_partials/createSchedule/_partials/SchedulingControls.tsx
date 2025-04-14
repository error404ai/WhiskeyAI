"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addMinutes, addSeconds, addHours, format } from "date-fns";
import { Clock, FileSpreadsheet, X } from "lucide-react";
import { useRef, useState } from "react";
import { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Agent, DelayUnit, ExcelData, FormValues, SchedulePost } from "./types";

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
  currentDelayUnitRef: React.RefObject<DelayUnit>;
  onImportSuccess?: (count: number) => void;
}

export default function SchedulingControls({ methods, scheduleStartDate, handleStartDateChange, activeAgents, fields, replace, setHasImportedPosts, setUploadSuccess, uploadSuccess, currentDelayRef, currentDelayUnitRef, onImportSuccess }: SchedulingControlsProps) {
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

  // Calculate next scheduled time based on delay unit and value
  const calculateNextTime = (baseTime: Date, delayValue: number, delayUnit: DelayUnit, multiplier: number): Date => {
    const totalDelay = delayValue * multiplier;
    
    if (delayUnit === "seconds") {
      return addSeconds(baseTime, totalDelay);
    } else if (delayUnit === "hours") {
      return addHours(baseTime, totalDelay);
    } else {
      // Default to minutes
      return addMinutes(baseTime, totalDelay);
    }
  };

  // Helper function to get max value based on unit
  const getMaxValueForUnit = (unit: DelayUnit): number => {
    switch (unit) {
      case "seconds":
        return 3600; // 1 hour in seconds
      case "minutes":
        return 1440; // 24 hours in minutes
      case "hours":
        return 168; // 7 days in hours
      default:
        return 1440;
    }
  };

  // Handle delay unit change
  const handleDelayUnitChange = (newUnit: DelayUnit) => {
    methods.setValue("delayUnit", newUnit);
    currentDelayUnitRef.current = newUnit;

    // Validate the current delay value based on the new unit
    const currentValue = methods.getValues("delayValue");
    const maxValue = getMaxValueForUnit(newUnit);
    
    if (currentValue > maxValue) {
      methods.setValue("delayValue", maxValue);
      currentDelayRef.current = maxValue;
    }

    // Update schedules based on new unit
    if (fields.length > 0) {
      methods.setValue("schedulePosts.0.scheduledTime", format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"));

      const delayValue = Number(methods.getValues("delayValue"));
      const baseTime = scheduleStartDate;
      for (let i = 1; i < fields.length; i++) {
        const nextTime = calculateNextTime(baseTime, delayValue, newUnit, i);
        methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"));
      }
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
        const currentDelayUnit = currentDelayUnitRef.current;

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
          const postTime = index === 0 
            ? scheduleStartDate 
            : calculateNextTime(scheduleStartDate, currentDelay, currentDelayUnit, index);

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
          <div className="flex flex-col gap-2 rounded-md bg-blue-50/50 p-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <Label htmlFor="delayValue" className="font-medium">
                Delay Between Posts:
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Input
                id="delayValue"
                type="number"
                className="h-8 w-24 border-blue-200 focus:border-blue-400"
                min="0"
                max={getMaxValueForUnit(methods.watch("delayUnit"))}
                {...methods.register("delayValue", {
                  required: "Delay is required",
                  min: { value: 0, message: "Minimum delay is 0" },
                  max: { 
                    value: getMaxValueForUnit(methods.watch("delayUnit")),
                    message: `Maximum delay exceeds the limit for ${methods.watch("delayUnit")}`
                  },
                })}
                onChange={(e) => {
                  const newDelay = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0;
                  methods.setValue("delayValue", newDelay);
                  currentDelayRef.current = newDelay;

                  if (fields.length > 0) {
                    methods.setValue("schedulePosts.0.scheduledTime", format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"));

                    const baseTime = scheduleStartDate;
                    const delayUnit = methods.getValues("delayUnit");
                    for (let i = 1; i < fields.length; i++) {
                      const nextTime = calculateNextTime(baseTime, newDelay, delayUnit, i);
                      methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"));
                    }
                  }
                }}
              />
              
              <Select
                value={methods.watch("delayUnit")}
                onValueChange={(value) => handleDelayUnitChange(value as DelayUnit)}
              >
                <SelectTrigger className="h-8 w-28 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Start Date Time Picker */}
          <div className="flex flex-col gap-2 rounded-md bg-blue-50/50 p-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <Label htmlFor="scheduleStartDate" className="font-medium">
                Start Date & Time:
              </Label>
            </div>
            <Input type="datetime-local" id="scheduleStartDate" value={format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm")} onChange={handleStartDateChange} className="h-8 border-blue-200 focus:border-blue-400" min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} />
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-2 rounded-md bg-blue-50/50 p-2">
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <Label htmlFor="excelUpload" className="font-medium">
                Import from Excel:
              </Label>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Input
                id="excelUpload"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="h-8 border-blue-200 px-2 text-xs hover:border-blue-400 hover:bg-blue-50">
                Choose File
              </Button>
              <Button onClick={handleFileUpload} variant="outline" size="sm" disabled={isUploading || !selectedFileName} className={`h-8 border-blue-200 px-2 text-xs hover:border-blue-400 hover:bg-blue-50 ${selectedFileName ? "border-blue-400" : ""}`}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              {selectedFileName && <span className="truncate">{selectedFileName}</span>}
            </div>
          </div>

          {/* Status messages and controls */}
          {uploadSuccess && (
            <div className="col-span-full flex items-center gap-2">
              <Alert className="border-green-100 bg-green-50">
                <div className="flex items-center justify-between">
                  <AlertDescription>
                    <span className="font-medium text-green-700">
                      Successfully imported {uploadSuccess.count} posts from Excel. Schedule will be refreshed every minute to keep times updated.
                    </span>
                  </AlertDescription>
                  <Button variant="ghost" size="icon" onClick={clearImportedPosts} className="h-6 w-6 rounded-full p-0 hover:bg-green-100">
                    <X className="h-4 w-4 text-green-700" />
                  </Button>
                </div>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
