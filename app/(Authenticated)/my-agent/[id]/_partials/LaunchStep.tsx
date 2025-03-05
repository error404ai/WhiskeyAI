/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgentPlatform } from "@/db/schema";
import * as PlatformController from "@/http/controllers/platformController";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";

type TabType = "memory" | "simulation" | "connect" | "launch" | "custom_texts" | "post_id";

function LaunchStep() {
  const agentUuid = useParams().id as string;
  const [activeTab, setActiveTab] = useState<TabType>("simulation");
  const [innerSimulateActiveTab, setinnerSimulateActiveTab] = useState<TabType>("custom_texts");
  const [formData, setFormData] = useState({
    memory: {
      management: "",
    },
    connect: {
      twitter: "",
      discordBot: "",
      telegramBot: "",
    },
    voice: {
      apiKey: "",
    },
    launch: {
      configuration: "",
    },
  });

  const {
    isPending,
    isFetching,
    data: platforms,
    refetch,
  } = useQuery({
    queryKey: ["getAgentPlatformsByAgentId"],
    queryFn: () => PlatformController.getAgentPlatformsByAgentUuid(agentUuid),
  });

  const handleAddTwitter = async () => {
    await PlatformController.connectTwitter({
      agentUuid,
      url: `/my-agent/${agentUuid}?tab=launch`,
    });
    refetch();
  };

  const handleDeletePlatform = async (platform: AgentPlatform) => {
    await PlatformController.deleteAgentPlatform(agentUuid, platform.id);
    refetch();
  };

  const [tokenForm, setTokenForm] = useState({
    launchType: "no_token",
    name: "",
    ticker: "",
    description: "",
    buyAmount: "",
    contractAddress: "",
    image: null as File | null,
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: "simulation", label: "Simulate" },
    { id: "memory", label: "Memory" },
    // { id: "connect", label: "Connect" },
    // { id: "launch", label: "Launch" },
  ];

  const innerSimulateTabs: { id: TabType; label: string }[] = [
    { id: "custom_texts", label: "Custom Texts" },
    { id: "post_id", label: "Post Id" },
    // { id: "connect", label: "Connect" },
    // { id: "launch", label: "Launch" },
  ];

  console.log("platforms", platforms);

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Finalize & Test</h2>
            <p className="text-muted-foreground text-sm">Test your agent&apos;s behavior before deployment. Make sure to test your changes before updating.</p>
          </div>

          {/* <div className="flex w-full">
            {tabs.map((tab) => (
              <div key={tab.id} className="w-1/2 px-1">
                <Button variant={activeTab === tab.id ? "default" : "outline"} className={cn("w-full", activeTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary/90")} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </Button>
              </div>
            ))}
          </div> */}

          <div className="mt-6">
            {activeTab === "memory" && (
              <div className="space-y-4">
                <div>
                  <Label>Memory Management</Label>
                  <p className="text-muted-foreground mb-2 text-sm">Manage your agent&apos;s memory</p>
                  <Textarea placeholder="Agent cache layer (based on 32 bit tokens which is aligned critical between your data and the NLP). If you are storing the maximum you can set how much you get back." value={formData.memory.management} onChange={(e) => setFormData({ ...formData, memory: { ...formData.memory, management: e.target.value } })} className="min-h-[200px]" />
                </div>
              </div>
            )}

            {/* {activeTab === "simulation" && (
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex justify-between">
                  <div>
                    <Label>Simulate Reaction</Label>
                    <p className="text-muted-foreground mb-2 text-sm">Test how your agent reacts to content</p>
                  </div>
                  <Button size="sm" className="group">
                    Simulate
                    <Bot className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                  </Button>
                </div>

                <div className="flex w-full">
                  {innerSimulateTabs.map((tab) => (
                    <div key={tab.id} className="w-1/2 px-1">
                      <Button key={tab.id} variant={innerSimulateActiveTab === tab.id ? "default" : "outline"} className={cn("w-full flex-1", innerSimulateActiveTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary/90")} onClick={() => setinnerSimulateActiveTab(tab.id)}>
                        {tab.label}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Choose function(s) to test</Label>
                  <div className="flex gap-2">
                    <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" defaultValue="post_tweet">
                      <option value="post_tweet">post_tweet</option>
                      <option value="reply_tweet">reply_tweet</option>
                      <option value="like_tweet">like_tweet</option>
                      <option value="quote_tweet">quote_tweet</option>
                      <option value="retweet">retweet</option>
                    </select>
                  </div>
                </div>

                {innerSimulateActiveTab === "custom_texts" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Enter text to react to</Label>
                      <Textarea placeholder="Enter the text you want the agent to react to..." value={formData.memory.management} onChange={(e) => setFormData({ ...formData, memory: { ...formData.memory, management: e.target.value } })} className="min-h-[200px]" />
                    </div>
                  </div>
                )}
                {innerSimulateActiveTab === "post_id" && (
                  <div className="space-y-2">
                    <div>
                      <Label>X (Twitter) Post ID</Label>
                      <Input placeholder="Enter post ID (e.g., 1234567890)" value={formData.connect.twitter} onChange={(e) => setFormData({ ...formData, connect: { ...formData.connect, twitter: e.target.value } })} />
                    </div>
                  </div>
                )}
             
              </div>
            )} */}
            {(isFetching || isPending) && <Skeleton height={40} />}
            {!isFetching && !isPending && !platforms?.find((platform) => platform.type === "twitter") && (
              <div className="mt-4 space-y-4 rounded-xl border p-4">
                <div className="flex justify-between">
                  <div>
                    <Label>Connect Twitter</Label>
                  </div>
                </div>
                <Button onClick={handleAddTwitter} variant={"outline"} className="w-full flex-1">
                  Connect
                </Button>
              </div>
            )}
            {!isFetching && !isPending && platforms?.find((platform) => platform.type === "twitter") && (
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
            <div className="mt-4 space-y-4 rounded-xl border p-4">
              <div className="flex justify-between">
                <div>
                  <Label>Wallet Management</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label>Solana Public Wallet</Label>
                  <Input placeholder="Enter post ID (e.g., 1234567890)" value="HcCUDzFp8RPD8FcKheFiUL9LxddNYuqcomwKqm2zhJhg" onChange={(e) => setFormData({ ...formData, connect: { ...formData.connect, twitter: e.target.value } })} />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-4 rounded-xl border p-4">
              <div className="space-y-2">
                <Label>Launch Type</Label>
                <div className="flex gap-2">
                  <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" value={tokenForm.launchType} onChange={(e) => setTokenForm({ ...tokenForm, launchType: e.target.value })}>
                    <option value="no_token">no_token</option>
                    <option value="new_token">new_token</option>
                    <option value="existing_token">existing_token</option>
                  </select>
                </div>
              </div>

              {(tokenForm.launchType === "new_token" || tokenForm.launchType === "existing_token") && (
                <div className="space-y-4">
                  {tokenForm.launchType === "existing_token" && (
                    <div className="space-y-2">
                      <Label>Token Contract Address</Label>
                      <Input placeholder="Enter contract address" value={tokenForm.contractAddress} onChange={(e) => setTokenForm({ ...tokenForm, contractAddress: e.target.value })} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Token Name</Label>
                    <Input placeholder="Enter token name" value={tokenForm.name} onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Token Ticker</Label>
                    <Input placeholder="Enter token ticker" value={tokenForm.ticker} onChange={(e) => setTokenForm({ ...tokenForm, ticker: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Enter token description" value={tokenForm.description} onChange={(e) => setTokenForm({ ...tokenForm, description: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Buy Amount</Label>
                    <Input type="number" placeholder="Enter buy amount" value={tokenForm.buyAmount} onChange={(e) => setTokenForm({ ...tokenForm, buyAmount: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Token Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setTokenForm({ ...tokenForm, image: e.target.files?.[0] || null })} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center">
              <input type="checkbox" id="confirm" className="mr-2" />
              <label htmlFor="confirm" className="text-muted-foreground text-sm">
                List your agent on vvaifu.fun | Costs 751 $VVAIFU
              </label>
            </div>
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">Connect Model</Button>
        </div>
      </div>
    </div>
  );
}

export default LaunchStep;
