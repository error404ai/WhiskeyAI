"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserX, Loader2 } from "lucide-react"
import { Agent } from "./types"

interface AgentSelectorProps {
    agents: Agent[]
    isAgentsLoading: boolean
    agentRangeStart: number
    agentRangeEnd: number
    setAgentRangeStart: (value: number) => void
    setAgentRangeEnd: (value: number) => void
    applyAgentRange: () => void
}

export default function AgentSelector({
    agents,
    isAgentsLoading,
    agentRangeStart,
    agentRangeEnd,
    setAgentRangeStart,
    setAgentRangeEnd,
    applyAgentRange
}: AgentSelectorProps) {
    'use no memo'
    return (
        <Card className="shadow-md border-[1px] border-blue-100 hover:border-blue-200 transition-all h-full">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pb-2">
                <CardTitle className="text-lg font-semibold">Agent Selection</CardTitle>
                <CardDescription>Choose which agents will post</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {isAgentsLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-blue-200 rounded-md bg-blue-50/50">
                        <UserX className="h-8 w-8 mx-auto text-blue-300 mb-2" />
                        <h3 className="text-sm font-medium text-gray-700">No Agents Available</h3>
                        <p className="text-xs text-gray-500 mt-1">Please create agents first to schedule posts.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Agent Range</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={agents.length}
                                    value={agentRangeStart}
                                    onChange={(e) => setAgentRangeStart(Number(e.target.value) || 1)}
                                    className="w-16 h-8 text-center border-blue-200 focus:border-blue-400"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                    type="number"
                                    min={agentRangeStart}
                                    max={agents.length}
                                    value={agentRangeEnd}
                                    onChange={(e) => setAgentRangeEnd(Number(e.target.value) || agentRangeStart)}
                                    className="w-16 h-8 text-center border-blue-200 focus:border-blue-400"
                                />
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    className="ml-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={applyAgentRange}
                                >
                                    Apply
                                </Button>
                            </div>
                            <p className="text-xs text-blue-500 mt-1">
                                Using {agentRangeEnd - agentRangeStart + 1} of {agents.length} available agents
                            </p>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 pb-1">
                            {agents.map((agent, index) => {
                                const isActive = index + 1 >= agentRangeStart && index + 1 <= agentRangeEnd;
                                return (
                                    <div
                                        key={agent.uuid}
                                        className={`p-2 rounded-md flex items-center border ${
                                            isActive 
                                                ? "bg-blue-50 border-blue-200"
                                                : "bg-gray-50 border-gray-200 opacity-50"
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-500"}`}>
                                                #{index + 1} - {agent.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {agent.status === "running" ? (
                                                    <span className="text-green-600 flex items-center">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 flex items-center">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block mr-1"></span>
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
    )
} 