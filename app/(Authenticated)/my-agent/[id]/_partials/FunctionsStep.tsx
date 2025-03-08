"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, Plus, Twitter, X } from "lucide-react";
import { useState } from "react";

interface CustomFunction {
  id: string;
  name: string;
  description: string;
  platform: string;
  icon: string;
  type: "agent" | "trigger";
}
interface Argument {
  id: string
  name: string
  type: string
  description: string
  example: string
  isOptional: boolean
}

interface FunctionData {
  name: string
  description: string
  usageHints: string
  arguments: Argument[]
}
function FunctionsStep() {

  const [showFunctionDialog, setShowFunctionDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<"agent" | "trigger">("agent");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      name: "retweet",
      description: "Retweet an existing tweet",
      platform: "Twitter",
      icon: "Twitter",
      type: "agent",
    },
    {
      id: "3",
      name: "reply_tweet",
      description: "Reply to an existing tweet",
      platform: "Twitter",
      icon: "Twitter",
      type: "agent",
    },
    {
      id: "4",
      name: "quote_tweet",
      description: "Quote and comment on a tweet",
      platform: "Twitter",
      icon: "Twitter",
      type: "agent",
    },
    {
      id: "5",
      name: "token_launch",
      description: "Use to launch token",
      platform: "wallet",
      icon: "wallet",
      type: "agent",
    },
    // {
    //   id: "3",
    //   name: "search_twitter",
    //   description: "Search twitter for information & sentiment",
    //   platform: "Twitter",
    //   icon: "Twitter",
    //   type: "agent",
    // },
    // {
    //   id: "4",
    //   name: "generate_voice",
    //   description: "Use to convert text to speech",
    //   platform: "Special",
    //   icon: "Mic",
    //   type: "agent",
    // },
  ]);

  // const [newFunction, setNewFunction] = useState({
  //   name: "",
  //   description: "",
  //   usageHints: "",
  //   arguments: [],
  // });


  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Twitter":
        return Twitter;
      case "Mic":
        return Mic;
      default:
        return MessageSquare;
    }
  };

  const [showArgumentForm, setShowArgumentForm] = useState(false)
  const [newFunction, setNewFunction] = useState<FunctionData>({
    name: "",
    description: "",
    usageHints: "",
    arguments: [],
  })

  const [newArgument, setNewArgument] = useState<Omit<Argument, "id">>({
    name: "",
    type: "string",
    description: "",
    example: "",
    isOptional: false,
  })

  const handleSaveArgument = () => {
    if (newArgument.name && newArgument.description) {
      setNewFunction({
        ...newFunction,
        arguments: [
          ...newFunction.arguments,
          {
            id: Math.random().toString(36).substr(2, 9),
            ...newArgument,
          },
        ],
      })
      setNewArgument({
        name: "",
        type: "string",
        description: "",
        example: "",
        isOptional: false,
      })
      setShowArgumentForm(false)
    }
  }

  const removeArgument = (argumentId: string) => {
    setNewFunction({
      ...newFunction,
      arguments: newFunction.arguments.filter((arg) => arg.id !== argumentId),
    })
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Functions</h2>
        <p className="text-muted-foreground text-sm">Select and configure the functions available to your agent and your triggers</p>

        <Tabs defaultValue="agent" className="w-full" onValueChange={(value) => setActiveTab(value as "agent" | "trigger")}>
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
                  const Icon = getIcon(func.icon);
                  return (
                    <Card key={func.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-muted rounded-lg p-2">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{func.name}</h3>
                          <p className="text-muted-foreground text-sm">{func.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {func.platform}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
          <TabsContent value="trigger">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {functions
                .filter((f) => f.type === "trigger")
                .map((func) => {
                  const Icon = getIcon(func.icon);
                  return (
                    <Card key={func.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-muted rounded-lg p-2">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{func.name}</h3>
                          <p className="text-muted-foreground text-sm">{func.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {func.platform}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}



              {/* <Card className="hover:bg-muted/50 flex h-[124px] cursor-pointer items-center justify-center border-dashed p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Custom Function</span>
                </div>
              </Card> */}
            </div>
          </TabsContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <Dialog open={showFunctionDialog} onOpenChange={setShowFunctionDialog}>
              {/* <DialogTrigger asChild>
                <Card className="hover:bg-muted/50 flex h-[124px] cursor-pointer items-center justify-center border-dashed p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add Custom Function</span>
                  </div>
                </Card>
              </DialogTrigger> */}
              <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px] lg:max-w-[900px]">
                <DialogHeader>
                  <DialogTitle>Custom Function</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                    <div>
                      <TabsList className="sticky top-0 z-10 bg-white p-2">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>

                      <div className="space-y-4 p-4">
                        <TabsContent value="basic">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>
                                Function Name<span className="text-red-500">*</span>
                              </Label>
                              <Input placeholder="enter_function_name" value={newFunction.name} onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })} />
                              <p className="text-muted-foreground text-xs">Use snake_case (e.g. send_message)</p>
                            </div>

                            <div className="space-y-2">
                              <Label>
                                Description<span className="text-red-500">*</span>
                              </Label>
                              <Textarea placeholder="Ex: Call this function when a user asks for a joke..." value={newFunction.description} onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                              <Label>Usage Hints</Label>
                              <Textarea placeholder="Any constraints or best practices?" value={newFunction.usageHints} onChange={(e) => setNewFunction({ ...newFunction, usageHints: e.target.value })} />
                            </div>
                          </div>


                          <div className="mt-4">
                            <div className="flex justify-between mb-4">
                              <h4 className="mb-2 text-sm font-medium">Function Arguments</h4>
                              <Button variant="outline" onClick={() => setShowArgumentForm(true)}>
                                Add Argument
                              </Button>
                            </div>
                            {/* Saved Arguments */}
                            {newFunction.arguments.length > 0 && (
                              <div className="space-y-2 mb-4">
                                {newFunction.arguments.map((arg) => (
                                  <Card key={arg.id} className="p-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">{arg.name}</h4>
                                          <span className="text-xs text-muted-foreground">({arg.type})</span>
                                          {arg.isOptional && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Optional</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{arg.description}</p>
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeArgument(arg.id)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {/* Argument Form */}
                            {showArgumentForm ? (
                              <Card className="p-4 bg-muted/50">
                                <div className="space-y-4">
                                  {/* <h3 className="font-medium">Function Arguments</h3> */}
                                  <p className="text-sm text-muted-foreground">Define the inputs required for this function</p>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>
                                        Name<span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        placeholder="e.g., user_id"
                                        value={newArgument.name}
                                        onChange={(e) => setNewArgument({ ...newArgument, name: e.target.value })}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Type</Label>
                                      <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newArgument.type}
                                        onChange={(e) => setNewArgument({ ...newArgument, type: e.target.value })}
                                      >
                                        <option value="string">string</option>
                                        <option value="number">number</option>
                                        <option value="boolean">boolean</option>
                                        <option value="object">object</option>
                                        <option value="array">array</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>
                                      Description<span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      placeholder="Ex. This is the topic of the joke the user asks about"
                                      value={newArgument.description}
                                      onChange={(e) => setNewArgument({ ...newArgument, description: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      This is what your agent uses to interpret what it should pass into the function
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>
                                      Example<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      placeholder="e.g., user_id"
                                      value={newArgument.example}
                                      onChange={(e) => setNewArgument({ ...newArgument, example: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      This is what your agent uses to interpret what it should pass into the function
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="optional"
                                      checked={newArgument.isOptional}
                                      onCheckedChange={(checked) => setNewArgument({ ...newArgument, isOptional: checked as boolean })}
                                    />
                                    <label
                                      htmlFor="optional"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Optional argument
                                    </label>
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowArgumentForm(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveArgument}>Save Argument</Button>
                                  </div>
                                </div>
                              </Card>
                            ) : (
                              <Button variant="outline" className="w-full" onClick={() => setShowArgumentForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Argument
                              </Button>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="request">
                          <div className="text-muted-foreground py-8 text-center">Request configuration coming soon</div>
                        </TabsContent>

                        <TabsContent value="response">
                          <div className="text-muted-foreground py-8 text-center">Response configuration coming soon</div>
                        </TabsContent>


                      </div>
                    </div>
                    <div className="sticky bottom-0 space-y-4 border-t bg-white p-4">
                      <h4 className="text-sm font-medium">Preview</h4>
                      <div className="overflow-x-auto rounded-md bg-zinc-900 p-4">
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
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default FunctionsStep;
