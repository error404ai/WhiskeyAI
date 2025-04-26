/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { addHours, addMinutes, addSeconds, format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import PostItem from "./PostItem";
import { Agent, DelayUnit, FormValues } from "./types";

interface PostListProps {
  methods: UseFormReturn<FormValues>;
  agents: Agent[];
  agentRangeStart: number;
  agentRangeEnd: number;
}

export default function PostList({ methods, agents, agentRangeStart, agentRangeEnd }: PostListProps) {
  "use no memo";
  const [lastFieldCount, setLastFieldCount] = useState(0);
  const [forceRender, setForceRender] = useState(0);

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "schedulePosts",
  });

  // Helper function to calculate the next scheduled time based on delay settings
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

  useEffect(() => {
    if (fields.length !== lastFieldCount) {
      setLastFieldCount(fields.length);
      setForceRender((prev) => prev + 1);
    }
  }, [fields.length, lastFieldCount]);

  useEffect(() => {
    if (fields.length > 0) {
      methods.trigger("schedulePosts").then(() => {});
    }
  }, [forceRender, fields.length, methods]);

  // Ensure that media files in the form are preserved when the component re-renders
  useEffect(() => {
    if (fields.length > 0) {
      const currentPosts = methods.getValues("schedulePosts");
      let needsUpdate = false;

      // For each post, ensure the mediaFile is preserved
      for (let i = 0; i < currentPosts.length; i++) {
        const post = currentPosts[i];
        if (post.mediaFile) {
          // If this post has a mediaFile, make sure it's set in the form
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        methods.trigger("schedulePosts");
      }
    }
  }, [fields.length, methods]);

  useLayoutEffect(() => {
    if (fields.length > 0) {
    }
  }, [fields.length]);

  useEffect(() => {
    const currentDelayValue = methods.watch("delayValue");
    const currentDelayUnit = methods.watch("delayUnit");

    if (fields.length > 1) {
      const currentPosts = methods.getValues("schedulePosts");
      if (currentPosts.length > 0) {
        const firstPostTime = currentPosts[0]?.scheduledTime ? new Date(currentPosts[0].scheduledTime) : new Date();

        for (let i = 1; i < currentPosts.length; i++) {
          const newTime = calculateNextTime(firstPostTime, currentDelayValue, currentDelayUnit, i);
          methods.setValue(`schedulePosts.${i}.scheduledTime`, format(newTime, "yyyy-MM-dd'T'HH:mm"), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
        }

        methods.trigger("schedulePosts");
        setForceRender((prev) => prev + 1);
      }
    }
  }, [methods.watch("delayValue"), methods.watch("delayUnit"), methods.watch("schedulePosts"), fields.length, methods]);

  useEffect(() => {
    if (agents.length > 0 && fields.length > 0) {
      const start = Math.max(0, agentRangeStart - 1);
      const end = Math.min(agents.length, agentRangeEnd);
      const rangeAgents = agents.slice(start, end);

      if (rangeAgents.length > 0) {
        const currentPosts = methods.getValues("schedulePosts");
        let hasUpdates = false;

        if (currentPosts.length !== fields.length) {
          console.log(`Post count mismatch: form has ${currentPosts.length} but fields has ${fields.length}`);
        }

        currentPosts.forEach((post, index) => {
          if (!post.agentId || post.agentId === "") {
            const agentIndex = index % rangeAgents.length;
            methods.setValue(`schedulePosts.${index}.agentId`, rangeAgents[agentIndex].uuid);
            hasUpdates = true;
          }
        });

        // Force re-render if we had updates
        if (hasUpdates) {
          methods.trigger("schedulePosts");
          // Force re-render
          setForceRender((prev) => prev + 1);
        }
      }
    }
  }, [agents, fields.length, agentRangeStart, agentRangeEnd, methods]);

  // Handle adding a new post
  const handleAddPost = () => {
    const currentPosts = methods.getValues("schedulePosts");
    const firstPost = currentPosts[0];
    const lastPost = currentPosts[currentPosts.length - 1];

    // Get the delay value and unit
    const currentDelayValue = Number(methods.getValues("delayValue"));
    const currentDelayUnit = methods.getValues("delayUnit");

    // Safely get the first post time (base time)
    const firstPostTime = firstPost?.scheduledTime ? new Date(firstPost.scheduledTime) : new Date();

    // Current post count (before adding new one)
    const currentPostCount = currentPosts.length;

    // Find the next agent index based on the current pattern
    const lastAgentId = lastPost?.agentId || "";

    // Find the current agent index
    let currentAgentIndex = -1;
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].uuid === lastAgentId) {
        currentAgentIndex = i;
        break;
      }
    }

    // Calculate the next agent index (from agents within the range)
    const agentsInRange = agents.filter((_, index) => index + 1 >= agentRangeStart && index + 1 <= agentRangeEnd);

    // Use modulo to get the next agent in range
    const nextAgentIndex = agentsInRange.length > 0 ? (currentAgentIndex + 1) % agentsInRange.length : -1;

    const nextAgentId = nextAgentIndex >= 0 ? agentsInRange[nextAgentIndex]?.uuid : "";

    // Create the new post with calculated time using the current delay value and post count
    const newScheduledTime = calculateNextTime(firstPostTime, currentDelayValue, currentDelayUnit, currentPostCount);

    append({
      content: "",
      scheduledTime: format(newScheduledTime, "yyyy-MM-dd'T'HH:mm"),
      agentId: nextAgentId,
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <PostItem key={field.id} index={index} methods={methods} remove={remove} agents={agents} agentRangeStart={agentRangeStart} agentRangeEnd={agentRangeEnd} />
      ))}

      <Button type="button" variant="outline" className="h-10 w-full border-blue-200 text-sm font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700" onClick={handleAddPost} disabled={agents?.length === 0}>
        <Plus className="mr-2 h-4 w-4" />
        Add More Posts
      </Button>
    </div>
  );
}
