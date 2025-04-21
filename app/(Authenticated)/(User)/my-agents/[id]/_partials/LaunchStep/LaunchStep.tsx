/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as PlatformController from "@/server/controllers/platformController";
import { AgentPlatform } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import CoinMarketTest from "./_partials/CoinMarketTest";
import DexscreenerTest from "./_partials/DexscreenerTest";
import LaunchToken from "./_partials/LaunchToken";
import RpcTest from "./_partials/RpcTest";
import SolanaTrackerTest from "./_partials/SolanaTrackerTest";
import TelegramTest from "./_partials/TelegramTest";
import TokenAddressTest from "./_partials/TokenAddressTest";
import TwitterAgentTest from "./_partials/TwitterAgentTest";

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
  const [activeApiTab, setActiveApiTab] = useState<string>("twitter");

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
        url: `/my-agents/${agentUuid}?tab=launch`,
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
          <Tabs value={activeApiTab} onValueChange={setActiveApiTab} className="w-full">
            <TabsList className="mx-auto mb-4 flex h-fit w-fit flex-wrap gap-2">
              <TabsTrigger value="twitter">Twitter API</TabsTrigger>
              <TabsTrigger value="telegram">Telegram API</TabsTrigger>
              <TabsTrigger value="dexscreener">Dexscreener API</TabsTrigger>
              <TabsTrigger value="coinmarket">Coinmarket API</TabsTrigger>
              <TabsTrigger value="rpc">RPC API</TabsTrigger>
              <TabsTrigger value="solanatracker">Solana Tracker</TabsTrigger>
            </TabsList>
            <TabsContent value="twitter">
              <TwitterAgentTest />
            </TabsContent>
            <TabsContent value="telegram">
              <TelegramTest />
            </TabsContent>
            <TabsContent value="dexscreener">
              <DexscreenerTest />
            </TabsContent>
            <TabsContent value="coinmarket">
              <CoinMarketTest />
            </TabsContent>
            <TabsContent value="rpc">
              <div className="space-y-6">
                <TokenAddressTest />
              </div>
            </TabsContent>
            <TabsContent value="solanatracker">
              <SolanaTrackerTest />
            </TabsContent>
          </Tabs>
          <RpcTest />
        </div>
      </div>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Twitter Credentials Required</DialogTitle>
            <DialogDescription>Please set up your Twitter Developer credentials first. You need to enter both the Client ID and Client Secret in the &quot;Setup Twitter Developer&quot; section before connecting to Twitter.</DialogDescription>
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
