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
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import AgentCreate from "./AgentCreate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [agentToDelete, setAgentToDelete] = useState<{ id: number; name: string } | null>(null);

  const handleDeleteAgent = async (agentId: number) => {
    await AgentController.deleteAgent(agentId);
    setAgentToDelete(null);
    refetch();
  };

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

  return (
    <NoSsr>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Agents</h1>
            <p className="text-muted-foreground text-sm">Create and manage your AI agents</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <AgentCreate refetch={refetch} />
          </div>
        </div>

        <div>
          {(isPending || isFetching) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Skeleton height={24} width={120} />
                      <Skeleton height={20} width={80} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton height={24} width={24} />
                      <Skeleton height={24} width={24} />
                    </div>
                  </div>
                  <div className="mt-12 mb-2">
                    <Skeleton height={36} />
                  </div>
                </Card>
              ))}
            </div>
          )}

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
                      <Button 
                        onClick={() => setAgentToDelete({ id: agent.id, name: agent.name })} 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-foreground"
                      >
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

      {/* Delete Agent Confirmation Dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
