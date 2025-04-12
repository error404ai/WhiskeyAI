"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
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
    return (
        <Card className="h-full shadow-sm">
            <CardContent className="p-2">
                <h2 className="text-base font-semibold mb-3">Agents</h2>

                {isAgentsLoading ? (
                    Array(5)
                        .fill(0)
                        .map((_, i) => <div key={i} className="p-2 rounded-md bg-gray-100 animate-pulse h-6 mb-2"></div>)
                ) : agents && agents.length > 0 ? (
                    <>
                        {/* Agent Range Selector - Only show if agents exist */}
                        <div className="mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="agentRangeStart" className="text-sm mb-1 block">
                                        Start:
                                    </Label>
                                    <Input
                                        id="agentRangeStart"
                                        type="number"
                                        className="h-9"
                                        min="1"
                                        max={agents.length}
                                        value={agentRangeStart}
                                        onChange={(e) => {
                                            const value = Number.parseInt(e.target.value) || 1
                                            setAgentRangeStart(Math.min(value, agentRangeEnd))
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="agentRangeEnd" className="text-sm mb-1 block">
                                        End:
                                    </Label>
                                    <Input
                                        id="agentRangeEnd"
                                        type="number"
                                        className="h-9"
                                        min={agentRangeStart}
                                        max={agents.length}
                                        value={agentRangeEnd}
                                        onChange={(e) => {
                                            const value = Number.parseInt(e.target.value) || agentRangeStart
                                            setAgentRangeEnd(Math.max(value, agentRangeStart))
                                        }}
                                    />
                                </div>
                            </div>

                            <Button
                                type="button"
                                className="w-full bg-black hover:bg-gray-800 text-white"
                                onClick={applyAgentRange}
                            >
                                Apply Range
                            </Button>
                        </div>

                        {/* Agents List */}
                        <div className="space-y-2">
                            {agents.map((agent, index) => (
                                <div
                                    key={agent.uuid}
                                    className={`p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                        index + 1 < agentRangeStart || index + 1 > agentRangeEnd ? "opacity-50" : ""
                                    }`}
                                >
                                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                    <p className="font-medium text-sm">{agent.name}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-4 text-center space-y-3">
                        <p className="text-muted-foreground text-sm">No agents created.</p>
                        <Button className="w-full bg-black hover:bg-gray-800 text-white hover:text-white" link="/my-agent">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create agent
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 