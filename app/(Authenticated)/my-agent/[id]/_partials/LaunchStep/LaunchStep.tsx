/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AgentPlatform } from "@/db/schema";
import * as PlatformController from "@/http/controllers/platformController";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import LaunchToken from "./_partials/LaunchToken";
import TwitterAgentTest from "./_partials/TwitterAgentTest";
import TokenAddressTest from "./_partials/TokenAddressTest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type TabType = "memory" | "simulation" | "connect" | "launch" | "custom_texts" | "post_id";

function LaunchStep() {
  const agentUuid = useParams().id as string;
  const {
    isPending: isPlatformPending,
    isFetching: isPlatformFetching,
    data: platforms,
    refetch: platformRefetch,
  } = useQuery({
    queryKey: ["getAgentPlatformsByAgentId"],
    queryFn: () => PlatformController.getAgentPlatformsByAgentUuid(agentUuid),
  });

  const [connecting, setConnecting] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const handleAddTwitter = async () => {
    setConnecting(true);
    try {
      // Check if Twitter credentials exist before connecting
      const hasCredentials = await PlatformController.checkTwitterCredentials(agentUuid);
      
      if (!hasCredentials) {
        setWarningOpen(true);
        setConnecting(false);
        return;
      }
      
      await PlatformController.connectTwitter({
        agentUuid,
        url: `/my-agent/${agentUuid}?tab=launch`,
      });
      platformRefetch();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDeletePlatform = async (platform: AgentPlatform) => {
    await PlatformController.deleteAgentPlatform(agentUuid, String(platform.id));
    platformRefetch();
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Finalize & Test</h2>
            <p className="text-muted-foreground text-sm">Test your agent&apos;s behavior before deployment. Make sure to test your changes before updating.</p>
          </div>

          <div className="mt-6">
            {(isPlatformFetching || isPlatformPending) && <Skeleton height={40} />}
            {!isPlatformFetching && !isPlatformPending && !platforms?.find((platform) => platform.type === "twitter") && (
              <div className="mt-4 space-y-4 rounded-xl border p-4">
                <div className="flex justify-between">
                  <div>
                    <Label>Connect Twitter</Label>
                  </div>
                </div>
                <Button disabled={connecting} loading={connecting} onClick={handleAddTwitter} variant={"outline"} className="w-full flex-1">
                  Connect
                </Button>
              </div>
            )}
            {!isPlatformFetching && !isPlatformPending && platforms?.find((platform) => platform.type === "twitter") && (
              <div className="mt-4 space-y-4 rounded-xl border p-4">
                <div className="flex justify-between">
                  <div className="flex w-full items-center justify-between">
                    <Label>Connect Twitter</Label>
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        const twitterPlatform = platforms.find((platform) => platform.type === "twitter");
                        if (twitterPlatform) {
                          handleDeletePlatform(twitterPlatform);
                        }
                      }}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
                {platforms && (
                  <Button variant={"secondary"} className="w-full flex-1">
                    <img src={platforms.find((platform) => platform.type === "twitter")?.account?.avatar} alt="" className="mr-2 h-6 w-6 rounded-full" />
                    {platforms.find((platform) => platform.type === "twitter")?.account?.name}
                  </Button>
                )}
              </div>
            )}

            <LaunchToken platformLoading={isPlatformFetching || isPlatformPending} />
          </div>
        </div>
        <div>
          <TwitterAgentTest />
          <TokenAddressTest />
        </div>
      </div>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Twitter Credentials Required</DialogTitle>
            <DialogDescription>
              Please set up your Twitter Developer credentials first. You need to enter both the Client ID and Client Secret in the &quot;Setup Twitter Developer&quot; section before connecting to Twitter.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setWarningOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LaunchStep;
