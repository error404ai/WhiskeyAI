"use client";

import NoSsr from "@/components/NoSsr/NoSsr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Skeleton from "react-loading-skeleton";
import AgentCreate from "./AgentCreate";

export default function YourAgentsSection() {
  const {
    isPending,
    isFetching,
    data: agents,
    refetch,
  } = useQuery({
    queryKey: ["getAgents"],
    queryFn: AgentController.getAgents,
  });

  const handleDeleteAgent = async (agentId: number) => {
    await AgentController.deleteAgent(agentId);
    refetch();
  };

  const handleToggleAgentStatus = async (agentUuid: string) => {
    const success = await AgentController.toggleAgentStatus(agentUuid);
    if (success) {
      refetch();
    }
  };

  const { data: session } = useSession();
  console.log("session is", session);
  return (
    <NoSsr>
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
            <div className="flex gap-4">
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>

              <AgentCreate refetch={refetch} />
            </div>
          </div>

          {/* Agents List */}

          {(isPending || isFetching) && <Skeleton count={2} height={200} />}

          {!isPending && !isFetching && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {agents?.map((agent) => (
                <Card key={agent.id} className={`p-6 ${agent.status === 'paused' ? 'opacity-75' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{agent.name}</h2>
                      </div>
                      <p className="text-muted-foreground text-sm">${agent.tickerSymbol}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`agent-status-${agent.id}`}
                          checked={agent.status === 'running'}
                          onCheckedChange={() => handleToggleAgentStatus(agent.uuid)}
                        />
                        <Label htmlFor={`agent-status-${agent.id}`} className="text-xs">
                          {agent.status === 'running' ? 'Running' : 'Paused'}
                        </Label>
                      </div>
                      <Button onClick={() => handleDeleteAgent(agent.id)} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete agent</span>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-12 mb-2">
                    <Button variant="outline" className="w-full" link={`/my-agent/${agent.uuid}`}>
                      Configure
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </NoSsr>
  );
}
