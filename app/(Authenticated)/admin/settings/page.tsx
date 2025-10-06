"use client";

import { BackupRestorePanel } from "@/components/admin/settings/BackupRestorePanel";
import { MaxAgentsPanel } from "@/components/admin/settings/MaxAgentsPanel";
import { SolPaymentPanel } from "@/components/admin/settings/SolPaymentPanel";
import { TelegramAuthenticationPanel } from "@/components/admin/settings/TelegramAuthenticationPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as SettingsController from "@/server/controllers/admin/SettingsController";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Database, Settings, Users } from "lucide-react";
import React from "react";

export default function AdminSettingsPage() {
  // Fetch settings data
  const {
    data: settingsData,
    isPending: isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: () => SettingsController.getSettings(),
    refetchOnWindowFocus: false,
  });

  // Callback to refresh settings after updates
  const handleSettingsUpdated = () => {
    refetch();
  };

  // Process settings data to have consistent types regardless of server response format
  const processedSettings = React.useMemo(() => {
    const defaultSettings = {
      solPaymentAmount: 0.1,
      default_max_agents_per_user: 5,
      telegramApiId: "",
      telegramApiHash: "",
      telegramPhoneNumber: "",
      telegramBotToken: "",
      telegramSessionString: "",
      isTelegramAuthenticated: false,
    };

    if (!settingsData?.success || !settingsData.settings) {
      return defaultSettings;
    }

    // Get all properties from the server and convert types as needed
    const rawSettings = settingsData.settings as {
      solPaymentAmount?: string | number;
      default_max_agents_per_user?: number;
      telegramApiId?: string | null;
      telegramApiHash?: string | null;
      telegramPhoneNumber?: string | null;
      telegramBotToken?: string | null;
      telegramSessionString?: string | null;
      isTelegramAuthenticated?: boolean | null;
    };
    return {
      solPaymentAmount: parseFloat(String(rawSettings.solPaymentAmount || "0.1")),
      default_max_agents_per_user: Number(rawSettings.default_max_agents_per_user || 5),
      telegramApiId: String(rawSettings.telegramApiId || ""),
      telegramApiHash: String(rawSettings.telegramApiHash || ""),
      telegramPhoneNumber: String(rawSettings.telegramPhoneNumber || ""),
      telegramBotToken: String(rawSettings.telegramBotToken || ""),
      telegramSessionString: String(rawSettings.telegramSessionString || ""),
      isTelegramAuthenticated: Boolean(rawSettings.isTelegramAuthenticated),
    };
  }, [settingsData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure application-wide settings and integrations</p>
      </div>

      {error ? (
        <Card className="bg-destructive/10">
          <CardContent className="flex items-center gap-2 py-6">
            <AlertCircle className="text-destructive h-5 w-5" />
            <p>There was an error loading the settings. Please try again later.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" />
              General Settings
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Users className="mr-2 h-4 w-4" />
              Agent Settings
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Settings className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Database className="mr-2 h-4 w-4" />
              Backup & Restore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <SolPaymentPanel settings={processedSettings} onUpdate={handleSettingsUpdated} />
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <MaxAgentsPanel settings={processedSettings} onUpdate={handleSettingsUpdated} />
            )}
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <TelegramAuthenticationPanel settings={processedSettings} onUpdate={handleSettingsUpdated} />
            )}
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <BackupRestorePanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
