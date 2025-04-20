"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import * as SettingsController from "@/server/controllers/admin/SettingsController";
import * as TelegramAgentController from "@/server/controllers/agent/TelegramAgentController";
import { sendCodeSchema, verifyCodeSchema } from "@/server/zodSchema/telegramSchema";
import { TelegramApiError } from "@/types/telegram.d";
import { AlertCircle, CheckCircle, KeyRound, RefreshCw } from "lucide-react";

// Telegram settings form schema
const telegramSettingsSchema = z.object({
  telegramApiId: z.string().min(1, "API ID is required"),
  telegramApiHash: z.string().min(1, "API Hash is required"),
  telegramPhoneNumber: z.string().min(1, "Phone number is required"),
  telegramBotToken: z.string().optional(),
});

type TelegramAuthenticationPanelProps = {
  settings: {
    telegramApiId?: string;
    telegramApiHash?: string;
    telegramPhoneNumber?: string;
    telegramBotToken?: string;
    telegramSessionString?: string;
    isTelegramAuthenticated?: boolean;
  };
  onUpdate: () => void;
};

export function TelegramAuthenticationPanel({ settings, onUpdate }: TelegramAuthenticationPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<"credentials" | "sendCode" | "verifyCode">("credentials");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    sessionId: string;
    phoneNumber: string;
    phoneCodeHash: string;
  } | null>(null);

  // Form for Telegram API credentials
  const telegramSettingsForm = useForm<z.infer<typeof telegramSettingsSchema>>({
    resolver: zodResolver(telegramSettingsSchema),
    defaultValues: {
      telegramApiId: settings.telegramApiId || "",
      telegramApiHash: settings.telegramApiHash || "",
      telegramPhoneNumber: settings.telegramPhoneNumber || "",
      telegramBotToken: settings.telegramBotToken || "",
    },
  });

  // Forms for authentication steps
  const sendCodeForm = useForm({
    resolver: zodResolver(sendCodeSchema),
    defaultValues: {
      phoneNumber: settings.telegramPhoneNumber || "",
    },
  });

  const verifyCodeForm = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      sessionId: "",
      phoneNumber: settings.telegramPhoneNumber || "",
      phoneCode: "",
      password: "",
    },
  });

  // Save Telegram settings
  const onSaveSettings = async (data: z.infer<typeof telegramSettingsSchema>) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await SettingsController.updateTelegramSettings(data);

      if (response.success) {
        setSuccess("Telegram settings saved successfully.");
        onUpdate();
      } else {
        setError(response.error || "Failed to save settings.");
      }
    } catch (err) {
      setError(`Unexpected error: ${(err as Error).message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Test Telegram connection
  const handleTestConnection = async () => {
    setIsAuthenticating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await TelegramAgentController.testConnection();

      if (response.status === "success") {
        setSuccess("Connection successful!");
      } else {
        setError(`Connection failed: ${(response as TelegramApiError).message}`);
      }
    } catch (err) {
      setError(`Connection error: ${(err as Error).message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Start authentication by sending verification code
  const handleSendCode = async (data: z.infer<typeof sendCodeSchema>) => {
    setIsAuthenticating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await TelegramAgentController.sendCode(data.phoneNumber);

      if (response.status === "success" && response.data) {
        // Store session info
        setSessionInfo({
          sessionId: response.data.sessionId,
          phoneNumber: data.phoneNumber,
          phoneCodeHash: response.data.phoneCodeHash,
        });

        // Pre-fill verification form
        verifyCodeForm.setValue("sessionId", response.data.sessionId);
        verifyCodeForm.setValue("phoneNumber", data.phoneNumber);

        setAuthStep("verifyCode");
        setSuccess(`Verification code sent to ${data.phoneNumber}. Please enter the code.`);
      } else {
        setError(`Failed to send code: ${(response as TelegramApiError).message}`);
      }
    } catch (err) {
      setError(`Error sending code: ${(err as Error).message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Verify the code and complete authentication
  const handleVerifyCode = async (data: z.infer<typeof verifyCodeSchema>) => {
    setIsAuthenticating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await TelegramAgentController.verifyCode(data.sessionId, data.phoneNumber, data.phoneCode, data.password);

      if (response.status === "success") {
        // Save the session string to database
        const authResponse = await SettingsController.setTelegramAuthenticated(true, response.data?.sessionString);

        if (authResponse.success) {
          setSuccess("Telegram authentication completed successfully!");
          setAuthStep("credentials");
          onUpdate();
        } else {
          setError(`Failed to save authentication: ${authResponse.error}`);
        }
      } else {
        setError(`Verification failed: ${(response as TelegramApiError).message}`);
      }
    } catch (err) {
      setError(`Error verifying code: ${(err as Error).message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Reset authentication
  const handleResetAuthentication = async () => {
    setIsAuthenticating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await SettingsController.setTelegramAuthenticated(false);

      if (response.success) {
        setSuccess("Telegram authentication has been reset.");
        onUpdate();
      } else {
        setError(`Failed to reset authentication: ${response.error}`);
      }
    } catch (err) {
      setError(`Error resetting authentication: ${(err as Error).message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Go back to previous step
  const handleBackToCredentials = () => {
    setAuthStep("credentials");
    setError(null);
    setSuccess(null);
  };

  // Go to send code step
  const startAuthentication = () => {
    setAuthStep("sendCode");
    sendCodeForm.setValue("phoneNumber", telegramSettingsForm.getValues().telegramPhoneNumber);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            <CardTitle>Telegram Authentication</CardTitle>
          </div>
          {settings.isTelegramAuthenticated && <Badge variant="success">Authenticated</Badge>}
        </div>
        <CardDescription>Configure and authenticate Telegram integration for agent functionality</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {authStep === "credentials" ? (
          <Form {...telegramSettingsForm}>
            <form onSubmit={telegramSettingsForm.handleSubmit(onSaveSettings)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={telegramSettingsForm.control}
                  name="telegramApiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API ID</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormDescription>Telegram API ID from my.telegram.org</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={telegramSettingsForm.control}
                  name="telegramApiHash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Hash</FormLabel>
                      <FormControl>
                        <Input placeholder="abcdef1234567890" {...field} />
                      </FormControl>
                      <FormDescription>Telegram API Hash from my.telegram.org</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={telegramSettingsForm.control}
                  name="telegramPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+12345678900" {...field} />
                      </FormControl>
                      <FormDescription>Phone number with country code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={telegramSettingsForm.control}
                  name="telegramBotToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Token (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" {...field} />
                      </FormControl>
                      <FormDescription>Bot token from @BotFather (if using a bot)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Form>
        ) : authStep === "sendCode" ? (
          <FormProvider {...sendCodeForm}>
            <form onSubmit={sendCodeForm.handleSubmit(handleSendCode)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input name="phoneNumber" placeholder="With country code (e.g. +12345678900)" disabled={isAuthenticating} />
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleBackToCredentials} disabled={isAuthenticating}>
                Back
              </Button>
              <Button type="submit" disabled={isAuthenticating}>
                {isAuthenticating ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
          </FormProvider>
        ) : (
          <FormProvider {...verifyCodeForm}>
            <form onSubmit={verifyCodeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
            <input type="" {...verifyCodeForm.register("sessionId")} />
            <input type="" {...verifyCodeForm.register("phoneNumber")} />

            {sessionInfo && (
              <div className="text-sm">
                <span className="font-medium">Phone:</span> {sessionInfo.phoneNumber}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input name="phoneCode" placeholder="Code from Telegram/SMS" disabled={isAuthenticating} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Two-Factor Password (if enabled)</label>
              <Input name="password" type="password" placeholder="Leave blank if not using 2FA" disabled={isAuthenticating} />
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setAuthStep("sendCode")} disabled={isAuthenticating}>
                Back
              </Button>
              <Button type="submit" disabled={isAuthenticating}>
                {isAuthenticating ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </form>
          </FormProvider>
        )}

        {settings.isTelegramAuthenticated && authStep === "credentials" && (
          <>
            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Authentication Actions</h3>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleTestConnection} variant="outline" disabled={isAuthenticating}>
                  Test Connection
                </Button>

                <Button onClick={startAuthentication} variant="outline" disabled={isAuthenticating}>
                  Re-Authenticate
                </Button>

                <Button onClick={handleResetAuthentication} variant="destructive" disabled={isAuthenticating}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Authentication
                </Button>
              </div>
            </div>
          </>
        )}

        {!settings.isTelegramAuthenticated && authStep === "credentials" && (
          <Button onClick={startAuthentication} disabled={!telegramSettingsForm.getValues().telegramApiId || !telegramSettingsForm.getValues().telegramApiHash || !telegramSettingsForm.getValues().telegramPhoneNumber || isUpdating}>
            Authenticate with Telegram
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
