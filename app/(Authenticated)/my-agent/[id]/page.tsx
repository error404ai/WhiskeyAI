/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import NoSsr from "@/components/NoSsr/NoSsr";
import { Card } from "@/components/ui/card";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { Info, Rocket, Share2, Wrench, Zap } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import FunctionsStep from "./_partials/FunctionsStep";
import InformationStep from "./_partials/InformationStep";
import LaunchStep from "./_partials/LaunchStep/LaunchStep";
import PlatformStep from "./_partials/PlatformStep";
import TriggersStep from "./_partials/TriggersStep";

export default function AgentConfigPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const agentUuid = params.id as string;

  const {
    isPending,
    isRefetching,
    data: agent,
    refetch,
  } = useQuery({
    queryKey: ["getAgentTriggers"],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
  });

  const configSteps = [
    {
      icon: Info,
      title: "Information",
      description: "Define agent personality, goals, and news",
      key: "information",
    },
    {
      icon: Share2,
      title: "Platform Configuration",
      description: "Configure your platform settings",
      key: "platform",
    },
    {
      icon: Zap,
      title: "Configure Triggers",
      description: "Set up custom triggers",
      key: "triggers",
    },
    {
      icon: Wrench,
      title: "Configure Functions",
      description: "Set up custom functions for your agent",
      key: "functions",
    },
    {
      icon: Rocket,
      title: "Finalize & Launch",
      description: "Deploy your agent",
      key: "launch",
    },
  ];

  const defaultTabKey = "information";
  const [currentTabKey, setCurrentTabKey] = useState(searchParams.get("tab") || defaultTabKey);

  const handleTabChange = useCallback(
    (key: string) => {
      if (key !== currentTabKey) {
        // Use replaceState to avoid adding history entries
        const params = new URLSearchParams(searchParams);
        params.set("tab", key);
        window.history.replaceState(null, "", `?${params.toString()}`);

        setCurrentTabKey(key);
      }
    },
    [currentTabKey, searchParams],
  );

  useEffect(() => {
    const isValidTabKey = (key: string) => {
      return configSteps.some((step) => step.key === key);
    };
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && isValidTabKey(tabFromUrl)) {
      setCurrentTabKey(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const renderStepContent = () => {
    switch (currentTabKey) {
      case "information":
        return <InformationStep />;
      case "platform":
        return <PlatformStep />;
      case "triggers":
        return <TriggersStep />;
      case "functions":
        return <FunctionsStep />;
      case "launch":
        return <LaunchStep />;
      default:
        return <InformationStep />;
    }
  };

  return (
    <NoSsr>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {agent?.name} <span className="text-muted-foreground text-sm">{agent?.tickerSymbol}</span>
                </h1>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">Agent Definition Prompts</h2>
              <p className="text-muted-foreground mb-4 text-sm">Configure your agent&apos;s behavior and capabilities</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {configSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.key === currentTabKey;

                  return (
                    <Card key={step.key} onClick={() => handleTabChange(step.key)} className={`cursor-pointer p-4 transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
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

          {renderStepContent()}
        </div>
      </div>
    </NoSsr>
  );
}
