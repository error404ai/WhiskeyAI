import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTokenAddressFromSignature } from "@/lib/solanaPaymentUtils";
import { SOCIAL_CONFIG } from "@/server/config";
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

  const getPumpFunUrl = (address: string) => `${SOCIAL_CONFIG.PUMP_FUN_COIN_URL}${address}`;

  return (
    <div className="mt-4 space-y-4 rounded-xl border p-4">
      <div className="flex justify-between">
        <div>
          <Label className="text-base font-medium">Retrieve Token Address</Label>
          <p className="text-muted-foreground mt-1 text-sm">Extract token address from a transaction signature</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Enter transaction signature" value={signature} onChange={(e) => setSignature(e.target.value)} className="w-full" />
        <Button type="submit" loading={loading} className="w-full">
          Get Token Address
        </Button>
      </form>

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {tokenAddress && (
        <div className="mt-4 space-y-4">
          <CopyableText text={tokenAddress} label="Token Address" successMessage="Token address copied to clipboard!" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm font-medium">Pump.fun Link</div>
              <a href={getPumpFunUrl(tokenAddress)} target="_blank" rel="noopener noreferrer" className="hover:bg-primary/90 hover:text-primary-foreground inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors">
                <ExternalLink className="h-3 w-3" />
                Open
              </a>
            </div>
            <CopyableText text={getPumpFunUrl(tokenAddress)} displayText={getPumpFunUrl(tokenAddress)} successMessage="Pump.fun link copied to clipboard!" />
          </div>
        </div>
      )}
    </div>
  );
}
