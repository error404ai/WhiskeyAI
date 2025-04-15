/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import * as AgentController from "@/server/controllers/agent/AgentController";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { useQuery } from "@tanstack/react-query";
import { addHours, addMinutes, addSeconds, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

// Import types and components
import AgentSelector from "./_partials/AgentSelector";
import PostList from "./_partials/PostList";
import SchedulingControls from "./_partials/SchedulingControls";
import { Agent, DelayUnit, FormStatus, FormValues } from "./_partials/types";

export default function CreateSchedule() {
  "use no memo";
  const currentDelayRef = useRef<number>(10);
  const currentDelayUnitRef = useRef<DelayUnit>("minutes");
  const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(null);
  const [hasImportedPosts, setHasImportedPosts] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);
  // Flag to prevent recursive updates
  const isUpdatingRef = useRef(false);

  const [agentRangeStart, setAgentRangeStart] = useState(1);
  const [agentRangeEnd, setAgentRangeEnd] = useState(1);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);

  const [scheduleStartDate, setScheduleStartDate] = useState<Date>(new Date());
  const [initialTimeSet, setInitialTimeSet] = useState(false);

  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const handleImportSuccess = useCallback((count: number) => {
    setUploadSuccess({ count });
    setHasImportedPosts(true);
    setForceRerender((prev) => prev + 1);
  }, []);

  const { isPending: isAgentsLoading, data: agentsData } = useQuery({
    queryKey: ["getAgents"],
    queryFn: AgentController.getAgents,
    enabled: true,
  });

  const agents = agentsData?.filter((agent) => agent.agentPlatforms?.some((platform) => platform.type === "twitter")) || [];

  const methods = useForm<FormValues>({
    defaultValues: {
      delayValue: 10,
      delayUnit: "minutes",
      schedulePosts: [
        {
          content: "",
          scheduledTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          agentId: "",
        },
      ],
    },
  });

  const { fields, replace } = useFieldArray({
    control: methods.control,
    name: "schedulePosts",
  });

  useEffect(() => {
    if (agents && agents.length > 0) {
      setAgentRangeEnd(agents.length);
    }
  }, [agents]);

  useEffect(() => {
    if (!agents || agents.length === 0) {
      if (activeAgents.length !== 0) {
        setActiveAgents([]);
      }
      return;
    }

    const start = Math.max(0, agentRangeStart - 1);
    const end = Math.min(agents.length, agentRangeEnd);

    const rangeAgents = agents.slice(start, end);

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
  }, [agentRangeStart, agentRangeEnd, agents, methods]);

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

  const updateScheduledTimes = useCallback(() => {
    // Skip if already updating to prevent infinite recursion
    if (isUpdatingRef.current) return;

    try {
      // Set flag to prevent recursive calls
      isUpdatingRef.current = true;

      if (fields.length > 0) {
        methods.setValue("schedulePosts.0.scheduledTime", format(scheduleStartDate, "yyyy-MM-dd'T'HH:mm"), {
          shouldDirty: true,
          shouldTouch: true,
          // This will prevent triggering watch callbacks
          shouldValidate: false,
        });

        const delayValue = Number(methods.getValues("delayValue"));
        const delayUnit = methods.getValues("delayUnit");
        const baseTime = scheduleStartDate;

        for (let i = 1; i < fields.length; i++) {
          const nextTime = calculateNextTime(baseTime, delayValue, delayUnit, i);
          methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });
        }

        // Do one single validation after all updates
        methods.trigger("schedulePosts");
      }
    } finally {
      // Always clear the flag
      isUpdatingRef.current = false;
    }
  }, [scheduleStartDate, fields.length, methods]);

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;

      const newDateTime = new Date(e.target.value);

      setScheduleStartDate(newDateTime);

      // Skip if already updating to prevent infinite recursion
      if (isUpdatingRef.current) return;

      try {
        // Set flag to prevent recursive calls
        isUpdatingRef.current = true;

        if (fields.length > 0) {
          methods.setValue("schedulePosts.0.scheduledTime", format(newDateTime, "yyyy-MM-dd'T'HH:mm"), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false,
          });

          const delayValue = Number(methods.getValues("delayValue"));
          const delayUnit = methods.getValues("delayUnit");
          const baseTime = newDateTime;

          for (let i = 1; i < fields.length; i++) {
            const nextTime = calculateNextTime(baseTime, delayValue, delayUnit, i);
            methods.setValue(`schedulePosts.${i}.scheduledTime`, format(nextTime, "yyyy-MM-dd'T'HH:mm"), {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: false,
            });
          }

          // Trigger form validation and force update UI
          methods.trigger("schedulePosts");
          // Force re-render the PostList component to reflect the updated times
          setForceRerender((prev) => prev + 1);
        }
      } finally {
        // Always clear the flag
        isUpdatingRef.current = false;
      }
    },
    [fields.length, methods, calculateNextTime],
  );

  useEffect(() => {
    if (!initialTimeSet) {
      setScheduleStartDate(new Date());
      setInitialTimeSet(true);
    } else {
      const intervalId = setInterval(() => {
        updateScheduledTimes();
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [initialTimeSet, updateScheduledTimes]);

  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if ((name === "delayValue" || name === "delayUnit") && !isUpdatingRef.current) {
        currentDelayRef.current = Number(value.delayValue);
        currentDelayUnitRef.current = value.delayUnit as DelayUnit;
        updateScheduledTimes();
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, updateScheduledTimes]);

  useEffect(() => {
    if (initialTimeSet && !isUpdatingRef.current) {
      updateScheduledTimes();
    }
  }, [scheduleStartDate, initialTimeSet, updateScheduledTimes]);

  const onSubmit = async (data: FormValues) => {
    try {
      setFormStatus("submitting");
      setFormError(null);

      const validation = { valid: true };
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

      toast.loading("Scheduling tweets...");

      const scheduledTweets = data.schedulePosts.map((post) => {
        const agent = agents.find((a) => a.uuid === post.agentId);

        return {
          agentId: agent ? Number(agent.id) : 0,
          content: post.content,
          scheduledAt: new Date(post.scheduledTime),
        };
      });

      const response = await ScheduledTweetController.bulkCreateScheduledTweets(scheduledTweets);

      toast.dismiss();

      if (response.success) {
        setFormStatus("success");
        setUploadSuccess({ count: scheduledTweets.length });

        toast.success(`Successfully scheduled ${scheduledTweets.length} tweets!`);

        replace([
          {
            content: "",
            scheduledTime: format(calculateNextTime(scheduleStartDate, Number(methods.getValues("delayValue")), methods.getValues("delayUnit"), 1), "yyyy-MM-dd'T'HH:mm"),
            agentId: activeAgents.length > 0 ? activeAgents[0].uuid : "",
          },
        ]);

        window.location.href = "/schedule-tweet?tab=scheduledBatches";

        setTimeout(() => {
          setFormStatus("idle");
        }, 5000);
      } else {
        setFormStatus("error");
        setFormError(response.message || "Failed to schedule tweets");
        toast.error(response.message || "Failed to schedule tweets");
        console.error("Failed to schedule tweets:", response.message);
      }
    } catch (error) {
      toast.dismiss();

      setFormStatus("error");
      setFormError(error instanceof Error ? error.message : "Error scheduling tweets");

      toast.error(error instanceof Error ? error.message : "Error scheduling tweets");
      console.error("Error scheduling tweets:", error);
    }
  };

  return (
    <div className="space-y-8">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Scheduling Controls (Delay, Start Date, File Upload) */}
            <div className="lg:col-span-12">
              <SchedulingControls methods={methods} scheduleStartDate={scheduleStartDate} handleStartDateChange={handleStartDateChange} activeAgents={activeAgents} fields={fields} replace={replace} setHasImportedPosts={setHasImportedPosts} setUploadSuccess={setUploadSuccess} uploadSuccess={uploadSuccess} hasImportedPosts={hasImportedPosts} currentDelayRef={currentDelayRef} currentDelayUnitRef={currentDelayUnitRef} onImportSuccess={handleImportSuccess} />
            </div>

            {/* Agents List */}
            <div className="lg:col-span-3">
              <AgentSelector agents={agents} isAgentsLoading={isAgentsLoading} agentRangeStart={agentRangeStart} agentRangeEnd={agentRangeEnd} setAgentRangeStart={setAgentRangeStart} setAgentRangeEnd={setAgentRangeEnd} applyAgentRange={applyAgentRange} />
            </div>

            {/* Schedule Posts */}
            <div className="lg:col-span-9">
              <PostList key={`posts-list-${forceRerender}-${fields.length}-${scheduleStartDate.getTime()}`} methods={methods} agents={agents} agentRangeStart={agentRangeStart} agentRangeEnd={agentRangeEnd} />
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
    </div>
  );
}
