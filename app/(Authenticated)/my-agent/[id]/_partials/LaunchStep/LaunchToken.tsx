"use client";
import ImageInput from "@/components/MyUi/ImageInput/ImageInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PumpportalService } from "@/http/services/PumpportalService";
import { tokenMetadataSchema } from "@/http/zodSchema/tokenMetadataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const LaunchToken = () => {
  "use no memo";
  const methods = useForm<z.infer<typeof tokenMetadataSchema>>({
    mode: "onTouched",
    resolver: zodResolver(tokenMetadataSchema),
  });

  const onSubmit = async (data: z.infer<typeof tokenMetadataSchema>) => {
    console.log("data is", data);
    const walletPrivateKey = "walletPrivateKey";
    const tx = new PumpportalService().sendLocalCreateTx(walletPrivateKey, data);
    console.log("tx is", tx);
  };

  const launchType = methods.watch("launchType");

  console.log("launchType is", launchType);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="mt-4 space-y-4 rounded-xl border p-4">
          <div className="space-y-2">
            <Label>Launch Type</Label>
            {launchType}

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

              {methods.getValues("launchType") === "new_token" && (
                <div className="space-y-2">
                  <Label>Buy Amount</Label>
                  <Input name="buyAmount" type="number" placeholder="Enter buy amount" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Token Image</Label>
                <ImageInput name="file" />
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
