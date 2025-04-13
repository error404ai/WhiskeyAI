"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, UserX } from "lucide-react";
import { Agent } from "./types";

interface AgentSelectorProps {
  agents: Agent[];
  isAgentsLoading: boolean;
  agentRangeStart: number;
  agentRangeEnd: number;
  setAgentRangeStart: (value: number) => void;
  setAgentRangeEnd: (value: number) => void;
  applyAgentRange: () => void;
}

export default function AgentSelector({ agents, isAgentsLoading, agentRangeStart, agentRangeEnd, setAgentRangeStart, setAgentRangeEnd, applyAgentRange }: AgentSelectorProps) {
  "use no memo";
  return (
    <Card className="h-full border-[1px] border-blue-100 shadow-md transition-all hover:border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pb-2">
        <CardTitle className="text-lg font-semibold">Agent Selection</CardTitle>
        <CardDescription>Choose which agents will post</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isAgentsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/50 p-4 text-center">
            <UserX className="mx-auto mb-2 h-8 w-8 text-blue-300" />
            <h3 className="text-sm font-medium text-gray-700">No Agents Available</h3>
            <p className="mt-1 text-xs text-gray-500">Please create agents first to schedule posts.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-500">Agent Range</p>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={agents.length} value={agentRangeStart} onChange={(e) => setAgentRangeStart(Number(e.target.value) || 1)} className="h-8 w-16 border-blue-200 text-center focus:border-blue-400" />
                <span className="text-muted-foreground">to</span>
                <Input type="number" min={agentRangeStart} max={agents.length} value={agentRangeEnd} onChange={(e) => setAgentRangeEnd(Number(e.target.value) || agentRangeStart)} className="h-8 w-16 border-blue-200 text-center focus:border-blue-400" />
                <Button type="button" size="sm" className="ml-1 bg-blue-600 hover:bg-blue-700" onClick={applyAgentRange}>
                  Apply
                </Button>
              </div>
              <p className="mt-1 text-xs text-blue-500">
                Using {agentRangeEnd - agentRangeStart + 1} of {agents.length} available agents
              </p>
            </div>

            <div className="h-full space-y-2 overflow-y-auto pr-1 pb-1">
              {agents.map((agent, index) => {
                const isActive = index + 1 >= agentRangeStart && index + 1 <= agentRangeEnd;
                return (
                  <div key={agent.uuid} className={`flex items-center rounded-md border p-2 ${isActive ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-50"}`}>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-500"}`}>
                        #{index + 1} - {agent.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {agent.status === "running" ? (
                          <span className="flex items-center text-green-600">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Paused
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
