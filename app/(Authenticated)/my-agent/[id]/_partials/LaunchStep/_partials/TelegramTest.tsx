/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getChannelMessages, getEntityInfo, sendCode, testConnection, verifyCode } from "@/server/controllers/agent/TelegramAgentController";
import { channelMessagesSchema, sendCodeSchema, usernameSchema, verifyCodeSchema } from "@/server/zodSchema/telegramSchema";
import { TelegramApiError, TelegramResponse } from "@/types/telegram.d";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, KeyRound, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
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
    defaultValues: { channelUsername: "", limit: 10 },
  });

  const sendCodeForm = useForm({
    resolver: zodResolver(sendCodeSchema),
    defaultValues: { phoneNumber: "" },
  });

  const verifyCodeForm = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { 
      sessionId: "",
      phoneNumber: "",
      phoneCode: "", 
      password: "" 
    },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<TelegramApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [authStep, setAuthStep] = useState<'sendCode' | 'verifyCode'>('sendCode');
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string;
    phoneNumber: string;
    phoneCodeHash: string;
  } | null>(null);

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
    handleApiCall(() => getChannelMessages(data.channelUsername, data.limit), "Get Channel Messages");
    channelMessagesForm.reset();
  };

  const handleSendCode = async (data: z.infer<typeof sendCodeSchema>) => {
    const response = await handleApiCall(() => sendCode(data.phoneNumber), "Send Code");
    
    if (response?.status === "success" && response.data) {
      // Store session info for the verification step
      setSessionInfo({
        sessionId: response.data.sessionId,
        phoneNumber: data.phoneNumber,
        phoneCodeHash: response.data.phoneCodeHash,
      });
      
      // Pre-fill the verification form
      verifyCodeForm.setValue("sessionId", response.data.sessionId);
      verifyCodeForm.setValue("phoneNumber", data.phoneNumber);
      
      // Show code input form
      setAuthStep('verifyCode');
      setSuccess(`Verification code sent to ${data.phoneNumber}. Please enter the code.`);
    }
  };

  const handleVerifyCode = async (data: z.infer<typeof verifyCodeSchema>) => {
    const response = await handleApiCall(
      () => verifyCode(data.sessionId, data.phoneNumber, data.phoneCode, data.password),
      "Authentication"
    );
    
    if (response?.status === "success") {
      // Reset forms and state after successful authentication
      setAuthStep('sendCode');
      sendCodeForm.reset();
      verifyCodeForm.reset();
      setSessionInfo(null);
    }
  };

  // Go back to the phone number step
  const handleBack = () => {
    setAuthStep('sendCode');
    setError(null);
    setSuccess(null);
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
        <TabsList className="mb-4 grid grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="authenticate">Authenticate</TabsTrigger>
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

        {/* Authentication Tab */}
        <TabsContent value="authenticate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyRound className="mr-2 h-5 w-5" /> Telegram Authentication
              </CardTitle>
              <CardDescription>Authenticate with Telegram to get a session string</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authStep === 'sendCode' ? (
                // Step 1: Enter phone number and send code
                <FormProvider {...sendCodeForm}>
                  <form onSubmit={sendCodeForm.handleSubmit(handleSendCode)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input 
                        {...sendCodeForm.register("phoneNumber")} 
                        placeholder="With country code (e.g. +12345678900)" 
                        disabled={loading}
                      />
                      {sendCodeForm.formState.errors.phoneNumber && (
                        <p className="text-xs text-red-500">{sendCodeForm.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                      {loading ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                  </form>
                </FormProvider>
              ) : (
                // Step 2: Enter verification code
                <FormProvider {...verifyCodeForm}>
                  <form onSubmit={verifyCodeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                    <input type="hidden" {...verifyCodeForm.register("sessionId")} />
                    <input type="hidden" {...verifyCodeForm.register("phoneNumber")} />
                    
                    {sessionInfo && (
                      <div className="mb-2 text-sm">
                        <span className="font-medium">Phone:</span> {sessionInfo.phoneNumber}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Verification Code</label>
                      <Input 
                        {...verifyCodeForm.register("phoneCode")} 
                        placeholder="Code from Telegram/SMS" 
                        disabled={loading}
                      />
                      {verifyCodeForm.formState.errors.phoneCode && (
                        <p className="text-xs text-red-500">{verifyCodeForm.formState.errors.phoneCode.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Two-Factor Password (optional)</label>
                      <Input 
                        {...verifyCodeForm.register("password")} 
                        type="password"
                        placeholder="Leave blank if not using 2FA" 
                        disabled={loading}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? "Verifying..." : "Verify Code"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBack}
                        disabled={loading}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              )}

              {result?.action === "Authentication" && result.data?.sessionString && (
                <div className="mt-4 rounded border border-green-200 bg-green-50 p-4">
                  <h3 className="mb-2 font-medium text-green-800">Authentication Successful</h3>
                  <p className="mb-2 text-sm text-green-700">
                    Add this session string to your environment variables as TELEGRAM_SESSION:
                  </p>
                  <div className="max-h-32 overflow-x-auto rounded bg-white p-2">
                    <pre className="text-xs">{result.data.sessionString}</pre>
                  </div>
                </div>
              )}
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
                    <Input 
                      name="limit" 
                      label="Limit" 
                      type="number" 
                      min={1} 
                      max={100} 
                      defaultValue={10} 
                      className="w-32" 
                    />
                    <span className="text-sm text-muted-foreground">Number of messages (1-100)</span>
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

        {result && result.action !== 'Authentication' && (
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