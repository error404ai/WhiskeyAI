"use client";

import NoSsr from "@/components/NoSsr/NoSsr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyable-text";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SOCIAL_CONFIG } from "@/server/config";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import AgentCreate from "./AgentCreate";
import PaymentDialog from "./PaymentDialog";

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

  // Calculate agent counts
  const totalAgents = agents?.length || 0;
  const runningAgents = agents?.filter(agent => agent.status === "running").length || 0;
  const pausedAgents = agents?.filter(agent => agent.status === "paused").length || 0;

  // Group agents by status
  const groupedAgents = {
    running: agents?.filter(agent => agent.status === "running") || [],
    paused: agents?.filter(agent => agent.status === "paused") || []
  };

  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [agentToDelete, setAgentToDelete] = useState<{ id: number; name: string } | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingAgentUuid, setPendingAgentUuid] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showBatchConfirmDialog, setShowBatchConfirmDialog] = useState(false);
  const [batchAction, setBatchAction] = useState<"run" | "pause">("run");

  const handleDeleteAgent = async (agentId: number) => {
    if (!agentId) return;
    await AgentController.deleteAgent(agentId);
    setAgentToDelete(null);
    refetch();
  };

  const handleToggleAgentStatus = async (agentUuid: string) => {
    // Only validate when attempting to set status to active
    const agent = agents?.find((a) => a.uuid === agentUuid);
    if (agent && agent.status === "paused") {
      // Check if user has paid
      const hasPaid = await AgentController.hasUserPaidForAgents();
      if (!hasPaid) {
        setPendingAgentUuid(agentUuid);
        setShowPaymentDialog(true);
        return;
      }

      // Validate agent readiness
      const validationResult = await AgentController.validateAgentReadiness(agentUuid);

      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        setPendingAgentUuid(agentUuid);
        setShowValidationErrorModal(true);
        return;
      }
    }

    const success = await AgentController.toggleAgentStatus(agentUuid);
    if (success) {
      refetch();
    }
  };

  const handlePaymentSuccess = async () => {
    if (pendingAgentUuid) {
      await handleToggleAgentStatus(pendingAgentUuid);
      setPendingAgentUuid(null);
    }
  };

  const toggleSelectAgent = (agentUuid: string) => {
    setSelectedAgents((prev) => (prev.includes(agentUuid) ? prev.filter((uuid) => uuid !== agentUuid) : [...prev, agentUuid]));
  };

  const selectAllAgents = () => {
    if (agents && agents.length > 0) {
      if (selectedAgents.length === agents.length) {
        // Deselect all if all are selected
        setSelectedAgents([]);
      } else {
        // Select all
        setSelectedAgents(agents.map((agent) => agent.uuid));
      }
    }
  };

  const handleBatchStatusChange = async (action: "run" | "pause") => {
    setBatchAction(action);
    setShowBatchConfirmDialog(true);
  };

  const executeBatchStatusChange = async () => {
    if (selectedAgents.length === 0) return;

    setIsBatchProcessing(true);

    if (batchAction === "run") {
      // For running, we need to verify payment and validation for all agents
      const hasPaid = await AgentController.hasUserPaidForAgents();
      if (!hasPaid) {
        setShowBatchConfirmDialog(false);
        setShowPaymentDialog(true);
        setIsBatchProcessing(false);
        return;
      }

      // Validate all selected agents that are currently paused
      const pausedAgents = selectedAgents.filter((uuid) => agents?.find((a) => a.uuid === uuid)?.status === "paused");

      for (const agentUuid of pausedAgents) {
        const validationResult = await AgentController.validateAgentReadiness(agentUuid);
        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors);
          setPendingAgentUuid(agentUuid);
          setShowBatchConfirmDialog(false);
          setShowValidationErrorModal(true);
          setIsBatchProcessing(false);
          return;
        }
      }
    }

    // Process all agents
    await Promise.all(
      selectedAgents.map(async (agentUuid) => {
        const agent = agents?.find((a) => a.uuid === agentUuid);
        // Only toggle if current status doesn't match desired status
        if ((batchAction === "run" && agent?.status === "paused") || (batchAction === "pause" && agent?.status === "running")) {
          return await AgentController.toggleAgentStatus(agentUuid);
        }
        return true;
      }),
    );

    setIsBatchProcessing(false);
    setShowBatchConfirmDialog(false);
    setSelectedAgents([]);
    refetch();
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

        {!isPending && !isFetching && agents && agents.length > 0 && (
          <>
            <div className="bg-muted/20 flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllAgents} className="h-8 text-xs">
                  {selectedAgents.length === agents.length ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-muted-foreground text-xs">
                  {selectedAgents.length} of {agents.length} agents selected
                </span>
              </div>
              {selectedAgents.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="default" size="sm" className="h-8 bg-green-600 text-xs hover:bg-green-700" onClick={() => handleBatchStatusChange("run")} disabled={isBatchProcessing}>
                    Run Selected
                  </Button>
                  <Button variant="default" size="sm" className="h-8 bg-amber-600 text-xs hover:bg-amber-700" onClick={() => handleBatchStatusChange("pause")} disabled={isBatchProcessing}>
                    Pause Selected
                  </Button>
                </div>
              )}
            </div>

            {/* Agent Counts Summary */}
            <div className="flex items-center justify-between bg-black/5 rounded-lg border p-6">
              <div className="flex w-full justify-around gap-6">
                <div className="group flex w-full flex-col items-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 px-6 py-4 text-center shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="mb-2 rounded-full bg-blue-100 p-2 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-700">Total Agents</span>
                  <p className="mt-1 text-3xl font-bold text-blue-700">{totalAgents}</p>
                </div>
                
                <div className="group flex w-full flex-col items-center rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/20 px-6 py-4 text-center shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="mb-2 rounded-full bg-green-100 p-2 text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700">Running</span>
                  <p className="mt-1 text-3xl font-bold text-green-700">{runningAgents}</p>
                </div>
                
                <div className="group flex w-full flex-col items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/20 px-6 py-4 text-center shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="mb-2 rounded-full bg-amber-100 p-2 text-amber-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 9v6l5 -3z"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-amber-700">Paused</span>
                  <p className="mt-1 text-3xl font-bold text-amber-700">{pausedAgents}</p>
                </div>
              </div>
            </div>
          </>
        )}

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
            <>
              {/* Running Agents Section */}
              {groupedAgents.running.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-green-500">Running Agents ({runningAgents})</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {groupedAgents.running.map((agent) => (
                      <Card key={agent.id} className={`p-6 ${selectedAgents.includes(agent.uuid) ? "ring-primary ring-2" : ""}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div onClick={() => toggleSelectAgent(agent.uuid)} className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border ${selectedAgents.includes(agent.uuid) ? "bg-primary border-primary" : "border-gray-400"}`}>
                                {selectedAgents.includes(agent.uuid) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <h2 className="text-lg font-semibold">{agent.name}</h2>
                            </div>
                            <p className="text-muted-foreground text-sm">${agent.tickerSymbol}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch id={`agent-status-${agent.id}`} checked={agent.status === "running"} onCheckedChange={() => handleToggleAgentStatus(agent.uuid)} />
                              <Label htmlFor={`agent-status-${agent.id}`} className="text-xs">
                                {agent.status === "running" ? "Running" : "Paused"}
                              </Label>
                            </div>
                            <Button onClick={() => setAgentToDelete({ id: agent.id, name: agent.name })} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete agent</span>
                            </Button>
                          </div>
                        </div>

                        {agent.tokenAddress && (
                          <div className="mt-4 mb-2">
                            <div className="flex flex-col gap-2 text-sm">
                              <CopyableText text={agent.tokenAddress} label="Token Address" className="text-xs" successMessage="Token address copied to clipboard!" />
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-medium">Pump.fun</span>
                                <a href={`${SOCIAL_CONFIG.PUMP_FUN_COIN_URL}${agent.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="hover:bg-primary/90 hover:text-primary-foreground inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors">
                                  <ExternalLink className="h-3 w-3" />
                                  Open
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 mb-2">
                          <Button variant="outline" className="w-full" link={`/my-agent/${agent.uuid}`}>
                            Configure
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Paused Agents Section */}
              {groupedAgents.paused.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-amber-500">Paused Agents ({pausedAgents})</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {groupedAgents.paused.map((agent) => (
                      <Card key={agent.id} className={`p-6 opacity-75 ${selectedAgents.includes(agent.uuid) ? "ring-primary ring-2" : ""}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div onClick={() => toggleSelectAgent(agent.uuid)} className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border ${selectedAgents.includes(agent.uuid) ? "bg-primary border-primary" : "border-gray-400"}`}>
                                {selectedAgents.includes(agent.uuid) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <h2 className="text-lg font-semibold">{agent.name}</h2>
                            </div>
                            <p className="text-muted-foreground text-sm">${agent.tickerSymbol}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch id={`agent-status-${agent.id}`} checked={agent.status === "running"} onCheckedChange={() => handleToggleAgentStatus(agent.uuid)} />
                              <Label htmlFor={`agent-status-${agent.id}`} className="text-xs">
                                {agent.status === "running" ? "Running" : "Paused"}
                              </Label>
                            </div>
                            <Button onClick={() => setAgentToDelete({ id: agent.id, name: agent.name })} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete agent</span>
                            </Button>
                          </div>
                        </div>

                        {agent.tokenAddress && (
                          <div className="mt-4 mb-2">
                            <div className="flex flex-col gap-2 text-sm">
                              <CopyableText text={agent.tokenAddress} label="Token Address" className="text-xs" successMessage="Token address copied to clipboard!" />
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-medium">Pump.fun</span>
                                <a href={`${SOCIAL_CONFIG.PUMP_FUN_COIN_URL}${agent.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="hover:bg-primary/90 hover:text-primary-foreground inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors">
                                  <ExternalLink className="h-3 w-3" />
                                  Open
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 mb-2">
                          <Button variant="outline" className="w-full" link={`/my-agent/${agent.uuid}`}>
                            Configure
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No agents message */}
              {agents?.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No agents found. Create your first agent to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} onPaymentSuccess={handlePaymentSuccess} title="Activate Your Agent" description="A one-time payment is required to activate your agent. After payment, you can activate up to 50 agents." />

      {/* Validation Error Modal */}
      <Dialog open={showValidationErrorModal} onOpenChange={setShowValidationErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Cannot Activate Agent
            </DialogTitle>
            <DialogDescription className="pt-2 text-center">Please resolve the following issues before activating:</DialogDescription>
          </DialogHeader>

          <div className="my-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
            <ul className="list-disc space-y-2 pl-5 text-amber-800">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>

          <DialogFooter className="flex justify-end">
            <Button onClick={() => setShowValidationErrorModal(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAgentToDelete(null)}>
              Cancel
            </Button>
            {agentToDelete && (
              <Button variant="destructive" onClick={() => handleDeleteAgent(agentToDelete.id)}>
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Status Change Confirmation Dialog */}
      <Dialog open={showBatchConfirmDialog} onOpenChange={setShowBatchConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{batchAction === "run" ? "Run Multiple Agents" : "Pause Multiple Agents"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {batchAction === "run" ? "run" : "pause"} {selectedAgents.length} selected agents?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBatchConfirmDialog(false)} disabled={isBatchProcessing}>
              Cancel
            </Button>
            <Button variant={batchAction === "run" ? "default" : "secondary"} onClick={executeBatchStatusChange} disabled={isBatchProcessing} className={batchAction === "run" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}>
              {isBatchProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : batchAction === "run" ? (
                "Run Agents"
              ) : (
                "Pause Agents"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NoSsr>
  );
}
