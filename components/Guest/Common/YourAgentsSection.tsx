"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: "active" | "paused";
  buildId: string;
}

export default function YourAgentsSection() {
  const [agents] = useState<Agent[]>([
    {
      id: "1",
      name: "Testing",
      status: "paused",
      buildId: "BUILD",
    },
  ]);

  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Your AI <span className="from-primary to-primary/50 bg-gradient-to-r bg-clip-text text-transparent"> Agents</span>
          </h1>
          <p className="text-muted-foreground">Everything you need to know about our AI agents</p>
          <p className="text-muted-foreground">Manage and configure your AI agents</p>
        </div>

        {/* Actions */}
        <div className="flex items-start justify-between">
          <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>
            Show API Key
          </Button>

          <div className="flex gap-4">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Agent
            </Button>
          </div>
        </div>

        {/* Agents List */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{agent.name}</h2>
                  </div>
                  <p className="text-muted-foreground text-sm">${agent.buildId}</p>
                </div>
                <div className="flex">
                  <Badge variant="secondary" className="text-xs">
                    {agent.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete agent</span>
                  </Button>
                </div>
              </div>
              <div className="mt-12 mb-2">
                <Button variant="outline" className="w-full">
                  Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
