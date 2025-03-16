"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { twitterCredentialsSchema } from "@/http/zodSchema/twitterCredentialsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function TwitterDeveloperSetup() {
  "use no memo";

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const agentUuid = useParams().id as string;

  const { data: agent, refetch } = useQuery({
    queryKey: ["getAgentByUuid", agentUuid],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
    enabled: !!agentUuid,
  });

  const methods = useForm<z.infer<typeof twitterCredentialsSchema>>({
    mode: "onTouched",
    resolver: zodResolver(twitterCredentialsSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  useEffect(() => {
    if (agent) {
      methods.setValue("clientId", agent.twitterClientId || "");
      methods.setValue("clientSecret", agent.twitterClientSecret || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent]);

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

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
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
            {/* <div className="bg-muted aspect-video overflow-hidden rounded-md">
              <div className="flex h-full w-full items-center justify-center">
                <iframe className="h-full w-full" src="https://www.youtube.com/embed/KNgg7a47y6g" title="Twitter Developer Setup Tutorial" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            </div> */}
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
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input name="clientId" label="Client ID" placeholder="Enter Client ID" />
          </div>
          <div className="space-y-2">
            <Input name="clientSecret" label="Client Secret" type="password" placeholder="Enter Client Secret" />
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
