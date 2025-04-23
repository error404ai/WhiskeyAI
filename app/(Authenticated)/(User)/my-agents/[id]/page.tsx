"use client";

import NoSsr from "@/components/NoSsr/NoSsr";
import { Card } from "@/components/ui/card";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { Info, Rocket, Share2, Wrench, Zap } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FunctionsStep from "./_partials/FunctionsStep";
import InformationStep from "./_partials/InformationStep";
import LaunchStep from "./_partials/LaunchStep/LaunchStep";
import PlatformStep from "./_partials/PlatformStep";
import TriggersStep from "./_partials/TriggersStep";

export default function AgentConfigPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const agentUuid = params.id as string;

  const { data: agent } = useQuery({
    queryKey: ["getAgentByUuid"],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
    refetchOnWindowFocus: false,
  });

  const configSteps = [
    {
      icon: Info,
      title: "Information",
      description: "Define agent personality, goals, and news",
      key: "information",
      color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800",
      activeColor: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      hoverColor: "hover:from-blue-200 hover:to-blue-300",
      borderColor: "border-blue-300",
      activeBorderColor: "border-blue-600",
      iconBgColor: "bg-blue-100",
      activeIconBgColor: "bg-blue-400/30",
    },
    {
      icon: Share2,
      title: "Platform Configuration",
      description: "Configure your platform settings",
      key: "platform",
      color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800",
      activeColor: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      hoverColor: "hover:from-purple-200 hover:to-purple-300",
      borderColor: "border-purple-300",
      activeBorderColor: "border-purple-600",
      iconBgColor: "bg-purple-100",
      activeIconBgColor: "bg-purple-400/30",
    },
    {
      icon: Zap,
      title: "Configure Triggers",
      description: "Set up custom triggers",
      key: "triggers",
      color: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800",
      activeColor: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
      hoverColor: "hover:from-amber-200 hover:to-amber-300",
      borderColor: "border-amber-300",
      activeBorderColor: "border-amber-600",
      iconBgColor: "bg-amber-100",
      activeIconBgColor: "bg-amber-400/30",
    },
    {
      icon: Wrench,
      title: "Configure Functions",
      description: "Set up custom functions for your agent",
      key: "functions",
      color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800",
      activeColor: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
      hoverColor: "hover:from-emerald-200 hover:to-emerald-300",
      borderColor: "border-emerald-300",
      activeBorderColor: "border-emerald-600",
      iconBgColor: "bg-emerald-100",
      activeIconBgColor: "bg-emerald-400/30",
    },
    {
      icon: Rocket,
      title: "Finalize & Launch",
      description: "Deploy your agent",
      key: "launch",
      color: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800",
      // Changed from rose-500/700 to a softer rose-400/500 for active state
      activeColor: "bg-gradient-to-br from-rose-400 to-rose-500 text-white",
      hoverColor: "hover:from-rose-200 hover:to-rose-300",
      borderColor: "border-rose-300",
      activeBorderColor: "border-rose-500",
      iconBgColor: "bg-rose-100",
      activeIconBgColor: "bg-rose-300/40",
    },
  ];

  const defaultTabKey = "information";
  const [currentTabKey, setCurrentTabKey] = useState(searchParams.get("tab") || defaultTabKey);

  const handleTabChange = async (key: string) => {
    if (key !== currentTabKey) {
      setCurrentTabKey(key);
      // Use replaceState to avoid adding history entries
      const params = new URLSearchParams(searchParams);
      params.set("tab", key);
      window.history.replaceState(null, "", `?${params.toString()}`);
    }
  };

  useEffect(() => {
    const isValidTabKey = (key: string) => {
      return configSteps.some((step) => step.key === key);
    };
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && isValidTabKey(tabFromUrl)) {
      setCurrentTabKey(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                    <Card key={step.key} onClick={() => handleTabChange(step.key)} className={`cursor-pointer overflow-hidden rounded-lg border-l-4 p-5 transition-all duration-300 ${isActive ? step.activeBorderColor : step.borderColor} ${isActive ? `${step.activeColor} shadow-lg` : `${step.color} ${step.hoverColor} hover:shadow-md`} transform hover:translate-y-[-2px]`}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className={`rounded-full p-2 ${isActive ? step.activeIconBgColor : step.iconBgColor}`}>
                            <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                          </div>
                          <h3 className="text-lg font-medium">{step.title}</h3>
                        </div>
                        <p className="ml-11 text-sm opacity-90">{step.description}</p>
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
