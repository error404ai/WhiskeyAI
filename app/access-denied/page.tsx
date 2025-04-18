"use client";

import { Button } from "@/components/ui/button";
import * as authController from "@/server/controllers/auth/authController";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
        <p className="mb-6 text-gray-600">You don&apos;t have permission to access this page. This area is restricted to administrators only.</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button variant="outline" link="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Button>
          <Button variant="destructive" onClick={authController.logout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
