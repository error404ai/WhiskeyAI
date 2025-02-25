"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Info, Share2, Zap, Wrench, Rocket, Bot, Newspaper } from "lucide-react"

export default function AgentConfigPage() {
    const [agentDescription, setAgentDescription] = useState("")
    const [agentGoal, setAgentGoal] = useState("")

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
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold">Testing <span className="text-sm text-muted-foreground">$BUILD</span></h1>

                        </div>
                    </div>

                    {/* Configuration Steps */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Agent Definition Prompts</h2>
                        <p className="text-sm text-muted-foreground mb-4">Configure your agent's behavior and capabilities</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {configSteps.map((step, index) => {
                                const Icon = step.icon
                                return (
                                    <Card
                                        key={index}
                                        className={`p-4 cursor-pointer transition-colors ${step.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                            }`}
                                    >
                                        <div className="space-y-2">
                                            <Icon className="h-5 w-5" />
                                            <h3 className="font-medium">{step.title}</h3>
                                            <p className="text-sm opacity-90">{step.description}</p>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
                    {/* Agent Background */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Agent Background</h2>
                        <p className="text-sm text-muted-foreground">Define your agent's personality and settings</p>

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
                            <TabsContent value="agent" className="space-y-6 mt-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
                                            <div className="mb-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium">Agent Description</label>
                                                    <Button variant="link" className="text-blue-500 text-xs h-auto p-0" onClick={() => { }}>
                                                        Enhance with AI
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-xs mb-2">Outline your agent's personality by detailing aspects like tweeting habits, demeanor, and communication style</p>
                                            <Input
                                                placeholder="Enter agent description"
                                                value={agentDescription}
                                                onChange={(e) => setAgentDescription(e.target.value)}
                                                className="h-24"
                                            />
                                            <p className="text-red-500 text-xs mt-1">Prompt strength: weak</p>

                                        </div>

                                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
                                            <div className="mb-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium">Agent Goal</label>
                                                    <Button variant="link" className="text-blue-500 text-xs h-auto p-0" onClick={() => { }}>
                                                        Enhance with AI
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-xs mb-2">Specify the primary objective or core function of the agent. This guides the ai planner in task generation.</p>
                                            <Input
                                                placeholder="Enter agent goal"
                                                value={agentGoal}
                                                onChange={(e) => setAgentGoal(e.target.value)}
                                                className="h-24"
                                            />
                                            <p className="text-red-500 text-xs mt-1">Prompt strength: weak</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="news">
                                <div className="p-4 text-center text-muted-foreground">News content will appear here</div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

