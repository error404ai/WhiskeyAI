"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteUserAccount } from "@/http/controllers/profileController";
import { useState } from "react";

const DeleteAccount = () => {
  const [status, setStatus] = useState("initial");

  const handleDeleteAccount = async () => {
    const userId = 1; // Replace with actual user ID
    setStatus("pending");
    const result = await deleteUserAccount(userId);
    alert(result);
    setStatus("completed");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Deleting your account is irreversible. Please confirm if you wish to proceed.</p>
        <Button onClick={handleDeleteAccount} className="bg-red-500 text-white" disabled={status === "pending"}>
          {status === "pending" ? "Deleting..." : "Delete Account"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteAccount; 