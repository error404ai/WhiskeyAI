"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <ShieldAlert className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => signOut({ redirectTo: "/" })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 