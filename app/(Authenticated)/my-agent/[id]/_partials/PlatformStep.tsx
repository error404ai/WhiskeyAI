/* eslint-disable @typescript-eslint/no-unused-vars */
import { Switch } from "@/components/DatePicker/Switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AgentPlatform } from "@/db/schema";
import { MessageSquare, Plus, Send, Settings2, Trash2, Twitter } from "lucide-react";
import { useState } from "react";

const PlatformStep = () => {
  const [platforms, setPlatforms] = useState<AgentPlatform[]>([]);
  const availablePlatforms = [
    {
      name: "Twitter",
      type: "twitter",
      icon: Twitter,
      description: "A social media platform for sharing short messages and updates.",
    },
    {
      name: "Discord",
      type: "discord",
      icon: MessageSquare,
      description: "A chat platform for communities and teams.",
    },
    {
      name: "Telegram",
      type: "telegram",
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
                  <div className="bg-muted rounded-lg p-2">{platform.type === "twitter" && <Twitter className="h-6 w-6" />}</div>
                  <div>
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-muted-foreground text-sm">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Switch checked={platform.enabled} />
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
                  .filter((p) => !platforms.find((existing) => existing.type === p.type))
                  .map((platform) => (
                    <Card key={platform.type} className="hover:bg-muted/50 cursor-pointer p-4">
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
};

export default PlatformStep;
