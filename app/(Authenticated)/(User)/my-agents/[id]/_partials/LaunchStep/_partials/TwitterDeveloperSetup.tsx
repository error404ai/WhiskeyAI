"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { twitterCredentialsSchema } from "@/server/zodSchema/twitterCredentialsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, InfoIcon, LinkIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function TwitterDeveloperSetup() {
  "use no memo";

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const agentUuid = useParams().id as string;

  const { data: agent, refetch } = useQuery({
    queryKey: ["getAgentByUuid", agentUuid],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
    enabled: !!agentUuid,
    refetchOnWindowFocus: false,
  });

  const methods = useForm<z.infer<typeof twitterCredentialsSchema>>({
    mode: "onTouched",
    resolver: zodResolver(twitterCredentialsSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof twitterCredentialsSchema>) => {
    try {
      await AgentController.updateAgentTwitterCredentials(agentUuid, data);
      await refetch();
      toast.success("Twitter credentials saved successfully");
      setTimeout(() => {
        methods.reset({}, { keepValues: true, keepIsSubmitSuccessful: false });
      }, 2000);
    } catch (error) {
      toast.error("Failed to save credentials");
      console.error(error);
    }
  };

  // Mask sensitive data
  const maskText = (text: string) => {
    if (!text) return "";
    return text.length > 8 ? `${text.substring(0, 4)}${"•".repeat(text.length - 8)}${text.substring(text.length - 4)}` : "•".repeat(text.length);
  };

  // Construct the callback URL with the actual agent UUID
  const callbackUrl = `https://thewhiskey.io/api/socialite/twitter`;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-base font-medium">Setup Twitter Developer</Label>
        <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                Tutorial
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>How to get Twitter Developer Credentials</DialogTitle>
              <DialogDescription>Follow this tutorial to set up your Twitter Developer account and get your Client ID and Client Secret.</DialogDescription>
            </DialogHeader>
            <div className="bg-muted aspect-video overflow-hidden rounded-md">
              <div className="flex h-full w-full items-center justify-center">
                <iframe className="h-full w-full" src="https://www.youtube.com/embed/0gZQJWuL3Fk" title="Twitter Developer Setup Tutorial" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <h3 className="font-medium">Quick Steps:</h3>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Go to{" "}
                  <a href="https://developer.twitter.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    developer.twitter.com
                  </a>
                </li>
                <li>Sign in and create a new project</li>
                <li>Create an app within your project</li>
                <li>Navigate to the &quot;Keys and Tokens&quot; tab</li>
                <li>Copy your Client ID and Client Secret</li>
                <li>Paste them in the form below</li>
              </ol>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display saved credentials if they exist */}
      {(agent?.twitterClientId || agent?.twitterClientSecret) && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
          <h4 className="mb-3 font-medium">Current Credentials</h4>

          {agent?.twitterClientId && (
            <div className="mb-3 flex items-center justify-between rounded-md border bg-white px-3 py-1 dark:bg-gray-800">
              <div>
                <Label className="text-xs text-gray-500">Client ID</Label>
                <div className="font-mono text-sm">{showClientId ? agent.twitterClientId : maskText(agent.twitterClientId)}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowClientId(!showClientId)} aria-label={showClientId ? "Hide Client ID" : "Show Client ID"}>
                {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {agent?.twitterClientSecret && (
            <div className="flex items-center justify-between rounded-md border bg-white p-3 dark:bg-gray-800">
              <div>
                <Label className="text-xs text-gray-500">Client Secret</Label>
                <div className="font-mono text-sm">{showClientSecret ? agent.twitterClientSecret : maskText(agent.twitterClientSecret)}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowClientSecret(!showClientSecret)} aria-label={showClientSecret ? "Hide Client Secret" : "Show Client Secret"}>
                {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 dark:bg-blue-900">
            <LinkIcon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-200">Callback URL Configuration</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">When setting up your Twitter App, use the callback URL below in your Twitter Developer Portal.</p>
            <CopyableText text={callbackUrl} className="mt-2" successMessage="Callback URL copied to clipboard!" />
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input name="clientId" label="Client ID" placeholder="Enter Client ID" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Input name="clientSecret" label="Client Secret" type="text" placeholder="Enter Client Secret" autoComplete="off" />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit" loading={methods.formState.isSubmitting}>
              Save Credentials
            </Button>
            {methods.formState.isSubmitSuccessful && (
              <Badge className="py-2" variant={"success"}>
                Saved
              </Badge>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
