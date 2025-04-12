/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as AgentController from "@/server/controllers/agent/AgentController";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { useQuery } from "@tanstack/react-query";
import { addMinutes, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

// Import types and components
import AgentSelector from "./_partials/AgentSelector";
import PostList from "./_partials/PostList";
import ScheduledTweetsTable from "./_partials/ScheduledTweetsTable";
import SchedulingControls from "./_partials/SchedulingControls";
import { Agent, FormStatus, FormValues } from "./_partials/types";

export default function SchedulePosts() {
  "use no memo";
  const [activeTab, setActiveTab] = useState("create");

  // Keep track of the current delay value in a ref to ensure we always have the latest value
  const currentDelayRef = useRef<number>(10);
  const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(null);
  const [hasImportedPosts, setHasImportedPosts] = useState(false);
  const [agentsLoaded, setAgentsLoaded] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);

  // Agent range state
  const [agentRangeStart, setAgentRangeStart] = useState(1);
  const [agentRangeEnd, setAgentRangeEnd] = useState(1);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);

  // Add a new state for the start date and time
  const [scheduleStartDate, setScheduleStartDate] = useState<Date>(new Date());
  const [initialTimeSet, setInitialTimeSet] = useState(false);

  // Add state variables to track form submission status
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Custom function to handle updates after Excel import
  const handleImportSuccess = useCallback((count: number) => {
    setUploadSuccess({ count });
    setHasImportedPosts(true);
    // Force re-render of the entire form
    setForceRerender((prev) => prev + 1);
  }, []);

  // Fetch agents from API
  const { isPending: isAgentsLoading, data: agentsData } = useQuery({
    queryKey: ["getAgents"],
    queryFn: AgentController.getAgents,
    enabled: true,
  });

  // Type-safe agents data
  const agents: Agent[] = (agentsData as Agent[]) || [];

  // Set agentsLoaded state when agents are loaded
  useEffect(() => {
    if (agents && agents.length > 0 && !agentsLoaded) {
      setAgentsLoaded(true);
    }
  }, [agents, agentsLoaded]);

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
  });

  // Get field array functionality
  const { fields, replace } = useFieldArray({
    control: methods.control,
    name: "schedulePosts",
  });

  // Set initial agent range end based on agent count
  useEffect(() => {
    if (agents && agents.length > 0) {
      setAgentRangeEnd(agents.length);
    }
  }, [agents]);

  // Force select the first agent for all posts when there's only one agent
  // Run this only once agents are loaded
  useEffect(() => {
    if (agentsLoaded && agents && agents.length === 1) {
      // Get the single agent's UUID
      const singleAgentUuid = agents[0].uuid;

      // Apply to all posts immediately
      const currentPosts = methods.getValues("schedulePosts");
      currentPosts.forEach((_, index) => {
        methods.setValue(`schedulePosts.${index}.agentId`, singleAgentUuid);
      });
    }
  }, [agentsLoaded, agents, methods]);

  // Update active agents when range changes or when agents are loaded
  useEffect(() => {
    // Skip effect if agents aren't loaded yet
    if (!agents || agents.length === 0) {
      if (activeAgents.length !== 0) {
        setActiveAgents([]);
      }
      return;
    }

    // Convert to 0-based index for slicing
    const start = Math.max(0, agentRangeStart - 1);
    const end = Math.min(agents.length, agentRangeEnd);

    // Get agents in the selected range
    const rangeAgents = agents.slice(start, end);

    // Don't update state if the arrays have the same agents
    // This deep comparison prevents unnecessary re-renders
    const currentAgentIds = activeAgents
      .map((agent) => agent.id)
      .sort()
      .join(",");
    const newAgentIds = rangeAgents
      .map((agent) => agent.id)
      .sort()
      .join(",");

    if (currentAgentIds !== newAgentIds) {
      setActiveAgents(rangeAgents);
    }

    // Make sure to assign an agent to the first post if none is assigned yet
    if (agentsLoaded) {
      const currentPosts = methods.getValues("schedulePosts");
      if (currentPosts && currentPosts.length > 0) {
        currentPosts.forEach((post, index) => {
          if (!post.agentId || post.agentId === "") {
            const agentIndex = index % rangeAgents.length;
            if (rangeAgents.length > 0 && rangeAgents[agentIndex]) {
              methods.setValue(`schedulePosts.${index}.agentId`, rangeAgents[agentIndex].uuid);
            }
          }
        });
      }
    }
  }, [agentRangeStart, agentRangeEnd, agents, methods, agentsLoaded]);

  // Apply agent range to existing posts
  const applyAgentRange = () => {
    if (fields.length > 0 && activeAgents.length > 0) {
      const updatedPosts = [...methods.getValues("schedulePosts")];

      updatedPosts.forEach((post, index) => {
        const agentIndex = index % activeAgents.length;
        post.agentId = activeAgents[agentIndex].uuid;
      });

      replace(updatedPosts);
    }
  };

  // Add the handleStartDateChange function that preserves time
  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;

      // Parse the new date and time directly from the input
      const newDateTime = new Date(e.target.value);

      // Update the state
      setScheduleStartDate(newDateTime);

      // Update all scheduled times based on the new start date and time
      if (fields.length > 0) {
        const delayMinutes = methods.getValues("delayMinutes");
        const firstPostTime = addMinutes(newDateTime, Number(delayMinutes));
        methods.setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"));

        let previousTime = firstPostTime;
        for (let i = 1; i < fields.length; i++) {
          const nextTime = addMinutes(previousTime, Number(delayMinutes));
          methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"));
          previousTime = nextTime;
        }
      }
    },
    [fields.length, methods],
  );

  // Modify the updateScheduledTimes function to preserve time when date changes
  const updateScheduledTimes = useCallback(() => {
    if (fields.length > 0) {
      // Set the first post to start date + delay
      const delayMinutes = methods.getValues("delayMinutes");
      const firstPostTime = addMinutes(scheduleStartDate, Number(delayMinutes));
      methods.setValue("schedulePosts.0.scheduledTime", format(firstPostTime, "yyyy-MM-dd'T'HH:mm"));

      // Update all subsequent posts based on the delay
      let previousTime = firstPostTime;
      for (let i = 1; i < fields.length; i++) {
        const nextTime = addMinutes(previousTime, Number(delayMinutes));
        methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"));
        previousTime = nextTime;
      }
    }
  }, [scheduleStartDate, fields.length, methods]);

  // Set initial time on component mount
  useEffect(() => {
    if (!initialTimeSet) {
      setScheduleStartDate(new Date());
      setInitialTimeSet(true);
      // Don't call updateScheduledTimes here, it will be triggered when scheduleStartDate changes
    } else {
      // Set up an interval to keep the times current
      const intervalId = setInterval(() => {
        updateScheduledTimes();
      }, 60000); // Update every minute

      return () => clearInterval(intervalId);
    }
  }, [initialTimeSet, updateScheduledTimes]);

  // Update times when delayMinutes changes
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "delayMinutes") {
        currentDelayRef.current = Number(value.delayMinutes);
        updateScheduledTimes();
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, updateScheduledTimes]);

  // Update times when scheduleStartDate changes
  useEffect(() => {
    if (initialTimeSet) {
      updateScheduledTimes();
    }
  }, [scheduleStartDate, initialTimeSet, updateScheduledTimes]);

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setFormStatus("submitting");
      setFormError(null);

      // Validate the form data - our custom Textarea component handles required validation
      const validation = { valid: true };
      // Check each post for empty content
      for (let i = 0; i < data.schedulePosts.length; i++) {
        const post = data.schedulePosts[i];
        if (!post.content || post.content.trim().length === 0) {
          validation.valid = false;
          toast.error(`Post #${i + 1} has empty content. Please fill in all posts.`);
          setFormStatus("error");
          return;
        }
        if (!post.agentId) {
          validation.valid = false;
          toast.error(`Post #${i + 1} has no agent selected. Please select agents for all posts.`);
          setFormStatus("error");
          return;
        }
      }

      // Show loading toast
      toast.loading("Scheduling tweets...");

      // Build an array of scheduled tweets
      const scheduledTweets = data.schedulePosts.map((post) => {
        // Find the agent by uuid
        const agent = agents.find((a) => a.uuid === post.agentId);

        return {
          agentId: agent ? Number(agent.id) : 0,
          content: post.content,
          scheduledAt: new Date(post.scheduledTime),
        };
      });

      // Submit all tweets to the API
      const response = await ScheduledTweetController.bulkCreateScheduledTweets(scheduledTweets);

      // Dismiss loading toast
      toast.dismiss();

      if (response.success) {
        setFormStatus("success");
        // Clear the form or show success message
        setUploadSuccess({ count: scheduledTweets.length });

        // Show success toast
        toast.success(`Successfully scheduled ${scheduledTweets.length} tweets!`);

        // Optionally reset form to a single empty tweet
        replace([
          {
            content: "",
            scheduledTime: format(addMinutes(scheduleStartDate, Number(methods.getValues("delayMinutes"))), "yyyy-MM-dd'T'HH:mm"),
            agentId: activeAgents.length > 0 ? activeAgents[0].uuid : "",
          },
        ]);

        // Switch to the list tab to show the newly scheduled tweets
        setActiveTab("list");

        // Auto-hide the success status after 5 seconds
        setTimeout(() => {
          setFormStatus("idle");
        }, 5000);
      } else {
        // Show error toast with the message from the backend
        setFormStatus("error");
        setFormError(response.message || "Failed to schedule tweets");
        toast.error(response.message || "Failed to schedule tweets");
        console.error("Failed to schedule tweets:", response.message);
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss();

      // Set error state
      setFormStatus("error");
      setFormError(error instanceof Error ? error.message : "Error scheduling tweets");

      // Show error toast
      toast.error(error instanceof Error ? error.message : "Error scheduling tweets");
      console.error("Error scheduling tweets:", error);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="mb-6">
        <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">Schedule Posts</h1>
        <p className="text-muted-foreground text-lg">Create and schedule posts for your AI agents with customizable timing.</p>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create New Posts</TabsTrigger>
          <TabsTrigger value="list">View Scheduled Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-0">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Scheduling Controls (Delay, Start Date, File Upload) */}
                <div className="lg:col-span-12">
                  <SchedulingControls methods={methods} scheduleStartDate={scheduleStartDate} handleStartDateChange={handleStartDateChange} activeAgents={activeAgents} fields={fields} replace={replace} setHasImportedPosts={setHasImportedPosts} setUploadSuccess={setUploadSuccess} uploadSuccess={uploadSuccess} hasImportedPosts={hasImportedPosts} currentDelayRef={currentDelayRef} onImportSuccess={handleImportSuccess} />
                </div>

                {/* Agents List */}
                <div className="lg:col-span-3">
                  <AgentSelector agents={agents} isAgentsLoading={isAgentsLoading} agentRangeStart={agentRangeStart} agentRangeEnd={agentRangeEnd} setAgentRangeStart={setAgentRangeStart} setAgentRangeEnd={setAgentRangeEnd} applyAgentRange={applyAgentRange} />
                </div>

                {/* Schedule Posts */}
                <div className="lg:col-span-9">
                  <PostList key={`posts-list-${forceRerender}-${fields.length}`} methods={methods} agents={agents} agentRangeStart={agentRangeStart} agentRangeEnd={agentRangeEnd} />
                </div>
              </div>

              {formStatus === "error" && formError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {formStatus === "success" && (
                <Alert className="mt-6 border-green-200 bg-green-50 text-green-700">
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>Your tweets have been scheduled successfully.</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-medium hover:from-blue-700 hover:to-indigo-700" disabled={agents.length === 0 || formStatus === "submitting"}>
                  {formStatus === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Posts"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <ScheduledTweetsTable />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
