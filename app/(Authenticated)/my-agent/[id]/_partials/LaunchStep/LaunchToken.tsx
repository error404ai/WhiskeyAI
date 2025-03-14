"use client";
import ImageInput from "@/components/MyUi/ImageInput/ImageInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgentPlatform } from "@/db/schema";
import * as AgentController from "@/http/controllers/agent/AgentController";
import * as PumpportailController from "@/http/controllers/pumpportalController";
import { tokenMetadataSchema } from "@/http/zodSchema/tokenMetadataSchema";
import { sendWalletCreateTx } from "@/lib/pumpportalUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, PartyPopper, Twitter } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  platforms: AgentPlatform[] | undefined;
  platformLoading: boolean;
};

const LaunchToken: React.FC<Props> = ({ platforms, platformLoading }) => {
  "use no memo";
  const agentUuid = useParams().id as string;
  const router = useRouter();
  const twitterPlatform = platforms?.find((platform) => platform.type === "twitter");

  const { data: agent, refetch } = useQuery({
    queryKey: ["getAgentByUuid"],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
  });

  const { publicKey, signTransaction, connected } = useWallet();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [agentDeployStatus, setAgentDeployStatus] = useState<StatusType>("initial");
  const [showDeploySuccessModal, setShowDeploySuccessModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const methods = useForm<z.infer<typeof tokenMetadataSchema>>({
    mode: "onTouched",
    resolver: zodResolver(tokenMetadataSchema),
  });
  methods.watch();

  const onSubmit = async (data: z.infer<typeof tokenMetadataSchema>) => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const metadataJSON = await PumpportailController.uploadMetadata(formData);
      const signature = await sendWalletCreateTx(publicKey, signTransaction, metadataJSON, data.buyAmount);
      const txLink = `https://solscan.io/tx/${signature}`;
      await AgentController.storeAgentTxLink(agentUuid, txLink);
      refetch();
      setTxSignature(signature);
    } catch (error) {
      alert(`Error launching token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeployAgent = async () => {
    // Use the shared validation function
    const validationResult = await AgentController.validateAgentReadiness(agentUuid);
    
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      setShowValidationErrorModal(true);
      return;
    }

    setAgentDeployStatus("loading");
    const res = await AgentController.deployAgent(agentUuid);
    if (res) {
      setAgentDeployStatus("success");
      setShowDeploySuccessModal(true);
      // Refresh the agent data to show updated status
      refetch();
    } else {
      setAgentDeployStatus("error");
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="rounded-lg border p-4">
        <label className="mb-2 block">Connect Wallet</label>
        <div className="flex items-center gap-4">
          <WalletMultiButton />
          {connected ? <span className="text-green-600">✓ Wallet Connected</span> : <span className="text-red-500">Please connect your wallet to continue</span>}
        </div>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {Object.keys(methods.formState.errors).length > 0 && (
              <div className="mt-4 space-y-4 rounded-xl border p-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4">
                  <ul className="list-disc space-y-1 pl-5 text-red-700">
                    {Object.entries(methods.formState.errors).map(([key, value]) => {
                      const error = typeof value.message === "string" ? value.message : "";
                      return <li key={key}>{error}</li>;
                    })}
                  </ul>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Launch Type</Label>
              <div className="flex gap-2">
                <select {...methods.register("launchType")} className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="no_token">no_token</option>
                  <option value="new_token">new_token</option>
                  <option value="existing_token">existing_token</option>
                </select>
                <p className="text-red-500">{methods.formState.errors.launchType?.message}</p>
              </div>
            </div>

            {(methods.getValues("launchType") === "new_token" || methods.getValues("launchType") === "existing_token") && (
              <div className="space-y-4">
                {methods.getValues("launchType") === "existing_token" && (
                  <div className="space-y-2">
                    <Label>Token Mint</Label>
                    <Input name="tokenMint" placeholder="Enter token mint" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Token Name</Label>
                  <Input disabled={methods.getValues("launchType") === "existing_token"} name="name" placeholder="Enter token name" />
                </div>

                <div className="space-y-2">
                  <Label>Token Ticker</Label>
                  <Input disabled={methods.getValues("launchType") === "existing_token"} name="symbol" placeholder="Enter token ticker" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea disabled={methods.getValues("launchType") === "existing_token"} name="description" placeholder="Enter token description" />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Textarea disabled={methods.getValues("launchType") === "existing_token"} name="telegram" placeholder="Enter telegram" />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Textarea disabled={methods.getValues("launchType") === "existing_token"} name="twitter" placeholder="Enter twitter" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Textarea disabled={methods.getValues("launchType") === "existing_token"} name="website" placeholder="Enter website" />
                </div>

                {methods.getValues("launchType") === "new_token" && (
                  <div className="space-y-2">
                    <Label>Buy Amount</Label>
                    <Input name="buyAmount" step={0.0001} type="number" placeholder="Enter buy amount" />
                  </div>
                )}

                {!(methods.getValues("launchType") === "existing_token") && (
                  <div className="space-y-2">
                    <Label>Token Image</Label>
                    <div className="bg-background ring-offset-background flex items-center rounded-md border p-2">
                      <ImageInput name="file" maxSize={2} />
                      <p className="text-muted-foreground mx-2 text-sm">Upload an image (optional)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!agent?.txLink && methods.getValues("launchType") !== "no_token" && twitterPlatform && (
            <Button variant={"outline"} className="mt-4 w-full" loading={methods.formState.isSubmitting}>
              Launch Token
            </Button>
          )}
        </form>
      </FormProvider>
      {/* Deploy agent button */}
      {(agent?.txLink || methods.getValues("launchType") === "no_token") && !platformLoading && (
        <Button onClick={handleDeployAgent} loading={agentDeployStatus === "loading"} disabled={agent?.status === "running" || agentDeployStatus === "success"} className="w-full">
          {agent?.status === "running" ? "Deployed" : "Deploy Agent"}
        </Button>
      )}

      {!twitterPlatform && !platformLoading && (
        <Badge className="h-12 w-full" variant={"destructive"}>
          You need to add twitter platform first
        </Badge>
      )}

      {/* Modal Showing TxLink */}
      <Dialog open={Boolean(txSignature)} onOpenChange={() => setTxSignature("")}>
        <DialogContent className="space-y-4">
          <DialogTitle className="text-lg font-bold">Token Launched</DialogTitle>
          <p className="text-muted-foreground">Your token has been launched successfully. You can view the transaction on Solscan by clicking the link below.</p>

          <div className="flex justify-center gap-3">
            <Button variant={"outline"} parentClass="w-fit" onClick={() => setTxSignature("")}>
              Close
            </Button>
            <a href={`https://solscan.io/tx/${txSignature}`} target="_blank" rel="noopener noreferrer" className="w-fit">
              <Button parentClass="w-fit">View on Solscan</Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agent Deployment Success Modal */}
      <Dialog open={showDeploySuccessModal} onOpenChange={setShowDeploySuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-center">
              <PartyPopper className="h-6 w-6 text-primary" />
              Agent Successfully Deployed!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your Twitter agent is now up and running
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 p-4 rounded-lg my-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Agent is active and ready to run</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Triggers will execute on their scheduled intervals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Your agent will now post to Twitter automatically</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
            <Button onClick={() => setShowDeploySuccessModal(false)} variant="outline">
              Close
            </Button>
            <Button 
              variant="default" 
              className="gap-2"
              onClick={() => {
                setShowDeploySuccessModal(false);
                router.push("/my-agent");
              }}
            >
              <Twitter className="h-4 w-4" />
              Go to My Agents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Error Modal */}
      <Dialog open={showValidationErrorModal} onOpenChange={setShowValidationErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Cannot Deploy Agent
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please resolve the following issues before deploying:
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg my-4">
            <ul className="list-disc pl-5 space-y-2 text-amber-800">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
          
          <DialogFooter className="flex justify-end">
            <Button 
              onClick={() => setShowValidationErrorModal(false)} 
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaunchToken;
