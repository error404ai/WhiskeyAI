/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChannelMessages, getEntityInfo, testConnection } from "@/server/controllers/agent/TelegramAgentController";
import { channelMessagesSchema, usernameSchema } from "@/server/zodSchema/telegramSchema";
import { TelegramApiError, TelegramResponse } from "@/types/telegram.d";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export default function TelegramTest() {
  // Form handlers for each tab
  const usernameForm = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: "" },
  });

  const channelMessagesForm = useForm({
    resolver: zodResolver(channelMessagesSchema),
    defaultValues: { channelUsername: "", limit: "10" },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<TelegramApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Process the response from the API
  const processResponse = (response: TelegramResponse, actionName: string) => {
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
  const handleApiCall = async (apiCall: () => Promise<TelegramResponse>, actionName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await apiCall();
      processResponse(response, actionName);
      return response;
    } catch (err) {
      // Create a safe serializable error object
      const safeError: TelegramApiError = {
        status: "error",
        message: `Unexpected error: ${(err as Error).message}`,
        errorDetails: JSON.stringify(err),
      };
      setError(safeError);
      console.error(`${actionName} unexpected error:`, JSON.stringify(safeError));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleTestConnection = () => {
    handleApiCall(() => testConnection(), "Test Connection");
  };

  const handleGetEntity = (data: z.infer<typeof usernameSchema>) => {
    handleApiCall(() => getEntityInfo(data.username), "Get Entity");
    usernameForm.reset();
  };

  const handleGetChannelMessages = (data: z.infer<typeof channelMessagesSchema>) => {
    handleApiCall(() => getChannelMessages(data.channelUsername, Number(data.limit)), "Get Channel Messages");
    channelMessagesForm.reset();
  };

  // Format JSON for display
  const formatJson = (data: any) => {
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
          <div className="mt-1 max-h-60 w-full overflow-auto rounded bg-gray-100 p-2">
            <pre className="w-full text-xs break-words whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </div>
      );
    } catch (e) {
      return <div className="mt-3 w-full text-xs whitespace-normal">{error.errorDetails}</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">Telegram API Test</h1>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="entity">Entity Info</TabsTrigger>
          <TabsTrigger value="channel">Channel Messages</TabsTrigger>
        </TabsList>

        {/* Connection Test Tab */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Test Telegram Connection</CardTitle>
              <CardDescription>Check if your Telegram credentials are valid</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleTestConnection} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entity Info Tab */}
        <TabsContent value="entity">
          <FormProvider {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(handleGetEntity)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Entity Info</CardTitle>
                  <CardDescription>Get information about a Telegram user or channel by username</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="username" label="Username" placeholder="Username without @ (e.g. telegram)" required />
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Getting Info..." : "Get Entity Info"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Channel Messages Tab */}
        <TabsContent value="channel">
          <FormProvider {...channelMessagesForm}>
            <form onSubmit={channelMessagesForm.handleSubmit(handleGetChannelMessages)}>
              <Card>
                <CardHeader>
                  <CardTitle>Get Channel Messages</CardTitle>
                  <CardDescription>Retrieve messages from a public Telegram channel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="channelUsername" label="Channel Username" placeholder="Channel username without @" required />
                  <div className="flex items-center gap-2">
                    <Input name="limit" label="Limit" type="number" min={1} max={100} defaultValue={10} className="w-32" />
                    <span className="text-muted-foreground text-sm">Number of messages (1-100)</span>
                  </div>
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Getting Messages..." : "Get Messages"}
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
                  <AlertDescription className="block whitespace-normal">{error.message}</AlertDescription>
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
              <pre className="text-sm whitespace-pre-wrap">{formatJson(result.data)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
