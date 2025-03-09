"use client";
import ImageInput from "@/components/MyUi/ImageInput/ImageInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadMetadata } from "@/http/controllers/pumpportalController";
import { PumpportalService } from "@/http/services/PumpportalService";
import { tokenMetadataSchema } from "@/http/zodSchema/tokenMetadataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const LaunchToken = () => {
  "use no memo";
  const { publicKey, signTransaction, connected } = useWallet();
  const [txSignature, setTxSignature] = useState<string | null>(null);

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

      const metadataJSON = await uploadMetadata(formData);

      const pumpService = new PumpportalService();
      // Pass the wallet's publicKey and signTransaction function instead of a private key
      const signature = await pumpService.sendWalletCreateTx(publicKey, signTransaction, metadataJSON);

      console.log("Transaction: https://solscan.io/tx/" + signature);
      setTxSignature(signature);
    } catch (error) {
      console.error("Error launching token:", error);
      alert(`Error launching token: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      signature is {txSignature}
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
                      const error = value as ReactNode;
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
                    <Label>Token Contract Address</Label>
                    <Input name="contractAddress" placeholder="Enter contract address" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Token Name</Label>
                  <Input name="name" placeholder="Enter token name" />
                </div>

                <div className="space-y-2">
                  <Label>Token Ticker</Label>
                  <Input name="symbol" placeholder="Enter token ticker" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Enter token description" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Textarea name="website" placeholder="Enter website" />
                </div>

                {methods.getValues("launchType") === "new_token" && (
                  <div className="space-y-2">
                    <Label>Buy Amount</Label>
                    <Input name="buyAmount" step={0.0001} type="number" placeholder="Enter buy amount" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Token Image</Label>
                  <div className="bg-background ring-offset-background flex items-center rounded-md border p-2">
                    <ImageInput name="file" />
                    <p className="text-muted-foreground mx-2 text-sm">Upload an image (optional)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full">Launch Token</Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default LaunchToken;
