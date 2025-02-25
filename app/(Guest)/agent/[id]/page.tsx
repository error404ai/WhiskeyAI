"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Info, Newspaper, Rocket, Share2, Wrench, Zap } from "lucide-react";
import { useState } from "react";

export default function AgentConfigPage() {
  const [agentDescription, setAgentDescription] = useState("");
  const [agentGoal, setAgentGoal] = useState("");

  const configSteps = [
    {
      icon: Info,
      title: "Information",
      description: "Define agent personality, goals, and news",
      active: true,
    },
    {
      icon: Share2,
      title: "Platform Configuration",
      description: "Configure your platform settings",
    },
    {
      icon: Zap,
      title: "Configure Triggers",
      description: "Set up custom triggers",
    },
    {
      icon: Wrench,
      title: "Configure Functions",
      description: "Set up custom functions for your agent and triggers",
    },
    {
      icon: Rocket,
      title: "Finalize & Launch",
      description: "Simulate, Train, & Deploy your agent",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                Testing <span className="text-muted-foreground text-sm">$BUILD</span>
              </h1>
            </div>
          </div>

          {/* Configuration Steps */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Agent Definition Prompts</h2>
            <p className="text-muted-foreground mb-4 text-sm">Configure your agent&apos;s behavior and capabilities</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {configSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className={`cursor-pointer p-4 transition-colors ${step.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <div className="space-y-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm opacity-90">{step.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
          {/* Agent Background */}
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
                          <Button variant="link" className="h-auto p-0 text-xs text-blue-500" onClick={() => {}}>
                            Enhance with AI
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2 text-xs">Outline your agent&apos;s personality by detailing aspects like tweeting habits, demeanor, and communication style</p>
                      <Input placeholder="Enter agent description" value={agentDescription} onChange={(e) => setAgentDescription(e.target.value)} className="h-24" />
                      <p className="mt-1 text-xs text-red-500">Prompt strength: weak</p>
                    </div>

                    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
                      <div className="mb-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">Agent Goal</label>
                          <Button variant="link" className="h-auto p-0 text-xs text-blue-500" onClick={() => {}}>
                            Enhance with AI
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2 text-xs">Specify the primary objective or core function of the agent. This guides the ai planner in task generation.</p>
                      <Input placeholder="Enter agent goal" value={agentGoal} onChange={(e) => setAgentGoal(e.target.value)} className="h-24" />
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
      </div>
    </div>
  );
}
