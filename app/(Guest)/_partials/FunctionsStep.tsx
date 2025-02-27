"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Twitter, Mic, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CustomFunction {
    id: string
    name: string
    description: string
    platform: string
    icon: string
    type: "agent" | "trigger"
}

function FunctionsStep() {
    const [showFunctionDialog, setShowFunctionDialog] = useState(false)
    const [activeTab, setActiveTab] = useState<"agent" | "trigger">("agent")
    const [functions, setFunctions] = useState<CustomFunction[]>([
        {
            id: "1",
            name: "post_tweet",
            description: "Create and publish a new tweet",
            platform: "Twitter",
            icon: "Twitter",
            type: "agent",
        },
        {
            id: "2",
            name: "quote_tweet",
            description: "Quote and comment on a tweet",
            platform: "Twitter",
            icon: "Twitter",
            type: "agent",
        },
        {
            id: "3",
            name: "search_twitter",
            description: "Search twitter for information & sentiment",
            platform: "Twitter",
            icon: "Twitter",
            type: "agent",
        },
        {
            id: "4",
            name: "generate_voice",
            description: "Use to convert text to speech",
            platform: "Special",
            icon: "Mic",
            type: "agent",
        },
    ])

    const [newFunction, setNewFunction] = useState({
        name: "",
        description: "",
        usageHints: "",
        arguments: [],
    })

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "Twitter":
                return Twitter
            case "Mic":
                return Mic
            default:
                return MessageSquare
        }
    }

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Configure Functions</h2>
                <p className="text-muted-foreground text-sm">
                    Select and configure the functions available to your agent and your triggers
                </p>

                <Tabs
                    defaultValue="agent"
                    className="w-full"
                    onValueChange={(value) => setActiveTab(value as "agent" | "trigger")}
                >
                    <TabsList className="mb-4">
                        <TabsTrigger value="agent" className="flex items-center gap-2">
                            Agent Functions
                        </TabsTrigger>
                        <TabsTrigger value="trigger" className="flex items-center gap-2">
                            Trigger Functions
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="agent">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {functions
                                .filter((f) => f.type === "agent")
                                .map((func) => {
                                    const Icon = getIcon(func.icon)
                                    return (
                                        <Card key={func.id} className="p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="rounded-lg bg-muted p-2">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{func.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{func.description}</p>
                                                    <Badge variant="secondary" className="mt-2">
                                                        {func.platform}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}

                            <Dialog open={showFunctionDialog} onOpenChange={setShowFunctionDialog}>
                                <DialogTrigger asChild>
                                    <Card className="flex h-[124px] cursor-pointer items-center justify-center border-dashed p-4 hover:bg-muted/50">
                                        <div className="flex flex-col items-center space-y-2 text-center">
                                            <Plus className="h-6 w-6" />
                                            <span className="text-sm font-medium">Add Custom Function</span>
                                        </div>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[800px]">
                                    <DialogHeader>
                                        <DialogTitle>Custom Function</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4 grid grid-cols-[2fr,1fr] gap-4">
                                        <div className="space-y-4">
                                            <Tabs defaultValue="basic" className="w-full">
                                                <TabsList className="mb-4">
                                                    <TabsTrigger value="basic">Basic</TabsTrigger>
                                                    <TabsTrigger value="request">Request</TabsTrigger>
                                                    <TabsTrigger value="response">Response</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="basic">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Function Name<span className="text-red-500">*</span>
                                                            </Label>
                                                            <Input
                                                                placeholder="enter_function_name"
                                                                value={newFunction.name}
                                                                onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Use snake_case for function names (e.g. send_message)
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Description<span className="text-red-500">*</span>
                                                            </Label>
                                                            <Textarea
                                                                placeholder="Ex: Call this function when a user asks you to tell them a joke about a specific topic"
                                                                value={newFunction.description}
                                                                onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                This is what your agent uses to interpret when it should call the function. Aim for 1-2
                                                                sentences describing when it should call the function and be descriptive.
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Usage Hints</Label>
                                                            <Textarea
                                                                placeholder="Any constraints or best practices?"
                                                                value={newFunction.usageHints}
                                                                onChange={(e) => setNewFunction({ ...newFunction, usageHints: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="request">
                                                    <div className="text-center text-muted-foreground py-8">
                                                        Request configuration coming soon
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="response">
                                                    <div className="text-center text-muted-foreground py-8">
                                                        Response configuration coming soon
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">Function Arguments</h4>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Define the inputs required for this function
                                                </p>
                                                <Button variant="outline" className="w-full">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Argument
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-l pl-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">Preview</h4>
                                                    <Button variant="link" className="text-xs">
                                                        Show Response
                                                    </Button>
                                                </div>
                                                <div className="rounded-md bg-zinc-900 p-4">
                                                    <pre className="text-xs text-white">
                                                        {JSON.stringify(
                                                            {
                                                                name: newFunction.name || "",
                                                                description: newFunction.description || "",
                                                                hint: newFunction.usageHints || "",
                                                                arguments: [],
                                                                type: "Agent",
                                                            },
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                </div>
                                                <Button variant="outline" className="w-full">
                                                    Test Endpoint
                                                </Button>
                                                <Button className="w-full">Save Function</Button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </TabsContent>
                    <TabsContent value="trigger">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {functions
                                .filter((f) => f.type === "trigger")
                                .map((func) => {
                                    const Icon = getIcon(func.icon)
                                    return (
                                        <Card key={func.id} className="p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="rounded-lg bg-muted p-2">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{func.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{func.description}</p>
                                                    <Badge variant="secondary" className="mt-2">
                                                        {func.platform}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}

                            <Card className="flex h-[124px] cursor-pointer items-center justify-center border-dashed p-4 hover:bg-muted/50">
                                <div className="flex flex-col items-center space-y-2 text-center">
                                    <Plus className="h-6 w-6" />
                                    <span className="text-sm font-medium">Add Custom Function</span>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default FunctionsStep
