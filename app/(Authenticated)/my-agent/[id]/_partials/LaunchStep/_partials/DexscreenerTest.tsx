"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getLatestTokenProfiles, 
  getLatestBoostedTokens, 
  getTopBoostedTokens,
  getTokenOrders,
  getPairsByChainAndPairAddress,
  searchPairs,
  getTokenPairs,
  getTokensByAddress
} from "@/http/controllers/agent/DexscreenerController";
import { 
  tokenOrdersSchema, 
  pairsByChainAndPairAddressSchema, 
  searchPairsSchema, 
  tokenPairsSchema, 
  tokensByAddressSchema 
} from "@/http/zodSchema/dexscreenerSchema";
import { DexScreenerApiError, DexScreenerResponse } from "@/types/dexscreener";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, LineChart } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type ResultData = {
  action: string;
  data: unknown;
};

export default function DexscreenerTest() {
  // Form handlers for each tab
  const tokenOrdersForm = useForm({
    resolver: zodResolver(tokenOrdersSchema),
    defaultValues: { chainId: "", tokenAddress: "" },
  });

  const pairsByChainForm = useForm({
    resolver: zodResolver(pairsByChainAndPairAddressSchema),
    defaultValues: { chainId: "", pairId: "" },
  });

  const searchPairsForm = useForm({
    resolver: zodResolver(searchPairsSchema),
    defaultValues: { query: "" },
  });

  const tokenPairsForm = useForm({
    resolver: zodResolver(tokenPairsSchema),
    defaultValues: { chainId: "", tokenAddress: "" },
  });

  const tokensByAddressForm = useForm({
    resolver: zodResolver(tokensByAddressSchema),
    defaultValues: { chainId: "", tokenAddresses: "" },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<DexScreenerApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Process the response from the API
  const processResponse = (response: DexScreenerResponse, actionName: string) => {
    if (response.status === "error") {
      setError(response);
      console.error(`${actionName} error:`, JSON.stringify(response));
    } else {
      setResult({ action: actionName, data: response.data });
      setSuccess(`${actionName} completed successfully!`);
      console.log(`${actionName} response:`, response.data);
    }
  };

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<DexScreenerResponse>, actionName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await apiCall();
      processResponse(response, actionName);
    } catch (err) {
      // Create a safe serializable error object
      const safeError: DexScreenerApiError = {
        status: "error",
        message: `Unexpected error: ${(err as Error).message}`,
        isRateLimit: false,
        errorDetails: JSON.stringify(err),
      };
      setError(safeError);
      console.error(`${actionName} unexpected error:`, JSON.stringify(safeError));
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleGetLatestTokenProfiles = () => {
    handleApiCall(() => getLatestTokenProfiles(), "Get Latest Token Profiles");
  };

  const handleGetLatestBoostedTokens = () => {
    handleApiCall(() => getLatestBoostedTokens(), "Get Latest Boosted Tokens");
  };

  const handleGetTopBoostedTokens = () => {
    handleApiCall(() => getTopBoostedTokens(), "Get Top Boosted Tokens");
  };

  const handleGetTokenOrders = (data: z.infer<typeof tokenOrdersSchema>) => {
    handleApiCall(() => getTokenOrders(data.chainId, data.tokenAddress), "Get Token Orders");
    tokenOrdersForm.reset();
  };

  const handleGetPairsByChain = (data: z.infer<typeof pairsByChainAndPairAddressSchema>) => {
    handleApiCall(
      () => getPairsByChainAndPairAddress(data.chainId, data.pairId),
      "Get Pairs by Chain and Pair Address"
    );
    pairsByChainForm.reset();
  };

  const handleSearchPairs = (data: z.infer<typeof searchPairsSchema>) => {
    handleApiCall(() => searchPairs(data.query), "Search Pairs");
    searchPairsForm.reset();
  };

  const handleGetTokenPairs = (data: z.infer<typeof tokenPairsSchema>) => {
    handleApiCall(() => getTokenPairs(data.chainId, data.tokenAddress), "Get Token Pairs");
    tokenPairsForm.reset();
  };

  const handleGetTokensByAddress = (data: z.infer<typeof tokensByAddressSchema>) => {
    handleApiCall(() => getTokensByAddress(data.chainId, data.tokenAddresses), "Get Tokens by Address");
    tokensByAddressForm.reset();
  };

  // Format JSON for display
  const formatJson = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return `Error formatting JSON: ${err}`;
    }
  };

  // Try to parse error details if they exist
  const getErrorDetails = () => {
    if (!error?.errorDetails) return null;

    try {
      const details = JSON.parse(error.errorDetails);
      return (
        <div className="mt-3 w-full">
          <div className="text-sm font-semibold">Error Details:</div>
          <div className="mt-1 max-h-32 w-full overflow-auto rounded bg-gray-100 p-2">
            <pre className="text-xs break-words whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </div>
      );
    } catch {
      return <div className="mt-3 w-full text-xs whitespace-normal">{error.errorDetails}</div>;
    }
  };

  return (
    <div className="mt-4 container mx-auto p-4">
      <div className="mb-6 flex items-center gap-2">
        <LineChart className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">Dexscreener API Test</h1>
      </div>

      <Tabs defaultValue="latest" className="w-full">
        {/* Make the tabs more responsive with a different layout on smaller screens */}
        <TabsList className="mb-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="latest" className="text-xs sm:text-sm">Latest Profiles</TabsTrigger>
          <TabsTrigger value="boosted" className="text-xs sm:text-sm">Latest Boosted</TabsTrigger>
          <TabsTrigger value="topboosted" className="text-xs sm:text-sm">Top Boosted</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">Token Orders</TabsTrigger>
          <TabsTrigger value="pairs" className="text-xs sm:text-sm">Pairs by Chain</TabsTrigger>
          <TabsTrigger value="search" className="text-xs sm:text-sm">Search Pairs</TabsTrigger>
          <TabsTrigger value="tokenpairs" className="text-xs sm:text-sm">Token Pairs</TabsTrigger>
          <TabsTrigger value="tokensbyaddress" className="text-xs sm:text-sm">Tokens by Address</TabsTrigger>
        </TabsList>

        {/* Latest Profiles Tab */}
        <TabsContent value="latest">
          <Card>
            <CardHeader>
              <CardTitle>Get Latest Token Profiles</CardTitle>
              <CardDescription>Fetch the latest token profiles from Dexscreener</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                parentClass="w-fit" 
                onClick={handleGetLatestTokenProfiles} 
                disabled={loading} 
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? "Loading..." : "Get Latest Token Profiles"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Latest Boosted Tab */}
        <TabsContent value="boosted">
          <Card>
            <CardHeader>
              <CardTitle>Get Latest Boosted Tokens</CardTitle>
              <CardDescription>Fetch the latest boosted tokens from Dexscreener</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                parentClass="w-fit" 
                onClick={handleGetLatestBoostedTokens} 
                disabled={loading} 
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? "Loading..." : "Get Latest Boosted Tokens"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Boosted Tab */}
        <TabsContent value="topboosted">
          <Card>
            <CardHeader>
              <CardTitle>Get Top Boosted Tokens</CardTitle>
              <CardDescription>Fetch tokens with most active boosts from Dexscreener</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                parentClass="w-fit" 
                onClick={handleGetTopBoostedTokens} 
                disabled={loading} 
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? "Loading..." : "Get Top Boosted Tokens"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Orders Tab */}
        <TabsContent value="orders">
          <FormProvider {...tokenOrdersForm}>
            <form onSubmit={tokenOrdersForm.handleSubmit(handleGetTokenOrders)}>
              <Card>
                <CardHeader>
                  <CardTitle>Check Token Orders</CardTitle>
                  <CardDescription>Get orders paid for a specific token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="chainId" label="Chain ID" placeholder="e.g., ethereum, solana, bsc" required />
                  <Input name="tokenAddress" label="Token Address" placeholder="Enter token address" required />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Token Orders"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Pairs by Chain Tab */}
        <TabsContent value="pairs">
          <FormProvider {...pairsByChainForm}>
            <form onSubmit={pairsByChainForm.handleSubmit(handleGetPairsByChain)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Pairs by Chain</CardTitle>
                  <CardDescription>Get pairs by chain ID and pair address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="chainId" label="Chain ID" placeholder="e.g., ethereum, solana, bsc" required />
                  <Input name="pairId" label="Pair ID" placeholder="Enter pair ID" required />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Pairs"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Search Pairs Tab */}
        <TabsContent value="search">
          <FormProvider {...searchPairsForm}>
            <form onSubmit={searchPairsForm.handleSubmit(handleSearchPairs)}>
              <Card>
                <CardHeader>
                  <CardTitle>Search Pairs</CardTitle>
                  <CardDescription>Search for pairs matching a query</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="query" label="Search Query" placeholder="e.g., SOL/USDC" required />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Searching..." : "Search Pairs"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Token Pairs Tab */}
        <TabsContent value="tokenpairs">
          <FormProvider {...tokenPairsForm}>
            <form onSubmit={tokenPairsForm.handleSubmit(handleGetTokenPairs)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Token Pairs</CardTitle>
                  <CardDescription>Get all pools for a specific token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="chainId" label="Chain ID" placeholder="e.g., ethereum, solana, bsc" required />
                  <Input name="tokenAddress" label="Token Address" placeholder="Enter token address" required />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Token Pairs"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Tokens by Address Tab */}
        <TabsContent value="tokensbyaddress">
          <FormProvider {...tokensByAddressForm}>
            <form onSubmit={tokensByAddressForm.handleSubmit(handleGetTokensByAddress)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Tokens by Address</CardTitle>
                  <CardDescription>Get tokens by address (up to 30 comma-separated addresses)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="chainId" label="Chain ID" placeholder="e.g., ethereum, solana, bsc" required />
                  <Input 
                    name="tokenAddresses" 
                    label="Token Addresses" 
                    placeholder="Enter comma-separated token addresses (up to 30)" 
                    required 
                  />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Tokens"}
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
          <Alert 
            variant={error.isRateLimit ? "default" : "destructive"} 
            className={`mb-4 ${error.isRateLimit ? "border-yellow-200 bg-yellow-50 text-yellow-800" : ""}`}
          >
            <div className="flex w-full flex-col">
              <div className="flex items-start">
                <div className="mt-0.5 mr-2">
                  {error.isRateLimit ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <AlertTitle className="mb-1 block font-semibold">
                    {error.isRateLimit ? "Rate Limit Exceeded" : "Error"}
                  </AlertTitle>
                  <AlertDescription className="block whitespace-normal">{error.message}</AlertDescription>
                  {error.isRateLimit && (
                    <div className="mt-2 text-sm whitespace-normal">
                      Dexscreener limits the number of API requests. Please wait a few minutes before trying again.
                    </div>
                  )}
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
          <Card>
            <CardHeader>
              <CardTitle>{result.action} Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto rounded bg-gray-100 p-4">
                <pre className="text-sm break-words whitespace-pre-wrap">{formatJson(result.data)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 