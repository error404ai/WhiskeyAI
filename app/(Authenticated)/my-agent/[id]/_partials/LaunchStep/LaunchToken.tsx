import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tokenLaunchSchema } from "@/http/zodSchema/tokenLaunchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const LaunchToken = () => {
  const methods = useForm<z.infer<typeof tokenLaunchSchema>>({
    mode: "onTouched",
    resolver: zodResolver(tokenLaunchSchema),
  });
  const onSubmit = async (data: z.infer<typeof tokenLaunchSchema>) => {
    console.log("data is", data);
    const tx = "tx token";
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
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="mt-4 space-y-4 rounded-xl border p-4">
          <div className="space-y-2">
            <Label>Launch Type</Label>
            <div className="flex gap-2">
              <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
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
      </form>
    </FormProvider>
  );
};

export default LaunchToken;
