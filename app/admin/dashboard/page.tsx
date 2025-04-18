"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import * as AdminAuthController from "@/server/controllers/auth/adminAuthController";
import { LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { isAdmin, isLoading } = useIsAdmin();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session) {
      setPageLoading(false);
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      toast.info("Signing out...");
      await AdminAuthController.adminLogout();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  if (pageLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">You don&apos;t have administrator privileges.</p>
            <Button 
              variant="destructive"
              className="w-full" 
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing Out..." : (
                <>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing Out..." : (
            <>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hello, {session?.user?.name || "Admin"}!</p>
            <p className="text-muted-foreground mt-2">
              You&apos;re logged in as an administrator with full access to manage the application.
            </p>
          </CardContent>
        </Card>
        
        {/* Additional cards with admin functionality can be added here */}
      </div>
    </div>
  );
} 