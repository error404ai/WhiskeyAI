import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@radix-ui/react-tabs";
import { Bot, Newspaper } from "lucide-react";

const InformationStep = () => {
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
                  <Input placeholder="Enter agent description" className="h-24" />
                  <p className="mt-1 text-xs text-red-500">Prompt strength: weak</p>
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
                  <Input placeholder="Enter agent goal" className="h-24" />
                  <p className="mt-1 text-xs text-red-500">Prompt strength: weak</p>
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
