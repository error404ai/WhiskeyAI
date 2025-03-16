"use client";

import NoSsr from "@/components/NoSsr/NoSsr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
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

  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentAgentUuid, setCurrentAgentUuid] = useState<string | null>(null);

  const handleDeleteAgent = async (agentId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this agent?");
    if (confirmDelete) {
      await AgentController.deleteAgent(agentId);
      refetch();
    }
  };

  // const handleDeleteAgent = async (agentId: number) => {
  //   await AgentController.deleteAgent(agentId);
  //   refetch();
  // };

  const handleToggleAgentStatus = async (agentUuid: string) => {
    // Only validate when attempting to set status to active
    const agent = agents?.find(a => a.uuid === agentUuid);
    if (agent && agent.status === "paused") {
      // Validate agent readiness
      const validationResult = await AgentController.validateAgentReadiness(agentUuid);

      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        setCurrentAgentUuid(agentUuid);
        setShowValidationErrorModal(true);
        return;
      }
    }

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

      {/* Validation Error Modal */}
      <Dialog open={showValidationErrorModal} onOpenChange={setShowValidationErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Cannot Activate Agent
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please resolve the following issues before activating:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg my-4">
            <ul className="list-disc pl-5 space-y-2 text-amber-800">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              onClick={() => setShowValidationErrorModal(false)}
              variant="outline"
            >
              Close
            </Button>
            {currentAgentUuid && (
              <Button
                variant="default"
                onClick={() => {
                  setShowValidationErrorModal(false);
                  window.location.href = `/my-agent/${currentAgentUuid}`;
                }}
              >
                Configure Agent
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NoSsr>
  );
}
