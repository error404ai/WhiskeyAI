"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as SettingsController from "@/server/controllers/admin/SettingsController";
import { MaxAgentsInput, maxAgentsSchema } from "@/server/zodSchema/maxAgentsSchema";
import { AlertCircle, CheckCircle, Users } from "lucide-react";

type MaxAgentsPanelProps = {
  settings: {
    default_max_agents_per_user: string;
  };
  onUpdate: () => void;
};

export function MaxAgentsPanel({ settings, onUpdate }: MaxAgentsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with the current max agents value
  const methods = useForm<MaxAgentsInput>({
    resolver: zodResolver(maxAgentsSchema),
    defaultValues: {
      value: settings.default_max_agents_per_user,
    },
  });

  // Update max agents value
  const onUpdateMaxAgents = async (data: MaxAgentsInput) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await SettingsController.updateDefaultMaxAgentsPerUser(data.value.toString());

      if (response.success) {
        setSuccess("Default max agents per user updated successfully.");
        onUpdate();
      } else {
        setError(response.error || "Failed to update max agents value.");
      }
    } catch (err) {
      setError(`Unexpected error: ${(err as Error).message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          <CardTitle>Agent Limits</CardTitle>
        </div>
        <CardDescription>Configure the default maximum number of agents allowed per user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onUpdateMaxAgents)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Max Agents Per User</label>
              <div className="flex items-center space-x-2">
                <Input name="value" type="number" step="1" placeholder="50" className="max-w-[200px]" disabled={isUpdating} />
                <span className="text-sm font-medium">agents</span>
              </div>

              <p className="text-muted-foreground text-xs">Maximum number of agents a user can create without special permissions. This value will be applied to new users.</p>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Max Agents Limit"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
