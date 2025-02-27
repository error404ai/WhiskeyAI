/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Info, MessageSquare, Newspaper, Plus, Rocket, Send, Settings2, Share2, Trash2, Twitter, Wrench, X, Zap } from "lucide-react";
import { useState } from "react";
import FunctionsStep from "./_partials/FunctionsStep";
import LaunchStep from "./_partials/LaunchStep";

interface FormData {
  information: {
    description: string;
    goal: string;
  };
  platform: {
    name: string;
    type: string;
    visibility: string;
  };
  triggers: {
    webhookUrl: string;
    notifications: boolean;
  };
  functions: {
    customEndpoints: string;
    apiKey: string;
  };
  launch: {
    environment: string;
    version: string;
  };
}

interface Platform {
  id: string;
  name: string;
  icon: any;
  description: string;
  enabled: boolean;
}

interface Trigger {
  id: string;
  name: string;
  description: string;
  interval: number;
  type: "basic" | "function";
}

export default function AgentConfigPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    information: {
      description: "",
      goal: "",
    },
    platform: {
      name: "",
      type: "chatbot",
      visibility: "private",
    },
    triggers: {
      webhookUrl: "",
      notifications: false,
    },
    functions: {
      customEndpoints: "",
      apiKey: "",
    },
    launch: {
      environment: "development",
      version: "1.0.0",
    },
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: "1",
      name: "Tweet From Recent Memory",
      description: "Automatically tweet based on recent interactions",
      interval: 30,
      type: "basic",
    },
    {
      id: "2",
      name: "Respond to mentions",
      description: "Reply to Twitter mentions",
      interval: 5,
      type: "basic",
    },
  ]);

  const configSteps = [
    {
      icon: Info,
      title: "Information",
      description: "Define agent personality, goals, and news",
      active: currentStep === 0,
    },
    {
      icon: Share2,
      title: "Platform Configuration",
      description: "Configure your platform settings",
      active: currentStep === 1,
    },
    {
      icon: Zap,
      title: "Configure Triggers",
      description: "Set up custom triggers",
      active: currentStep === 2,
    },
    {
      icon: Wrench,
      title: "Configure Functions",
      description: "Set up custom functions for your agent",
      active: currentStep === 3,
    },
    {
      icon: Rocket,
      title: "Finalize & Launch",
      description: "Deploy your agent",
      active: currentStep === 4,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const availablePlatforms = [
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      description: "A social media platform for sharing short messages and updates.",
    },
    {
      id: "discord",
      name: "Discord",
      icon: MessageSquare,
      description: "A chat platform for communities and teams.",
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      description: "A messaging app with bot capabilities.",
    },
  ];

  const addPlatform = (platform: Omit<Platform, "enabled">) => {
    setPlatforms([...platforms, { ...platform, enabled: true }]);
    setShowPlatformDialog(false);
  };

  const removePlatform = (platformId: string) => {
    setPlatforms(platforms.filter((p) => p.id !== platformId));
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(platforms.map((p) => (p.id === platformId ? { ...p, enabled: !p.enabled } : p)));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <InformationStep formData={formData.information} setFormData={setFormData} />;
      case 1:
        return <PlatformStep platforms={platforms} onAddPlatform={addPlatform} onRemovePlatform={removePlatform} onTogglePlatform={togglePlatform} />;
      case 2:
        return <TriggersStep triggers={triggers} setTriggers={setTriggers} />;
      case 3:
        return <FunctionsStep />;
      case 4:
        return <LaunchStep />;
      default:
        return null;
    }
  };

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
                  <Card key={index} onClick={() => setCurrentStep(index)} className={`cursor-pointer p-4 transition-colors ${step.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
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

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}

function InformationStep({ formData, setFormData }: any) {
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
                  <Input
                    placeholder="Enter agent description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev: FormData) => ({
                        ...prev,
                        information: { ...prev.information, description: e.target.value },
                      }))
                    }
                    className="h-24"
                  />
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
                  <Input
                    placeholder="Enter agent goal"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData((prev: FormData) => ({
                        ...prev,
                        information: { ...prev.information, goal: e.target.value },
                      }))
                    }
                    className="h-24"
                  />
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
}

function PlatformStep({ platforms, onAddPlatform, onRemovePlatform, onTogglePlatform }: { platforms: Platform[]; onAddPlatform: (platform: Omit<Platform, "enabled">) => void; onRemovePlatform: (platformId: string) => void; onTogglePlatform: (platformId: string) => void }) {
  const availablePlatforms = [
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      description: "A social media platform for sharing short messages and updates.",
    },
    {
      id: "discord",
      name: "Discord",
      icon: MessageSquare,
      description: "A chat platform for communities and teams.",
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      description: "A messaging app with bot capabilities.",
    },
  ];

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Platforms</h2>
        <p className="text-muted-foreground text-sm">Choose which platforms you want your agent on</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <Card key={platform.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted rounded-lg p-2">
                    <platform.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-muted-foreground text-sm">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onRemovePlatform(platform.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Switch checked={platform.enabled} onCheckedChange={() => onTogglePlatform(platform.id)} />
                </div>
              </div>
            </Card>
          ))}

          <Dialog>
            <DialogTrigger asChild>
              <Card className="hover:bg-muted/50 flex h-[104px] cursor-pointer items-center justify-center border-dashed p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Platform</span>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Platform</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {availablePlatforms
                  .filter((p) => !platforms.find((existing) => existing.id === p.id))
                  .map((platform) => (
                    <Card key={platform.id} className="hover:bg-muted/50 cursor-pointer p-4" onClick={() => onAddPlatform(platform)}>
                      <div className="flex items-center space-x-4">
                        <div className="bg-muted rounded-lg p-2">
                          <platform.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-muted-foreground text-sm">{platform.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function TriggersStep({ triggers, setTriggers }: { triggers: Trigger[]; setTriggers: (triggers: Trigger[]) => void }) {
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Omit<Trigger, "id">>({
    name: "",
    description: "",
    interval: 5,
    type: "basic",
  });

  const handleAddTrigger = () => {
    if (newTrigger.name && newTrigger.description) {
      setTriggers([
        ...triggers,
        {
          id: Math.random().toString(36).substr(2, 9),
          ...newTrigger,
        },
      ]);
      setShowTriggerDialog(false);
      setNewTrigger({
        name: "",
        description: "",
        interval: 5,
        type: "basic",
      });
    }
  };

  const removeTrigger = (triggerId: string) => {
    setTriggers(triggers.filter((t) => t.id !== triggerId));
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Triggers</h2>
        <p className="text-muted-foreground text-sm">Configure the triggers for your agent</p>

        <div className="flex flex-wrap gap-2">
          {triggers.map((trigger) => (
            <Badge key={trigger.id} variant="secondary" className="flex items-center gap-1 py-1 pr-1 pl-2">
              {trigger.name}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => removeTrigger(trigger.id)}>
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
                      <Input placeholder="Enter Trigger Name" value={newTrigger.name} onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Trigger Description<span className="text-red-500">*</span>
                      </Label>
                      <Textarea placeholder="What does this trigger do?" value={newTrigger.description} onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>How Often Should The Trigger Run?</Label>
                      <div className="flex gap-2">
                        <Input type="number" min="1" value={newTrigger.interval} onChange={(e) => setNewTrigger({ ...newTrigger, interval: Number.parseInt(e.target.value) || 5 })} className="w-24" />
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
}

<>
  <FunctionsStep />
  <LaunchStep />
</>;

// function FunctionsStep({ formData, setFormData }: any) {
//   return (
//     <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Configure Functions</h2>
//         <p className="text-muted-foreground text-sm">Set up custom endpoints and API access</p>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
//           <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//             <div className="space-y-4">
//               <div>
//                 <Label>Custom Endpoints</Label>
//                 <Input
//                   placeholder="Enter endpoint URL"
//                   value={formData.customEndpoints}
//                   onChange={(e) =>
//                     setFormData((prev: FormData) => ({
//                       ...prev,
//                       functions: { ...prev.functions, customEndpoints: e.target.value },
//                     }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//             <div className="space-y-4">
//               <div>
//                 <Label>API Key</Label>
//                 <Input
//                   type="password"
//                   placeholder="Enter API key"
//                   value={formData.apiKey}
//                   onChange={(e) =>
//                     setFormData((prev: FormData) => ({
//                       ...prev,
//                       functions: { ...prev.functions, apiKey: e.target.value },
//                     }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

{
  /* <>
<LaunchStep />
</> */
}

// function LaunchStep({ formData, setFormData }: any) {
//   return (
//     <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Finalize & Launch</h2>
//         <p className="text-muted-foreground text-sm">Configure deployment settings</p>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
//           <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//             <div className="space-y-4">
//               <div>
//                 <Label>Environment</Label>
//                 <Select
//                   value={formData.environment}
//                   onValueChange={(value) =>
//                     setFormData((prev: FormData) => ({
//                       ...prev,
//                       launch: { ...prev.launch, environment: value },
//                     }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select environment" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="development">Development</SelectItem>
//                     <SelectItem value="staging">Staging</SelectItem>
//                     <SelectItem value="production">Production</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>

//           <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
//             <div className="space-y-4">
//               <div>
//                 <Label>Version</Label>
//                 <Input
//                   placeholder="1.0.0"
//                   value={formData.version}
//                   onChange={(e) =>
//                     setFormData((prev: FormData) => ({
//                       ...prev,
//                       launch: { ...prev.launch, version: e.target.value },
//                     }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
