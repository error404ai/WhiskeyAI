/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Image, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Agent, FormValues } from "./types";

interface PostItemProps {
  index: number;
  methods: UseFormReturn<FormValues>;
  remove: (index: number) => void;
  agents: Agent[];
  agentRangeStart: number;
  agentRangeEnd: number;
}

export default function PostItem({ index, methods, remove, agents, agentRangeStart, agentRangeEnd }: PostItemProps) {
  "use no memo";
  const {
    setValue,
    formState: { errors },
    watch,
  } = methods;
  const [currentAgentId, setCurrentAgentId] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch for changes to this post's content and agent ID
  const postContent = watch(`schedulePosts.${index}.content`);
  const postAgentId = watch(`schedulePosts.${index}.agentId`);
  const postMedia = watch(`schedulePosts.${index}.mediaFile`);

  // Update local state when form values change (e.g., after Excel import)
  useEffect(() => {
    if (postContent !== content) {
      setContent(postContent || "");
    }

    if (postAgentId !== currentAgentId) {
      setCurrentAgentId(postAgentId || "");
    }

    // Create media preview if mediaFile exists but mediaPreview doesn't
    if (postMedia && !mediaPreview) {
      const previewUrl = URL.createObjectURL(postMedia);
      setMediaPreview(previewUrl);
    }
  }, [postContent, postAgentId, content, currentAgentId, postMedia, mediaPreview]);

  // If no agent is selected and agents are available, select one
  useEffect(() => {
    if ((!postAgentId || postAgentId === "") && agents.length > 0) {
      // Filter agents by range
      const agentsInRange = agents.filter((_, idx) => idx + 1 >= agentRangeStart && idx + 1 <= agentRangeEnd);

      if (agentsInRange.length > 0) {
        // Handle agent selection logic
        const agentIndex = index % agentsInRange.length;
        const newAgentId = agentsInRange[agentIndex].uuid;
        setValue(`schedulePosts.${index}.agentId`, newAgentId);
        setCurrentAgentId(newAgentId);
      }
    }
  }, [agents, agentRangeStart, agentRangeEnd, index, setValue, postAgentId]);

  // Handler for content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setValue(`schedulePosts.${index}.content`, e.target.value);
  };

  // Handler for media file changes
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set the file in the form
      setValue(`schedulePosts.${index}.mediaFile`, file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  // Handle removing media
  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
    setValue(`schedulePosts.${index}.mediaFile`, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-[1px] border-blue-100 shadow-md transition-all hover:border-blue-200">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-base font-semibold text-transparent">Post #{index + 1}</h2>
          {index > 0 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Labels row */}
          <div className="col-span-8">
            <Label htmlFor={`content-${index}`} className="text-sm font-medium text-gray-700">
              Post Content
            </Label>
          </div>
          <div className="col-span-4">
            <Label htmlFor={`scheduledTime-${index}`} className="text-sm font-medium text-gray-700">
              Schedule Date & Time
            </Label>
          </div>

          {/* Input fields */}
          {/* Post Content - Takes 8 columns */}
          <div className="col-span-8">
            <Textarea id={`content-${index}`} value={content} onChange={handleContentChange} placeholder="Enter your post content here..." className="min-h-[120px] resize-none border-blue-200 text-sm focus:border-blue-400" />

            {/* Media Upload Section */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <Label htmlFor={`media-${index}`} className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Image className="h-4 w-4 text-blue-600" />
                  Media (Image/Video)
                </Label>
                <Input id={`media-${index}`} type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaChange} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 border-blue-200 text-xs hover:border-blue-400 hover:bg-blue-50">
                  <Upload className="mr-1 h-3 w-3" />
                  Upload Media
                </Button>
                {mediaPreview && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveMedia} className="h-8 border-red-200 text-xs text-red-600 hover:border-red-400 hover:bg-red-50">
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                )}
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className="relative mt-2 overflow-hidden rounded-md border border-blue-200" style={{ maxWidth: "300px" }}>
                  {postMedia && postMedia.type.startsWith("image/") && <img src={mediaPreview} alt="Preview" className="max-h-[200px] w-auto object-contain" />}
                  {postMedia && postMedia.type.startsWith("video/") && <video src={mediaPreview} controls className="max-h-[200px] w-auto" />}
                </div>
              )}
            </div>
          </div>

          {/* Right column for date/time and agent -  Takes 4 columns */}
          <div className="col-span-4 flex flex-col gap-3">
            {/* Schedule Date & Time */}
            <div>
              <Input id={`scheduledTime-${index}`} {...methods.register(`schedulePosts.${index}.scheduledTime`, { required: true })} type="datetime-local" className="h-9 border-blue-200 text-sm focus:border-blue-400" />
            </div>

            {/* Select Agent */}
            <div>
              <Label htmlFor={`agentId-${index}`} className="mb-1 block text-sm font-medium text-gray-700">
                Select Agent
              </Label>
              {agents && agents.length > 0 ? (
                <Select
                  value={currentAgentId}
                  onValueChange={(value) => {
                    setValue(`schedulePosts.${index}.agentId`, value);
                    setCurrentAgentId(value);
                  }}
                >
                  <SelectTrigger id={`agentId-${index}`} className="h-9 border-blue-200 text-sm focus:border-blue-400">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent, agentIndex) => (
                      <SelectItem key={agent.uuid} value={agent.uuid} className={`text-sm ${agentIndex + 1 < agentRangeStart || agentIndex + 1 > agentRangeEnd ? "opacity-50" : ""}`} disabled={agentIndex + 1 < agentRangeStart || agentIndex + 1 > agentRangeEnd}>
                        #{agentIndex + 1} - {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-muted-foreground rounded-md border border-blue-200 bg-blue-50/50 p-2 text-sm">No agents available</div>
              )}
              {errors.schedulePosts?.[index]?.agentId && <p className="text-destructive mt-1 text-xs">{errors.schedulePosts[index]?.agentId?.message}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
