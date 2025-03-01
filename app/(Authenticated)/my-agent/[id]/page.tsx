"use client";

import { Card } from "@/components/ui/card";
import { Info, Rocket, Share2, Wrench, Zap } from "lucide-react";
import { useState } from "react";
import FunctionsStep from "./_partials/FunctionsStep";
import InformationStep from "./_partials/InformationStep";
import LaunchStep from "./_partials/LaunchStep";
import PlatformStep from "./_partials/PlatformStep";
import TriggersStep from "./_partials/TriggersStep";

export default function AgentConfigPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const configSteps = [
    {
      icon: Info,
      title: "Information",
      description: "Define agent personality, goals, and news",
      active: currentStep === 0,
    },
    {
      icon: Share2,
      title: "Platform Configuration",
      description: "Configure your platform settings",
      active: currentStep === 1,
    },
    {
      icon: Zap,
      title: "Configure Triggers",
      description: "Set up custom triggers",
      active: currentStep === 2,
    },
    {
      icon: Wrench,
      title: "Configure Functions",
      description: "Set up custom functions for your agent",
      active: currentStep === 3,
    },
    {
      icon: Rocket,
      title: "Finalize & Launch",
      description: "Deploy your agent",
      active: currentStep === 4,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <InformationStep />;
      case 1:
        return <PlatformStep />;
      case 2:
        return <TriggersStep />;
      case 3:
        return <FunctionsStep />;
      case 4:
        return <LaunchStep />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                Testing <span className="text-muted-foreground text-sm">$BUILD</span>
              </h1>
            </div>
          </div>

          {/* Configuration Steps */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Agent Definition Prompts</h2>
            <p className="text-muted-foreground mb-4 text-sm">Configure your agent&apos;s behavior and capabilities</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {configSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} onClick={() => setCurrentStep(index)} className={`cursor-pointer p-4 transition-colors ${step.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
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

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}
