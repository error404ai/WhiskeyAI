"use client";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { setAgentInformation } from "@/redux/features/agentSlice/agentState";
import { RootState } from "@/redux/store/store";
import { Tabs } from "@radix-ui/react-tabs";
import { Bot, Newspaper } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const InformationStep = () => {
  const dispatch = useDispatch();
  const agentInformation = useSelector((state: RootState) => state.agentState.information);

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Agent Background</h2>
        <p className="text-muted-foreground text-sm">Define your agent&apos;s personality and settings</p>

        <Tabs defaultValue="agent" className="w-full">
          <TabsList>
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
          </TabsList>
          <TabsContent value="agent" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                  <div className="mb-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Agent Description</label>
                      <Button variant="link" className="h-auto p-0 text-xs text-blue-500">
                        Enhance with AI
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 text-xs">Outline your agent&apos;s personality by detailing aspects like tweeting habits, demeanor, and communication style</p>
                  <Textarea placeholder="Enter agent description" className="h-24" value={agentInformation.description} onChange={(e) => dispatch(setAgentInformation({ description: e.target.value }))} />

                  <p className={`mt-1 text-xs ${typeof agentInformation.description === "undefined" || agentInformation.description.length < 30 ? "text-red-500" : agentInformation.description.length < 100 ? "text-yellow-500" : "text-green-500"}`}>Prompt strength: {typeof agentInformation.description === "undefined" ? "weak" : agentInformation.description.length < 30 ? "weak" : agentInformation.description.length < 100 ? "normal" : "strong"}</p>
                </div>

                <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                  <div className="mb-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Agent Goal</label>
                      <Button variant="link" className="h-auto p-0 text-xs text-blue-500">
                        Enhance with AI
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 text-xs">Specify the primary objective or core function of the agent. This guides the ai planner in task generation.</p>
                  <Textarea placeholder="Enter agent goal" className="h-24" value={agentInformation.goal} onChange={(e) => dispatch(setAgentInformation({ goal: e.target.value }))} />

                  <p className={`mt-1 text-xs ${typeof agentInformation.goal === "undefined" || agentInformation.goal.length < 30 ? "text-red-500" : agentInformation.goal.length < 100 ? "text-yellow-500" : "text-green-500"}`}>Prompt strength: {typeof agentInformation.goal === "undefined" ? "weak" : agentInformation.goal.length < 30 ? "weak" : agentInformation.goal.length < 100 ? "normal" : "strong"}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="news">
            <div className="text-muted-foreground p-4 text-center">News content will appear here</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InformationStep;
