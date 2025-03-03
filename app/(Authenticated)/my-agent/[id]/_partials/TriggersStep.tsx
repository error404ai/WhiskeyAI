/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AgentTrigger } from "@/db/schema";
import * as AgentTriggerController from "@/http/controllers/agent/AgentTriggerController";
import * as FunctionController from "@/http/controllers/agent/functionController";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Skeleton from "react-loading-skeleton";
import { z } from "zod";

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
      refetchAgentTriggers();
    }
  };

  const [showTriggerDialog, setShowTriggerDialog] = useState(false);

  const [triggers, setTriggers] = useState<AgentTrigger[]>([
    {
      id: 1,
      agentId: 1,
      name: "Tweet From Recent Memory",
      description: "Automatically tweet based on recent interactions",
      interval: 30,
      runEvery: "minutes",
      functionName: "",
      informationSource: "",
    },
    {
      id: 2,
      agentId: 1,
      name: "Respond to mentions",
      description: "Reply to Twitter mentions",
      interval: 5,
      runEvery: "minutes",
      functionName: "",
      informationSource: "",
    },
  ]);

  // console.log("functions", functions);
  console.log("triggers are", agentTriggers);
  // console.log("errors are", methods.formState.errors);

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Triggers</h2>
        <p className="text-muted-foreground text-sm">Configure the triggers for your agent</p>

        {(isAgentTriggerPending || isAgentTriggerRefetching) && <Skeleton count={2} height={24} />}
        <div className="flex flex-wrap gap-2">
          {!isAgentTriggerPending &&
            !isAgentTriggerRefetching &&
            agentTriggers?.map((trigger) => (
              <Badge key={trigger.id} variant={"success"} className="flex items-center gap-1 py-1 pr-1 pl-2">
                {trigger.name}
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent">
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
        </div>

        <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
          <DialogTrigger asChild>
            <Card className="hover:bg-muted/50 flex h-[104px] cursor-pointer items-center justify-center border-dashed p-4">
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
                <Tabs defaultValue="basic" className="w-full">
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
                          <select {...methods.register("runEvery")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="minutes">
                            <option value="minutes">minutes</option>
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="function" className="space-y-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Trigger Function</span>
                      <select {...methods.register("functionName")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="minutes">
                        {functions?.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Where to get tweet information from?</span>
                      <select {...methods.register("informationSource")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="minutes">
                        <option value="From Agent Description">From Agent Description</option>
                        <option value="From Agent Description">Custom Functions</option>
                      </select>
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
    </div>
  );
};

export default TriggersStep;
