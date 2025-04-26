"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { agentInformationSchema } from "@/server/zodSchema/agentInformationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Skeleton from "react-loading-skeleton";
import { z } from "zod";

const InformationStep = () => {
  const agentUuid = useParams().id as string;
  const {
    isPending,
    isRefetching,
    data: agent,
    refetch,
  } = useQuery({
    queryKey: ["getAgentByUuid"],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
    refetchOnWindowFocus: false,
  });

  const methods = useForm<z.infer<typeof agentInformationSchema>>({
    mode: "onTouched",
    resolver: zodResolver(agentInformationSchema),
  });

  const onSubmit = async (data: z.infer<typeof agentInformationSchema>) => {
    const res = await AgentController.saveAgentInformation(agentUuid, data);
    if (res) {
      refetch();
      setTimeout(() => {
        methods.reset({}, { keepValues: true, keepIsSubmitSuccessful: false });
      }, 2000);
    }
  };

  useEffect(() => {
    methods.setValue("description", agent?.information?.description ?? "");
    methods.setValue("goal", agent?.information?.goal ?? "");
  }, [agent, methods]);

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Agent Background</h2>
        <p className="text-muted-foreground text-sm">Define your agent&apos;s personality and settings</p>

        {(isPending || isRefetching) && <Skeleton height={150} />}
        {!isPending && !isRefetching && (
          <FormProvider {...methods}>
            <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                  <div className="mb-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Agent Description</label>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 text-xs">Outline your agent&apos;s personality by detailing aspects like tweeting habits, demeanor, and communication style</p>
                  <Textarea name="description" placeholder="Enter agent description" className="h-24" />
                </div>

                <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                  <div className="mb-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Agent Goal</label>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 text-xs">Specify the primary objective or core function of the agent. This guides the ai planner in task generation.</p>
                  <Textarea name="goal" placeholder="Enter agent goal" className="h-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button parentClass="w-fit" loading={methods.formState.isSubmitting}>
                  Save
                </Button>
                {methods.formState.isSubmitSuccessful && (
                  <Badge className="py-2" variant={"success"}>
                    Saved
                  </Badge>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default InformationStep;
