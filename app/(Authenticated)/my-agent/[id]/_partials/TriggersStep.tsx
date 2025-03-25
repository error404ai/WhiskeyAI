/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import * as AgentTriggerController from "@/http/controllers/agent/AgentTriggerController";
import * as FunctionController from "@/http/controllers/agent/functionController";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Clock, Edit, Play, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Skeleton from "react-loading-skeleton";
import type { z } from "zod";
import { toast } from "sonner";

const TriggersStep = () => {
  const params = useParams();
  const agentUuid = params.id as string;
  const [editingTriggerId, setEditingTriggerId] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showTwitterModal, setShowTwitterModal] = useState(false);

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
    let res;

    if (editingTriggerId) {
      res = await AgentTriggerController.updateAgentTrigger(editingTriggerId, data);
    } else {
      res = await AgentTriggerController.createAgentTrigger(data);
    }

    if (res) {
      setShowTriggerDialog(false);
      refetchAgentTriggers();
      resetForm();
    }
  };

  const resetForm = () => {
    methods.reset();
    setEditingTriggerId(null);
    setActiveTab("basic");
  };

  const handleEditTrigger = async (triggerId: number) => {
    const trigger = await AgentTriggerController.getTriggerById(triggerId);
    if (trigger) {
      methods.reset({
        name: trigger.name,
        description: trigger.description,
        interval: trigger.interval,
        runEvery: trigger.runEvery,
        functionName: trigger.functionName,
        informationSource: trigger.informationSource,
        agentUuid: agentUuid,
      });
      setEditingTriggerId(triggerId);
      setShowTriggerDialog(true);
    }
  };

  const handleDeleteTrigger = async (triggerId: number) => {
    const res = await AgentTriggerController.deleteAgentTrigger(triggerId);
    if (res) {
      refetchAgentTriggers();
    }
  };
  const handleToggleTriggerStatus = async (triggerId: number) => {
    const res = await AgentTriggerController.toggleTriggerStatus(triggerId);
    if (res) {
      refetchAgentTriggers();
    }
  };
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (!showTriggerDialog) {
      resetForm();
    }
  }, [showTriggerDialog]);

  useEffect(() => {
    if (methods.formState.errors.description || methods.formState.errors.name || methods.formState.errors.interval || methods.formState.errors.description) {
      setActiveTab("basic");
    }
    if (methods.formState.errors.informationSource || methods.formState.errors.functionName) {
      setActiveTab("function");
    }
  }, [methods.formState.errors]);

  console.log("agent triggers are", agentTriggers);

  const handleTestTrigger = async (triggerId: number) => {
    try {
      setIsTesting(true);
      await AgentTriggerController.testAgentTrigger(triggerId);
      toast.success("Trigger test completed successfully!");
      refetchAgentTriggers();
    } catch (error) {
      if (error instanceof Error && error.message.includes("Twitter account is not connected")) {
        setShowTwitterModal(true);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to test trigger");
      }
    } finally {
      setIsTesting(false);
    }
  };

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
              <Card key={trigger.id} className={`h-[180px] transition-shadow duration-300 hover:shadow-lg ${trigger.status === "paused" ? "opacity-60" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="truncate text-lg font-semibold">{trigger.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch id={`trigger-status-${trigger.id}`} checked={trigger.status === "active"} onCheckedChange={() => handleToggleTriggerStatus(trigger.id)} />
                      <Label htmlFor={`trigger-status-${trigger.id}`} className="text-xs">
                        {trigger.status === "active" ? "Active" : "Paused"}
                      </Label>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" disabled={isTesting}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Test Trigger</DialogTitle>
                          <DialogDescription>
                            This will run the trigger immediately to test its functionality.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button onClick={() => handleTestTrigger(trigger.id)} disabled={isTesting}>
                            {isTesting ? "Testing..." : "Run Test"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => handleEditTrigger(trigger.id)} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteTrigger(trigger.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
            <Dialog
              open={showTriggerDialog}
              onOpenChange={(open) => {
                setShowTriggerDialog(open);
                if (!open) resetForm();
              }}
            >
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
                  <DialogTitle>{editingTriggerId ? "Edit Trigger" : "Create Trigger"}</DialogTitle>
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
                            <Input label="Trigger Name" required name="name" placeholder="Enter Trigger Name" defaultValue={methods.getValues("name") || ""} />
                          </div>
                          <div className="space-y-2">
                            <Textarea name="description" label="Trigger Description" required placeholder="What does this trigger do?" defaultValue={methods.getValues("description") || ""} className="h-28" />
                          </div>

                          <div className="space-y-2">
                            <Label>How Often Should The Trigger Run?</Label>
                            <div className="flex gap-2">
                              <Input
                                name="interval"
                                type="number"
                                className="w-24"
                                defaultValue={methods.getValues("interval")?.toString() || ""}
                              />
                              <div>
                                <select {...methods.register("runEvery")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue={methods.getValues("runEvery") || ""}>
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
                          <select {...methods.register("functionName")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue={methods.getValues("functionName") || ""}>
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
                          <select {...methods.register("informationSource")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue={methods.getValues("informationSource") || ""}>
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
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTriggerDialog(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" loading={methods.formState.isSubmitting}>
                        {editingTriggerId ? "Update Trigger" : "Save Trigger"}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Twitter Connection Modal */}
      <Dialog open={showTwitterModal} onOpenChange={setShowTwitterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Twitter Account Required</DialogTitle>
            <DialogDescription>
              To test this trigger, you need to connect your Twitter account first. Please go to the Launch tab and connect your Twitter account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTwitterModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriggersStep;
