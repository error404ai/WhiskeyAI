"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import * as SettingsController from "@/server/controllers/admin/SettingsController";

// SOL payment validation schema
const solPaymentSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.001 && num <= 10;
    },
    {
      message: "Amount must be a number between 0.001 and 10 SOL",
    }
  ),
});

type SolPaymentPanelProps = {
  settings: {
    solPaymentAmount: number;
  };
  onUpdate: () => void;
};

export function SolPaymentPanel({ settings, onUpdate }: SolPaymentPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form with the current SOL payment amount
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof solPaymentSchema>>({
    resolver: zodResolver(solPaymentSchema),
    defaultValues: {
      amount: settings.solPaymentAmount.toString(),
    },
  });

  // Update SOL payment amount
  const onUpdatePayment = async (data: z.infer<typeof solPaymentSchema>) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await SettingsController.updateSolPayment(data.amount);
      
      if (response.success) {
        setSuccess("SOL payment amount updated successfully.");
        onUpdate();
      } else {
        setError(response.error || "Failed to update payment amount.");
      }
    } catch (err) {
      setError(`Unexpected error: ${(err as Error).message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          <CardTitle>SOL Payment Settings</CardTitle>
        </div>
        <CardDescription>
          Configure the SOL payment amount required for agent deployment
        </CardDescription>
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
        
        <form onSubmit={handleSubmit(onUpdatePayment)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SOL Payment Amount</label>
            <div className="flex items-center space-x-2">
              <Input
                {...register("amount")}
                type="number"
                step="0.001"
                min="0.001"
                max="10"
                placeholder="0.1"
                className="max-w-[200px]"
                disabled={isUpdating}
              />
              <span className="text-sm font-medium">SOL</span>
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Amount of SOL required from users for agent deployment/execution
            </p>
          </div>
          
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Payment Amount"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 