"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import * as AgentTriggerController from "@/http/controllers/agent/AgentTriggerController";
import * as FunctionController from "@/http/controllers/agent/functionController";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Clock, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Skeleton from "react-loading-skeleton";
import type { z } from "zod";

const TriggersStep = () => {
  const params = useParams();
  const agentUuid = params.id as string;

  const {
    isPending: isAgentTriggerPending,
    isRefetching: isAgentTriggerRefetching,
    data: agentTriggers,
    refetch: refetchAgentTriggers,
  } = useQuery({
    queryKey: ["getAgentTriggers"],
    queryFn: () => AgentTriggerController.getAgentTriggers(agentUuid),
  });
  const {
    isPending: isFunctionPending,
    data: functions,
    refetch: refetchFunctions,
  } = useQuery({
    queryKey: ["getFunctions"],
    queryFn: () => FunctionController.getFunctions("trigger"),
  });
  const methods = useForm<z.infer<typeof agentTriggerCreateSchema>>({
    mode: "onTouched",
    resolver: zodResolver(agentTriggerCreateSchema),
  });
  const onSubmit = async (data: z.infer<typeof agentTriggerCreateSchema>) => {
    console.log("data is", data);
    const res = await AgentTriggerController.createAgentTrigger(data);
    if (res) {
      setShowTriggerDialog(false);
      refetchAgentTriggers();
    }
  };
  const handleDeleteTrigger = async (triggerId: number) => {
    const res = await AgentTriggerController.deleteAgentTrigger(triggerId);
    if (res) {
      refetchAgentTriggers();
    }
  };
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  useEffect(() => {
    if (methods.formState.errors.description || methods.formState.errors.name || methods.formState.errors.interval || methods.formState.errors.description) {
      setActiveTab("basic");
    }
    if (methods.formState.errors.informationSource || methods.formState.errors.functionName) {
      setActiveTab("function");
    }
  }, [methods.formState.errors]);

  console.log("agent triggers are", agentTriggers);
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Triggers</h2>
        <p className="text-muted-foreground text-sm">Configure the triggers for your agent</p>

        {/* Loading state */}
        {(isAgentTriggerPending || isAgentTriggerRefetching) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton height={180} />
            <Skeleton height={180} />
            <Skeleton height={180} />
          </div>
        )}

        {/* Triggers grid with Add Trigger card */}
        {!isAgentTriggerPending && !isAgentTriggerRefetching && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Existing trigger cards */}
            {agentTriggers?.map((trigger) => (
              <Card key={trigger.id} className="h-[180px] transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="truncate text-lg font-semibold">{trigger.name}</h3>
                  <Button onClick={() => handleDeleteTrigger(trigger.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">{trigger.description}</p>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Runs every {trigger.interval} {trigger.runEvery}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Trigger card */}
            <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
              <DialogTrigger asChild>
                <Card className="hover:bg-muted/50 flex h-[180px] cursor-pointer items-center justify-center border-dashed">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add Trigger</span>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Custom Trigger</DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                  <form className="mt-4" onSubmit={methods.handleSubmit(onSubmit)}>
                    <Input name="agentUuid" value={agentUuid} type="hidden" />
                    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="basic" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                          Basic
                        </TabsTrigger>
                        <TabsTrigger value="function" className="flex items-center gap-2">
                          Function
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="basic">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Input label="Trigger Name" required name="name" placeholder="Enter Trigger Name" />
                          </div>
                          <div className="space-y-2">
                            <Textarea name="description" label="Trigger Description" required placeholder="What does this trigger do?" />
                          </div>
                          <div className="space-y-2">
                            <Label>How Often Should The Trigger Run?</Label>
                            <div className="flex gap-2">
                              <Input name="interval" type="number" min="1" className="w-24" />
                              <div>
                                <select {...methods.register("runEvery")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="">
                                  <option value="" disabled>
                                    Select a unit
                                  </option>
                                  <option value="minutes">minutes</option>
                                  <option value="hours">hours</option>
                                  <option value="days">days</option>
                                </select>
                                {methods.formState.errors.runEvery && <p className="text-sm text-red-500">{methods.formState.errors.runEvery.message}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="function" className="space-y-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium">Trigger Function</span>
                          <select {...methods.register("functionName")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="">
                            <option value="" disabled>
                              Select a function
                            </option>
                            {functions?.map((f) => (
                              <option key={f.id} value={f.name}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                          {methods.formState.errors.functionName && <p className="text-sm text-red-500">{methods.formState.errors.functionName.message}</p>}
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium">Where to get tweet information from?</span>
                          <select {...methods.register("informationSource")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="">
                            <option value="" disabled>
                              Select source
                            </option>
                            <option value="From Agent Description">From Agent Description</option>
                            <option value="From Agent Description">Custom Functions</option>
                          </select>
                          {methods.formState.errors.informationSource && <p className="text-sm text-red-500">{methods.formState.errors.informationSource.message}</p>}
                        </label>
                      </TabsContent>
                    </Tabs>
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTriggerDialog(false)}>
                        Close
                      </Button>
                      <Button type="submit" loading={methods.formState.isSubmitting}>
                        Save Trigger
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriggersStep;
