import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyableText } from "@/components/ui/copyable-text";
import { getTokenAddressFromSignature } from "@/lib/solanaPaymentUtils";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export default function TokenAddressTest() {
  const [signature, setSignature] = useState("");
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTokenAddress(null);

    try {
      const address = await getTokenAddressFromSignature(signature);
      if (address) {
        setTokenAddress(address);
      } else {
        setError("No token address found in transaction");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get token address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl border p-4">
      <div className="flex justify-between">
        <div>
          <Label className="text-base font-medium">Retrieve Token Address</Label>
          <p className="text-muted-foreground text-sm mt-1">Extract token address from a transaction signature</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter transaction signature"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className="w-full"
        />
        <Button type="submit" loading={loading} className="w-full">
          Get Token Address
        </Button>
      </form>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}

      {tokenAddress && (
        <div className="mt-4 space-y-4">
          <CopyableText 
            text={tokenAddress}
            label="Token Address" 
            successMessage="Token address copied to clipboard!"
          />
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-muted-foreground">Pump.fun Link</div>
              <a 
                href={`https://pump.fun/coin/${tokenAddress}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-xs rounded-md font-medium transition-colors hover:bg-primary/90 hover:text-primary-foreground px-2 py-1 border"
              >
                <ExternalLink className="h-3 w-3" />
                Open
              </a>
            </div>
            <CopyableText 
              text={`https://pump.fun/coin/${tokenAddress}`}
              displayText={`https://pump.fun/coin/${tokenAddress}`}
              successMessage="Pump.fun link copied to clipboard!"
            />
          </div>
        </div>
      )}
    </div>
  );
} 