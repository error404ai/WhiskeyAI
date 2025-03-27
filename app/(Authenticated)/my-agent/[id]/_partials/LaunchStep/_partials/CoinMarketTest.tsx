"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFearAndGreedHistorical, getFearAndGreedLatest, getMetadata, getQuotesHistorical, getQuotesLatest, getTrendingGainersLosers, getTrendingLatest, getTrendingMostVisited } from "@/http/controllers/externalApi/coinmarketController";
import { metadataSchema, quotesHistoricalSchema, quotesLatestSchema, trendingBaseSchema, trendingGainersLosersSchema } from "@/http/zodSchema/coinmarketSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, LineChart } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

interface ResultData {
  action: string;
  data: unknown;
}

interface CoinMarketError {
  status: {
    error_code: number;
    error_message: string;
  };
}

// Helper function to filter out empty parameters
const filterEmptyParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

export default function CoinMarketTest() {
  // Form handlers for each tab
  const trendingForm = useForm({
    resolver: zodResolver(trendingBaseSchema),
    defaultValues: { limit: "", start: "", time_period: "24h", convert: "", convert_id: "" },
  });

  const gainersLosersForm = useForm({
    resolver: zodResolver(trendingGainersLosersSchema),
    defaultValues: { limit: "", start: "", time_period: "24h", convert: "", convert_id: "", sort: "percent_change_24h", sort_dir: "desc" },
  });

  const quotesHistoricalForm = useForm({
    resolver: zodResolver(quotesHistoricalSchema),
    defaultValues: { id: "", interval: "24h", skip_invalid: false },
  });

  const quotesLatestForm = useForm({
    resolver: zodResolver(quotesLatestSchema),
    defaultValues: { skip_invalid: false },
  });

  const metadataForm = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: { skip_invalid: false },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<unknown>, actionName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await apiCall();

      // Check if response is an error response from CoinMarketCap
      const errorResponse = response as CoinMarketError;
      if (errorResponse?.status?.error_code) {
        setError(errorResponse.status.error_message);
        console.error(`${actionName} error:`, errorResponse.status.error_message);
      } else {
        setResult({ action: actionName, data: response });
        setSuccess(`${actionName} completed successfully!`);
        console.log(`${actionName} response:`, response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error(`${actionName} unexpected error:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleGetFearAndGreedLatest = () => {
    handleApiCall(() => getFearAndGreedLatest(), "Get Fear and Greed Latest");
  };

  const handleGetFearAndGreedHistorical = () => {
    handleApiCall(() => getFearAndGreedHistorical(), "Get Fear and Greed Historical");
  };

  const handleGetTrendingMostVisited = (data: z.infer<typeof trendingBaseSchema>) => {
    const params = filterEmptyParams({
      ...data,
      limit: data.limit ? parseInt(data.limit) : undefined,
      start: data.start ? parseInt(data.start) : undefined,
    });
    handleApiCall(() => getTrendingMostVisited(params), "Get Trending Most Visited");
    trendingForm.reset();
  };

  const handleGetTrendingGainersLosers = (data: z.infer<typeof trendingGainersLosersSchema>) => {
    const params = filterEmptyParams({
      ...data,
      limit: data.limit ? parseInt(data.limit) : undefined,
      start: data.start ? parseInt(data.start) : undefined,
    });
    handleApiCall(() => getTrendingGainersLosers(params), "Get Trending Gainers & Losers");
    gainersLosersForm.reset();
  };

  const handleGetTrendingLatest = (data: z.infer<typeof trendingBaseSchema>) => {
    const params = filterEmptyParams({
      ...data,
      limit: data.limit ? parseInt(data.limit) : undefined,
      start: data.start ? parseInt(data.start) : undefined,
    });
    handleApiCall(() => getTrendingLatest(params), "Get Trending Latest");
    trendingForm.reset();
  };

  const handleGetQuotesHistorical = (data: z.infer<typeof quotesHistoricalSchema>) => {
    const { id, interval, count, ...rest } = data;
    const params: {
      id: string;
      interval: typeof interval;
      count?: number;
      symbol?: string;
      time_start?: string;
      time_end?: string;
      convert?: string;
      convert_id?: string;
      aux?: string;
      skip_invalid?: boolean;
    } = {
      id,
      interval,
      ...(count ? { count: parseInt(count) } : {}),
      ...filterEmptyParams(rest),
    };
    handleApiCall(() => getQuotesHistorical(params), "Get Quotes Historical");
    quotesHistoricalForm.reset();
  };

  const handleGetQuotesLatest = (data: z.infer<typeof quotesLatestSchema>) => {
    const params = filterEmptyParams({
      ...data,
      // Ensure at least one identifier is present
      id: data.id || undefined,
      slug: data.slug || undefined,
      symbol: data.symbol || undefined,
    });
    handleApiCall(() => getQuotesLatest(params), "Get Quotes Latest");
    quotesLatestForm.reset();
  };

  const handleGetMetadata = (data: z.infer<typeof metadataSchema>) => {
    const params = filterEmptyParams({
      ...data,
      // Ensure at least one identifier is present
      id: data.id || undefined,
      slug: data.slug || undefined,
      symbol: data.symbol || undefined,
      address: data.address || undefined,
    });
    handleApiCall(() => getMetadata(params), "Get Metadata");
    metadataForm.reset();
  };

  // Try to parse error details if they exist
  const getErrorDetails = () => {
    if (!error) return null;
    return <div className="mt-3 w-full text-xs whitespace-normal">{error}</div>;
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <div className="mb-6 flex items-center gap-2">
        <LineChart className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">CoinMarket API Test</h1>
      </div>

      <Tabs defaultValue="fear-and-greed-latest" className="w-full">
        <TabsList className="mb-4 flex h-fit flex-wrap gap-2">
          <TabsTrigger value="fear-and-greed-latest" className="text-xs sm:text-sm">
            Fear & Greed Latest
          </TabsTrigger>
          <TabsTrigger value="fear-and-greed-historical" className="text-xs sm:text-sm">
            Fear & Greed Historical
          </TabsTrigger>
          <TabsTrigger value="trending-most-visited" className="text-xs sm:text-sm">
            Trending Most Visited
          </TabsTrigger>
          <TabsTrigger value="trending-gainers-losers" className="text-xs sm:text-sm">
            Trending Gainers & Losers
          </TabsTrigger>
          <TabsTrigger value="trending-latest" className="text-xs sm:text-sm">
            Trending Latest
          </TabsTrigger>
          <TabsTrigger value="quotes-historical" className="text-xs sm:text-sm">
            Quotes Historical
          </TabsTrigger>
          <TabsTrigger value="quotes-latest" className="text-xs sm:text-sm">
            Quotes Latest
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs sm:text-sm">
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* Fear & Greed Latest Tab */}
        <TabsContent value="fear-and-greed-latest">
          <Card>
            <CardHeader>
              <CardTitle>Get Fear and Greed Latest</CardTitle>
              <CardDescription>Fetch the latest fear and greed index data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button parentClass="w-fit" onClick={handleGetFearAndGreedLatest} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Fear and Greed Latest"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fear & Greed Historical Tab */}
        <TabsContent value="fear-and-greed-historical">
          <Card>
            <CardHeader>
              <CardTitle>Get Fear and Greed Historical</CardTitle>
              <CardDescription>Fetch historical fear and greed index data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button parentClass="w-fit" onClick={handleGetFearAndGreedHistorical} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Fear and Greed Historical"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Most Visited Tab */}
        <TabsContent value="trending-most-visited">
          <FormProvider {...trendingForm}>
            <form onSubmit={trendingForm.handleSubmit(handleGetTrendingMostVisited)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Trending Most Visited</CardTitle>
                  <CardDescription>Fetch the most visited cryptocurrencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input {...trendingForm.register("limit")} placeholder="Number of results (1-1000)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input {...trendingForm.register("start")} placeholder="Starting point for pagination" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <select {...trendingForm.register("time_period")} className="w-full rounded border p-2">
                      <option value="24h">24 Hours</option>
                      <option value="30d">30 Days</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Convert</Label>
                    <Input {...trendingForm.register("convert")} placeholder="e.g. USD,BTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert ID</Label>
                    <Input {...trendingForm.register("convert_id")} placeholder="e.g. 1,2781" />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Trending Most Visited"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Trending Gainers & Losers Tab */}
        <TabsContent value="trending-gainers-losers">
          <FormProvider {...gainersLosersForm}>
            <form onSubmit={gainersLosersForm.handleSubmit(handleGetTrendingGainersLosers)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Trending Gainers & Losers</CardTitle>
                  <CardDescription>Fetch cryptocurrencies with the highest and lowest price changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input {...gainersLosersForm.register("limit")} placeholder="Number of results (1-1000)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input {...gainersLosersForm.register("start")} placeholder="Starting point for pagination" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <select {...gainersLosersForm.register("time_period")} className="w-full rounded border p-2">
                      <option value="24h">24 Hours</option>
                      <option value="30d">30 Days</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort</Label>
                    <select {...gainersLosersForm.register("sort")} className="w-full rounded border p-2">
                      <option value="percent_change_24h">24h Price Change</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Direction</Label>
                    <select {...gainersLosersForm.register("sort_dir")} className="w-full rounded border p-2">
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Convert</Label>
                    <Input {...gainersLosersForm.register("convert")} placeholder="e.g. USD,BTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert ID</Label>
                    <Input {...gainersLosersForm.register("convert_id")} placeholder="e.g. 1,2781" />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Trending Gainers & Losers"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Trending Latest Tab */}
        <TabsContent value="trending-latest">
          <FormProvider {...trendingForm}>
            <form onSubmit={trendingForm.handleSubmit(handleGetTrendingLatest)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Trending Latest</CardTitle>
                  <CardDescription>Fetch the latest trending cryptocurrencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input {...trendingForm.register("limit")} placeholder="Number of results (1-1000)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input {...trendingForm.register("start")} placeholder="Starting point for pagination" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <select {...trendingForm.register("time_period")} className="w-full rounded border p-2">
                      <option value="24h">24 Hours</option>
                      <option value="30d">30 Days</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Convert</Label>
                    <Input {...trendingForm.register("convert")} placeholder="e.g. USD,BTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert ID</Label>
                    <Input {...trendingForm.register("convert_id")} placeholder="e.g. 1,2781" />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Trending Latest"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Quotes Historical Tab */}
        <TabsContent value="quotes-historical">
          <FormProvider {...quotesHistoricalForm}>
            <form onSubmit={quotesHistoricalForm.handleSubmit(handleGetQuotesHistorical)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Quotes Historical</CardTitle>
                  <CardDescription>Fetch historical price quotes for cryptocurrencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID</Label>
                    <Input {...quotesHistoricalForm.register("id")} placeholder="Cryptocurrency ID" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input {...quotesHistoricalForm.register("symbol")} placeholder="e.g. BTC,ETH" />
                  </div>
                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <select {...quotesHistoricalForm.register("interval")} className="w-full rounded border p-2">
                      <option value="5m">5 Minutes</option>
                      <option value="15m">15 Minutes</option>
                      <option value="30m">30 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="2h">2 Hours</option>
                      <option value="4h">4 Hours</option>
                      <option value="6h">6 Hours</option>
                      <option value="12h">12 Hours</option>
                      <option value="24h">24 Hours</option>
                      <option value="1d">1 Day</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="60d">60 Days</option>
                      <option value="90d">90 Days</option>
                      <option value="365d">365 Days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Count</Label>
                    <Input {...quotesHistoricalForm.register("count")} placeholder="Number of intervals" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Start</Label>
                    <Input {...quotesHistoricalForm.register("time_start")} placeholder="Start timestamp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time End</Label>
                    <Input {...quotesHistoricalForm.register("time_end")} placeholder="End timestamp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert</Label>
                    <Input {...quotesHistoricalForm.register("convert")} placeholder="e.g. USD,BTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert ID</Label>
                    <Input {...quotesHistoricalForm.register("convert_id")} placeholder="e.g. 1,2781" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aux</Label>
                    <Input {...quotesHistoricalForm.register("aux")} placeholder="e.g. price,volume,market_cap" />
                  </div>
                  <div className="space-y-2">
                    <Label>Skip Invalid</Label>
                    <Input type="checkbox" {...quotesHistoricalForm.register("skip_invalid")} />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Quotes Historical"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Quotes Latest Tab */}
        <TabsContent value="quotes-latest">
          <FormProvider {...quotesLatestForm}>
            <form onSubmit={quotesLatestForm.handleSubmit(handleGetQuotesLatest)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Quotes Latest</CardTitle>
                  <CardDescription>Fetch the latest price quotes for cryptocurrencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID</Label>
                    <Input {...quotesLatestForm.register("id")} placeholder="Cryptocurrency ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input {...quotesLatestForm.register("slug")} placeholder="e.g. bitcoin,ethereum" />
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input {...quotesLatestForm.register("symbol")} placeholder="e.g. BTC,ETH" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert</Label>
                    <Input {...quotesLatestForm.register("convert")} placeholder="e.g. USD,BTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Convert ID</Label>
                    <Input {...quotesLatestForm.register("convert_id")} placeholder="e.g. 1,2781" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aux</Label>
                    <Input {...quotesLatestForm.register("aux")} placeholder="e.g. num_market_pairs,cmc_rank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Skip Invalid</Label>
                    <Input type="checkbox" {...quotesLatestForm.register("skip_invalid")} />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Quotes Latest"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <FormProvider {...metadataForm}>
            <form onSubmit={metadataForm.handleSubmit(handleGetMetadata)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Metadata</CardTitle>
                  <CardDescription>Fetch metadata for cryptocurrencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID</Label>
                    <Input {...metadataForm.register("id")} placeholder="Cryptocurrency ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input {...metadataForm.register("slug")} placeholder="e.g. bitcoin,ethereum" />
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input {...metadataForm.register("symbol")} placeholder="e.g. BTC,ETH" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input {...metadataForm.register("address")} placeholder="Contract address" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aux</Label>
                    <Input {...metadataForm.register("aux")} placeholder="e.g. urls,logo,description" />
                  </div>
                  <div className="space-y-2">
                    <Label>Skip Invalid</Label>
                    <Input type="checkbox" {...metadataForm.register("skip_invalid")} />
                  </div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Loading..." : "Get Metadata"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Results</h2>

        {error && (
          <Alert variant="destructive" className="mb-4 text-red-500">
            <div className="flex w-full flex-col">
              <div className="flex items-start">
                <div className="mt-0.5 mr-2">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <AlertTitle className="mb-1 block font-semibold">Error</AlertTitle>
                  <AlertDescription className="block whitespace-normal">{error}</AlertDescription>
                  {getErrorDetails()}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <AlertTitle className="mb-1 block font-semibold">Success</AlertTitle>
                <AlertDescription className="block whitespace-normal">{success}</AlertDescription>
              </div>
            </div>
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
    </div>
  );
}
