"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart-container";
import { DateTime } from "@/components/ui/datetime";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveBadge, BlockedBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as DashboardController from "@/server/controllers/admin/DashboardController";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CircleUser, Clock, CreditCard, Twitter, UserCheck, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const AdminDashboardPage = () => {
  const router = useRouter();

  const {
    data: statsData,
    isPending: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => DashboardController.getDashboardStats(),
  });

  const { data: recentUsersData, isPending: usersLoading } = useQuery({
    queryKey: ["adminRecentUsers"],
    queryFn: () => DashboardController.getRecentUsers(5),
  });

  // We're fetching this data for future use, even if not using it in the current UI
  useQuery({
    queryKey: ["adminRecentAgents"],
    queryFn: () => DashboardController.getRecentAgents(5),
  });

  const { data: recentLogsData, isPending: logsLoading } = useQuery({
    queryKey: ["adminRecentLogs"],
    queryFn: () => DashboardController.getRecentTriggerLogs(5),
  });

  const { data: userRegistrationsData, isPending: registrationsLoading } = useQuery({
    queryKey: ["adminUserRegistrations", "week"],
    queryFn: () => DashboardController.getUserRegistrationsOverTime("week"),
  });

  const stats =
    statsData?.success && "stats" in statsData
      ? statsData.stats
      : {
          totalUsers: 0,
          totalAgents: 0,
          totalTriggers: 0,
          totalTweets: 0,
          activeUsers: 0,
          successfulTriggers: 0,
          failedTriggers: 0,
          newUsersToday: 0,
          payingUsers: 0,
          unlimitedUsers: 0,
          triggerSuccessRate: 0,
          userConversionRate: 0,
          userActivityRate: 0,
        };

  const navigateToUserManagement = () => {
    router.push("/admin/user-management");
  };

  const navigateToAgentManagement = () => {
    router.push("/admin/agent-management");
  };

  const renderStatsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-20" /> : stats.totalUsers}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {statsLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>
                {stats.newUsersToday} new users today
                <Badge variant="outline" className="ml-2">
                  +{Math.round((stats.newUsersToday / stats.totalUsers) * 100 || 0)}%
                </Badge>
              </>
            )}
          </div>
          <Button variant="link" className="mt-2 px-0" onClick={navigateToUserManagement}>
            Manage Users
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          <CircleUser className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-20" /> : stats.totalAgents}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {statsLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>
                {stats.activeUsers} active users
                <Badge variant="outline" className="ml-2">
                  {stats.userActivityRate}% user activity
                </Badge>
              </>
            )}
          </div>
          <Button variant="link" className="mt-2 px-0" onClick={navigateToAgentManagement}>
            Manage Agents
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Metrics</CardTitle>
          <CreditCard className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-20" /> : stats.payingUsers}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {statsLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>
                Paid users
                <Badge variant="outline" className="ml-2">
                  {stats.userConversionRate}% conversion
                </Badge>
              </>
            )}
          </div>
          <div className="mt-2">
            <div className="text-md font-medium">{statsLoading ? <Skeleton className="h-6 w-20" /> : stats.unlimitedUsers}</div>
            <div className="text-muted-foreground text-xs">Users with unlimited access</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trigger Executions</CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-20" /> : stats.totalTriggers}</div>
          <div className="mt-1 flex items-center space-x-2">
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
              <div className="text-muted-foreground text-xs">{statsLoading ? <Skeleton className="h-4 w-16" /> : `${stats.successfulTriggers} success`}</div>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-2 w-2 rounded-full bg-red-500" />
              <p className="text-muted-foreground text-xs">{statsLoading ? <Skeleton className="h-4 w-16" /> : `${stats.failedTriggers} failed`}</p>
            </div>
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {statsLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <>
                <Badge variant={stats.triggerSuccessRate > 90 ? "success" : stats.triggerSuccessRate > 70 ? "outline" : "destructive"}>{stats.triggerSuccessRate}% success rate</Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduled Tweets</CardTitle>
          <Twitter className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsLoading ? <Skeleton className="h-8 w-20" /> : stats.totalTweets}</div>
          <div className="text-muted-foreground mt-1 text-xs">{statsLoading ? <Skeleton className="h-4 w-40" /> : "Total scheduled tweets"}</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecentUsers = () => (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl">Recent User Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usersLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))
            : recentUsersData?.data?.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="max-w-[200px] truncate text-sm font-medium">{user.publicKey || "Anonymous"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.hasPaidForAgents || user.has_unlimited_access ? "success" : "outline"} className="ml-2">
                      {user.has_unlimited_access ? "Unlimited" : user.hasPaidForAgents ? "Paid" : "Free"}
                    </Badge>
                    {user.is_active ? <ActiveBadge /> : <BlockedBadge />}
                    <div className="text-muted-foreground text-xs">
                      <DateTime date={user.createdAt} />
                    </div>
                  </div>
                </div>
              )) || (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">No recent users</p>
                </div>
              )}
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={navigateToUserManagement}>
              View All Users
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCharts = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">User Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week">
            <TabsList className="mb-4">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <TabsContent value="week">
              <div className="h-[300px]">
                {registrationsLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : userRegistrationsData?.data && userRegistrationsData.data.length > 0 ? (
                  <ChartContainer
                    type="bar"
                    data={{
                      labels: userRegistrationsData.data.map((item) => item.date),
                      datasets: [
                        {
                          label: "New Users",
                          data: userRegistrationsData.data.map((item) => item.count),
                          backgroundColor: "rgba(29, 78, 216, 0.8)",
                        },
                      ],
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="month">
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Monthly data will be loaded on tab click</p>
              </div>
            </TabsContent>
            <TabsContent value="year">
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Yearly data will be loaded on tab click</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Trigger Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {statsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <ChartContainer
                type="pie"
                data={{
                  labels: ["Successful", "Failed"],
                  datasets: [
                    {
                      data: [stats.successfulTriggers, stats.failedTriggers],
                      backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
                    },
                  ],
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application statistics and metrics.</p>
      </div>

      {statsError ? (
        <Card className="bg-destructive/10">
          <CardContent className="flex items-center gap-2 py-6">
            <AlertCircle className="text-destructive h-5 w-5" />
            <p>There was an error loading the dashboard statistics. Please try again later.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderStatsCards()}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {renderRecentUsers()}
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logsLoading
                    ? Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="w-full space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        ))
                    : recentLogsData?.data?.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 border-b pb-3">
                          <div className={`rounded-full p-2 ${log.status === "success" ? "bg-green-100 text-green-600" : log.status === "error" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>{log.status === "success" ? <UserCheck className="h-4 w-4" /> : log.status === "error" ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <span className="inline-block max-w-[80px] truncate align-bottom font-medium" title={log.publicKey || "Unknown user"}>
                                {log.publicKey || "Unknown user"}
                              </span>{" "}
                              <span className="text-muted-foreground">{log.status === "success" ? "successfully ran" : log.status === "error" ? "failed to run" : "triggered"}</span>{" "}
                              <span className="inline-block max-w-[100px] truncate align-bottom font-medium" title={log.functionName}>
                                {log.functionName}
                              </span>
                            </p>
                            <p className="text-muted-foreground text-xs">
                              <DateTime date={log.createdAt} />
                            </p>
                          </div>
                        </div>
                      )) || (
                        <div className="py-4 text-center">
                          <p className="text-muted-foreground">No recent activities</p>
                        </div>
                      )}
                </div>
              </CardContent>
            </Card>
          </div>
          {renderCharts()}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
