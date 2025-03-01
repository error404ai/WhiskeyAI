/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AgentTrigger } from "@/db/schema";
import { Badge, Plus, X } from "lucide-react";
import { useState } from "react";

const TriggersStep = () => {
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);

  const handleAddTrigger = () => {
    console.log("new trigger");
  };

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

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Triggers</h2>
        <p className="text-muted-foreground text-sm">Configure the triggers for your agent</p>

        <div className="flex flex-wrap gap-2">
          {triggers.map((trigger) => (
            <Badge key={trigger.id} className="flex items-center gap-1 py-1 pr-1 pl-2">
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
            <div className="mt-4">
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
                      <Label>
                        Trigger Name<span className="text-red-500">*</span>
                      </Label>
                      <Input placeholder="Enter Trigger Name" />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Trigger Description<span className="text-red-500">*</span>
                      </Label>
                      <Textarea placeholder="What does this trigger do?" />
                    </div>
                    <div className="space-y-2">
                      <Label>How Often Should The Trigger Run?</Label>
                      <div className="flex gap-2">
                        <Input type="number" min="1" className="w-24" />
                        <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="minutes">
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="function">
                  <div className="text-muted-foreground py-8 text-center">Function configuration coming soon</div>
                </TabsContent>
              </Tabs>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTriggerDialog(false)}>
                  Close
                </Button>
                <Button onClick={handleAddTrigger}>Save Trigger</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TriggersStep;
