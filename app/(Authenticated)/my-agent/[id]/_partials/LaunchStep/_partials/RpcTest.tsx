"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Server } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAccountInfo, getBalance, getBlock } from "@/http/controllers/agent/RpcController";

// Zod schemas for form validation
const accountInfoSchema = z.object({
  publicKey: z.string().min(1, "Public key is required"),
});

const balanceSchema = z.object({
  publicKey: z.string().min(1, "Public key is required"),
});

const blockSchema = z.object({
  slot: z.string().min(1, "Slot is required").refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    },
    { message: "Slot must be a non-negative number" }
  ),
});

type RpcResponse = {
  status: "success" | "error";
  data?: unknown;
  message?: string;
  errorDetails?: string;
};

type ResultData = {
  action: string;
  data: unknown;
};

export default function RpcTest() {
  // Form handlers for each tab
  const accountInfoForm = useForm({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: { publicKey: "" },
  });

  const balanceForm = useForm({
    resolver: zodResolver(balanceSchema),
    defaultValues: { publicKey: "" },
  });

  const blockForm = useForm({
    resolver: zodResolver(blockSchema),
    defaultValues: { slot: "" },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<RpcResponse | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<RpcResponse>, actionName: string) => {
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
        setResult({ action: actionName, data: response.data });
        setSuccess(`${actionName} completed successfully!`);
        console.log(`${actionName} response:`, response.data);
      }
    } catch (err) {
      // Create a safe serializable error object
      const safeError: RpcResponse = {
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
  const handleGetAccountInfo = (data: z.infer<typeof accountInfoSchema>) => {
    handleApiCall(() => getAccountInfo(data.publicKey), "Get Account Info");
    accountInfoForm.reset();
  };

  const handleGetBalance = (data: z.infer<typeof balanceSchema>) => {
    handleApiCall(() => getBalance(data.publicKey), "Get Balance");
    balanceForm.reset();
  };

  const handleGetBlock = (data: z.infer<typeof blockSchema>) => {
    handleApiCall(() => getBlock(parseInt(data.slot, 10)), "Get Block");
    blockForm.reset();
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
        <Server className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">RPC API Test</h1>
      </div>

      <Tabs defaultValue="accountInfo" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="accountInfo">Get Account Info</TabsTrigger>
          <TabsTrigger value="balance">Get Balance</TabsTrigger>
          <TabsTrigger value="block">Get Block</TabsTrigger>
        </TabsList>

        {/* Account Info Tab */}
        <TabsContent value="accountInfo">
          <FormProvider {...accountInfoForm}>
            <form onSubmit={accountInfoForm.handleSubmit(handleGetAccountInfo)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Account Info</CardTitle>
                  <CardDescription>Get account information for a Solana public key</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    name="publicKey" 
                    label="Public Key" 
                    placeholder="Enter Solana public key" 
                    required
                  />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Account Info"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Balance Tab */}
        <TabsContent value="balance">
          <FormProvider {...balanceForm}>
            <form onSubmit={balanceForm.handleSubmit(handleGetBalance)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Balance</CardTitle>
                  <CardDescription>Get balance for a Solana public key</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    name="publicKey" 
                    label="Public Key" 
                    placeholder="Enter Solana public key" 
                    required
                  />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Balance"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Block Tab */}
        <TabsContent value="block">
          <FormProvider {...blockForm}>
            <form onSubmit={blockForm.handleSubmit(handleGetBlock)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Block</CardTitle>
                  <CardDescription>Get a block at the specified slot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    name="slot" 
                    label="Slot" 
                    placeholder="Enter slot number" 
                    required
                    type="number"
                    min={0}
                  />
                  <Button 
                    parentClass="w-fit" 
                    type="submit" 
                    disabled={loading} 
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? "Loading..." : "Get Block"}
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
          <Alert variant="destructive" className="mb-4">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <AlertTitle className="mb-1 block font-semibold">Error</AlertTitle>
                <AlertDescription className="block whitespace-normal">{error.message}</AlertDescription>
                {getErrorDetails()}
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