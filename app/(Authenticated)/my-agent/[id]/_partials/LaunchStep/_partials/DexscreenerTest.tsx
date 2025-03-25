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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, LineChart } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

interface ResultData {
  action: string;
  data: unknown;
}

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
      
      // Check if response is an error response from Dexscreener
      if (response && typeof response === 'object' && 'error' in response) {
        const errorMessage = typeof response.error === 'string' ? response.error : 'An error occurred';
        setError(errorMessage);
        console.error(`${actionName} error:`, errorMessage);
      } else {
        setResult({ action: actionName, data: response });
        setSuccess(`${actionName} completed successfully!`);
        console.log(`${actionName} response:`, response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error(`${actionName} unexpected error:`, err);
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

  return (
    <div className="mt-4 container mx-auto p-4">
      <div className="mb-6 flex items-center gap-2">
        <LineChart className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">Dexscreener API Test</h1>
      </div>

      <Tabs defaultValue="latest" className="w-full">
        {/* Make the tabs more responsive with a different layout on smaller screens */}
        <TabsList className="mb-4 h-fit flex flex-wrap gap-2">
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
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 