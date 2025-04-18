/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as AdminAuthController from "@/server/controllers/auth/adminAuthController";
import { adminLoginSchema } from "@/server/zodSchema/adminLoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

export default function AdminLoginPage() {
  const router = useRouter();
  const methods = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: z.infer<typeof adminLoginSchema>) => {
    try {
      const result = await AdminAuthController.adminLogin(data);

      if (!result.success) {
        toast.error("Login Failed", {
          description: result.error || "Invalid username or password. Please try again.",
        });
      } else {
        toast.success("Success", {
          description: "You've been logged in as an administrator.",
        });
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Login Error", {
        description: "An error occurred during login. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Toaster richColors position="top-right" />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <Lock className="text-primary mx-auto size-6" />
          <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input name="username" placeholder="Enter your username" autoComplete="username" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input type="password" name="password" placeholder="••••••••" autoComplete="current-password" isPassword />
              </div>
              <Button type="submit" className="w-full" loading={methods.formState.isSubmitting}>
                Login
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
