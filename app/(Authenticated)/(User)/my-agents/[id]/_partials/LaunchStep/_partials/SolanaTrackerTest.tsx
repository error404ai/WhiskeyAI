"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirstBuyers, getLatestTokens, getMultiAllTokens, getMultiGraduatedTokens, getMultiTokenPrices, getTokenChart, getTokenHolders, getTokenHoldersChart, getTokenPoolChart, getTokenPrice, getTopTokenHolders, getTopVolumeTokens, getTrendingTokens, getTrendingTokensByTimeframe, getVolumeTokensByTimeframe, getWalletTokens, getWalletTrades, type SolanaTrackerResponse } from "@/server/controllers/externalApi/SolanaTrackerController";
import { firstBuyersSchema, multiTokenPricesSchema, tokenChartSchema, tokenHoldersChartSchema, tokenHoldersSchema, tokenPoolChartSchema, tokenPriceSchema, walletTokensSchema, walletTradesSchema } from "@/server/zodSchema/solanaTrackerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, LineChart } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

interface ResultData {
  action: string;
  data: Record<string, unknown>;
}

const filterEmptyParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
};

export default function SolanaTrackerTest() {
  // Form handlers for each tab
  const tokenHoldersForm = useForm({
    resolver: zodResolver(tokenHoldersSchema),
    defaultValues: { tokenAddress: "" },
  });

  const tokenPriceForm = useForm({
    resolver: zodResolver(tokenPriceSchema),
    defaultValues: { token: "", priceChanges: false },
  });

  const multiTokenPricesForm = useForm({
    resolver: zodResolver(multiTokenPricesSchema),
    defaultValues: { tokens: "", priceChanges: false },
  });

  const walletTokensForm = useForm({
    resolver: zodResolver(walletTokensSchema),
    defaultValues: { owner: "" },
  });

  const walletTradesForm = useForm({
    resolver: zodResolver(walletTradesSchema),
    defaultValues: { owner: "", cursor: "" },
  });

  const tokenChartForm = useForm({
    resolver: zodResolver(tokenChartSchema),
    defaultValues: {
      token: "",
      type: undefined,
      time_from: undefined,
      time_to: undefined,
      marketCap: false,
      removeOutliers: true,
    },
  });

  const tokenPoolChartForm = useForm({
    resolver: zodResolver(tokenPoolChartSchema),
    defaultValues: {
      token: "",
      pool: "",
      type: undefined,
      time_from: undefined,
      time_to: undefined,
      marketCap: false,
      removeOutliers: true,
    },
  });

  const tokenHoldersChartForm = useForm({
    resolver: zodResolver(tokenHoldersChartSchema),
    defaultValues: {
      token: "",
      type: undefined,
      time_from: undefined,
      time_to: undefined,
    },
  });

  const firstBuyersForm = useForm({
    resolver: zodResolver(firstBuyersSchema),
    defaultValues: { token: "" },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<SolanaTrackerResponse | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<SolanaTrackerResponse>, actionName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await apiCall();
      if (response.status === "error") {
        setError(response);
        console.error(`${actionName} error:`, response.message);
      } else {
        setResult({
          action: actionName,
          data: response.data || {},
        });
        setSuccess(`${actionName} completed successfully!`);
      }
    } catch (err) {
      const safeError: SolanaTrackerResponse = {
        status: "error",
        message: `Unexpected error: ${(err as Error).message}`,
        errorDetails: JSON.stringify(err),
      };
      setError(safeError);
      console.error(`${actionName} unexpected error:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleGetTokenHolders = (data: z.infer<typeof tokenHoldersSchema>) => {
    handleApiCall(() => getTokenHolders(data.tokenAddress), "Get Token Holders");
    tokenHoldersForm.reset();
  };

  const handleGetTopTokenHolders = (data: z.infer<typeof tokenHoldersSchema>) => {
    handleApiCall(() => getTopTokenHolders(data.tokenAddress), "Get Top Token Holders");
    tokenHoldersForm.reset();
  };

  const handleGetLatestTokens = () => {
    handleApiCall(() => getLatestTokens(), "Get Latest Tokens");
  };

  const handleGetTrendingTokens = () => {
    handleApiCall(() => getTrendingTokens(), "Get Trending Tokens");
  };

  const handleGetTrendingTokensByTimeframe = (timeframe: string) => {
    handleApiCall(() => getTrendingTokensByTimeframe(timeframe), "Get Trending Tokens By Timeframe");
  };

  const handleGetTopVolumeTokens = () => {
    handleApiCall(() => getTopVolumeTokens(), "Get Top Volume Tokens");
  };

  const handleGetVolumeTokensByTimeframe = (timeframe: string) => {
    handleApiCall(() => getVolumeTokensByTimeframe(timeframe), "Get Volume Tokens By Timeframe");
  };

  const handleGetMultiAllTokens = () => {
    handleApiCall(() => getMultiAllTokens(), "Get Multi All Tokens");
  };

  const handleGetMultiGraduatedTokens = () => {
    handleApiCall(() => getMultiGraduatedTokens(), "Get Multi Graduated Tokens");
  };

  const handleGetTokenPrice = (data: z.infer<typeof tokenPriceSchema>) => {
    handleApiCall(() => getTokenPrice(data.token, data.priceChanges), "Get Token Price");
    tokenPriceForm.reset();
  };

  const handleGetMultiTokenPrices = (data: z.infer<typeof multiTokenPricesSchema>) => {
    handleApiCall(() => getMultiTokenPrices(data.tokens), "Get Multi Token Prices");
    multiTokenPricesForm.reset();
  };

  const handleGetWalletTokens = (data: z.infer<typeof walletTokensSchema>) => {
    handleApiCall(() => getWalletTokens(data.owner), "Get Wallet Tokens");
    walletTokensForm.reset();
  };

  const handleGetWalletTrades = (data: z.infer<typeof walletTradesSchema>) => {
    handleApiCall(() => getWalletTrades(data.owner, data.cursor), "Get Wallet Trades");
    walletTradesForm.reset();
  };

  const handleGetTokenChart = (data: z.infer<typeof tokenChartSchema>) => {
    const { token, ...params } = data;
    handleApiCall(() => getTokenChart(token, filterEmptyParams(params)), "Get Token Chart");
    tokenChartForm.reset();
  };

  const handleGetTokenPoolChart = (data: z.infer<typeof tokenPoolChartSchema>) => {
    const { token, pool, ...params } = data;
    handleApiCall(() => getTokenPoolChart(token, pool, filterEmptyParams(params)), "Get Token Pool Chart");
    tokenPoolChartForm.reset();
  };

  const handleGetTokenHoldersChart = (data: z.infer<typeof tokenHoldersChartSchema>) => {
    const { token, ...params } = data;
    handleApiCall(() => getTokenHoldersChart(token, filterEmptyParams(params)), "Get Token Holders Chart");
    tokenHoldersChartForm.reset();
  };

  const handleGetFirstBuyers = (data: z.infer<typeof firstBuyersSchema>) => {
    handleApiCall(() => getFirstBuyers(data.token), "Get First Buyers");
    firstBuyersForm.reset();
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <div className="mb-6 flex items-center gap-2">
        <LineChart className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">Solana Tracker API Test</h1>
      </div>

      <Tabs defaultValue="token-holders" className="w-full">
        <TabsList className="mb-4 flex h-fit flex-wrap gap-2">
          <TabsTrigger value="token-holders" className="text-xs sm:text-sm">
            Token Holders
          </TabsTrigger>
          <TabsTrigger value="latest-tokens" className="text-xs sm:text-sm">
            Latest Tokens
          </TabsTrigger>
          <TabsTrigger value="trending-tokens" className="text-xs sm:text-sm">
            Trending Tokens
          </TabsTrigger>
          <TabsTrigger value="volume-tokens" className="text-xs sm:text-sm">
            Volume Tokens
          </TabsTrigger>
          <TabsTrigger value="multi-tokens" className="text-xs sm:text-sm">
            Multi Tokens
          </TabsTrigger>
          <TabsTrigger value="token-price" className="text-xs sm:text-sm">
            Token Price
          </TabsTrigger>
          <TabsTrigger value="wallet-info" className="text-xs sm:text-sm">
            Wallet Info
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-xs sm:text-sm">
            Charts
          </TabsTrigger>
        </TabsList>

        {/* Token Holders Tab */}
        <TabsContent value="token-holders">
          <FormProvider {...tokenHoldersForm}>
            <form onSubmit={tokenHoldersForm.handleSubmit(handleGetTokenHolders)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Token Holders</CardTitle>
                  <CardDescription>Get the top 100 holders for a specific token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Token Address</Label>
                    <Input {...tokenHoldersForm.register("tokenAddress")} placeholder="Enter token address" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Token Holders"}
                    </Button>
                    <Button type="button" disabled={loading} className="bg-blue-500 hover:bg-blue-600" onClick={() => tokenHoldersForm.handleSubmit(handleGetTopTokenHolders)()}>
                      {loading ? "Loading..." : "Get Top Token Holders"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Latest Tokens Tab */}
        <TabsContent value="latest-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Get Latest Tokens</CardTitle>
              <CardDescription>Fetch the latest tokens from Solana Tracker</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGetLatestTokens} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Latest Tokens"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Tokens Tab */}
        <TabsContent value="trending-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Get Trending Tokens</CardTitle>
              <CardDescription>Fetch trending tokens from Solana Tracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGetTrendingTokens} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Trending Tokens"}
              </Button>
              <div className="space-y-2">
                <Label>Get Trending By Timeframe</Label>
                <div className="flex gap-2">
                  {["5m", "15m", "30m", "1h", "6h", "12h", "24h"].map((timeframe) => (
                    <Button key={timeframe} onClick={() => handleGetTrendingTokensByTimeframe(timeframe)} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volume Tokens Tab */}
        <TabsContent value="volume-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Get Volume Tokens</CardTitle>
              <CardDescription>Fetch tokens sorted by volume from Solana Tracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGetTopVolumeTokens} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Top Volume Tokens"}
              </Button>
              <div className="space-y-2">
                <Label>Get Volume By Timeframe</Label>
                <div className="flex gap-2">
                  {["5m", "15m", "30m", "1h", "6h", "12h", "24h"].map((timeframe) => (
                    <Button key={timeframe} onClick={() => handleGetVolumeTokensByTimeframe(timeframe)} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi Tokens Tab */}
        <TabsContent value="multi-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Get Multi Tokens</CardTitle>
              <CardDescription>Fetch multiple token information from Solana Tracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGetMultiAllTokens} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get All Multi Tokens"}
              </Button>
              <Button onClick={handleGetMultiGraduatedTokens} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Graduated Multi Tokens"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Price Tab */}
        <TabsContent value="token-price">
          <div className="space-y-4">
            <FormProvider {...tokenPriceForm}>
              <form onSubmit={tokenPriceForm.handleSubmit(handleGetTokenPrice)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Token Price</CardTitle>
                    <CardDescription>Get price information for a single token</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Address</Label>
                      <Input {...tokenPriceForm.register("token")} placeholder="Enter token address" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...tokenPriceForm.register("priceChanges")} id="priceChanges" />
                      <Label htmlFor="priceChanges">Include Price Changes</Label>
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Token Price"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>

            <FormProvider {...multiTokenPricesForm}>
              <form onSubmit={multiTokenPricesForm.handleSubmit(handleGetMultiTokenPrices)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Multi Token Prices</CardTitle>
                    <CardDescription>Get price information for multiple tokens (up to 100)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Addresses</Label>
                      <Input {...multiTokenPricesForm.register("tokens")} placeholder="Enter comma-separated token addresses" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...multiTokenPricesForm.register("priceChanges")} id="multiPriceChanges" />
                      <Label htmlFor="multiPriceChanges">Include Price Changes</Label>
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Multi Token Prices"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>
          </div>
        </TabsContent>

        {/* Wallet Info Tab */}
        <TabsContent value="wallet-info">
          <div className="space-y-4">
            <FormProvider {...walletTokensForm}>
              <form onSubmit={walletTokensForm.handleSubmit(handleGetWalletTokens)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Wallet Tokens</CardTitle>
                    <CardDescription>Get all tokens in a wallet with current value in USD</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input {...walletTokensForm.register("owner")} placeholder="Enter wallet address" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? "Loading..." : "Get Wallet Tokens"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>

            <FormProvider {...walletTradesForm}>
              <form onSubmit={walletTradesForm.handleSubmit(handleGetWalletTrades)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Wallet Trades</CardTitle>
                    <CardDescription>Get the latest trades of a wallet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input {...walletTradesForm.register("owner")} placeholder="Enter wallet address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cursor</Label>
                      <Input {...walletTradesForm.register("cursor")} placeholder="Enter cursor for pagination" />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Wallet Trades"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <div className="space-y-4">
            <FormProvider {...tokenChartForm}>
              <form onSubmit={tokenChartForm.handleSubmit(handleGetTokenChart)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Token Chart</CardTitle>
                    <CardDescription>Get OLCVH data for token charts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Address</Label>
                      <Input {...tokenChartForm.register("token")} placeholder="Enter token address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time Interval</Label>
                      <select {...tokenChartForm.register("type")} className="w-full rounded border p-2">
                        <option value="">Select interval</option>
                        {["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"].map((interval) => (
                          <option key={interval} value={interval}>
                            {interval}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time From (Unix timestamp)</Label>
                      <Input {...tokenChartForm.register("time_from", { valueAsNumber: true })} type="number" placeholder="Enter start time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time To (Unix timestamp)</Label>
                      <Input {...tokenChartForm.register("time_to", { valueAsNumber: true })} type="number" placeholder="Enter end time" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...tokenChartForm.register("marketCap")} id="marketCap" />
                      <Label htmlFor="marketCap">Show Market Cap</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...tokenChartForm.register("removeOutliers")} id="removeOutliers" />
                      <Label htmlFor="removeOutliers">Remove Outliers</Label>
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Token Chart"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>

            <FormProvider {...tokenPoolChartForm}>
              <form onSubmit={tokenPoolChartForm.handleSubmit(handleGetTokenPoolChart)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Token Pool Chart</CardTitle>
                    <CardDescription>Get OLCVH data for specific pool charts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Address</Label>
                      <Input {...tokenPoolChartForm.register("token")} placeholder="Enter token address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pool Address</Label>
                      <Input {...tokenPoolChartForm.register("pool")} placeholder="Enter pool address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time Interval</Label>
                      <select {...tokenPoolChartForm.register("type")} className="w-full rounded border p-2">
                        <option value="">Select interval</option>
                        {["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"].map((interval) => (
                          <option key={interval} value={interval}>
                            {interval}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time From (Unix timestamp)</Label>
                      <Input {...tokenPoolChartForm.register("time_from", { valueAsNumber: true })} type="number" placeholder="Enter start time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time To (Unix timestamp)</Label>
                      <Input {...tokenPoolChartForm.register("time_to", { valueAsNumber: true })} type="number" placeholder="Enter end time" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...tokenPoolChartForm.register("marketCap")} id="poolMarketCap" />
                      <Label htmlFor="poolMarketCap">Show Market Cap</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...tokenPoolChartForm.register("removeOutliers")} id="poolRemoveOutliers" />
                      <Label htmlFor="poolRemoveOutliers">Remove Outliers</Label>
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Token Pool Chart"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>

            <FormProvider {...tokenHoldersChartForm}>
              <form onSubmit={tokenHoldersChartForm.handleSubmit(handleGetTokenHoldersChart)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get Token Holders Chart</CardTitle>
                    <CardDescription>Get token holder count data over time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Address</Label>
                      <Input {...tokenHoldersChartForm.register("token")} placeholder="Enter token address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time Interval</Label>
                      <select {...tokenHoldersChartForm.register("type")} className="w-full rounded border p-2">
                        <option value="">Select interval</option>
                        {["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"].map((interval) => (
                          <option key={interval} value={interval}>
                            {interval}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time From (Unix timestamp)</Label>
                      <Input {...tokenHoldersChartForm.register("time_from", { valueAsNumber: true })} type="number" placeholder="Enter start time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time To (Unix timestamp)</Label>
                      <Input {...tokenHoldersChartForm.register("time_to", { valueAsNumber: true })} type="number" placeholder="Enter end time" />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get Token Holders Chart"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>

            <FormProvider {...firstBuyersForm}>
              <form onSubmit={firstBuyersForm.handleSubmit(handleGetFirstBuyers)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Get First Buyers</CardTitle>
                    <CardDescription>Get the first 100 buyers of a token with PnL data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Token Address</Label>
                      <Input {...firstBuyersForm.register("token")} placeholder="Enter token address" />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Loading..." : "Get First Buyers"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </FormProvider>
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
            {error.errorDetails && <pre className="mt-2 text-sm whitespace-pre-wrap">{error.errorDetails}</pre>}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{result.action} Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
