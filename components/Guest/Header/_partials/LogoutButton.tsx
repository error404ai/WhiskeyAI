"use client";
import { Button } from "@/components/ui/button";
import { logout } from "@/http/controllers/authController";
import { LogOut } from "lucide-react";
import { useState } from "react";

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };
  return (
    <Button loading={loading} variant="destructive" onClick={handleLogout}>
      <LogOut /> Logout
    </Button>
  );
};

export default LogoutButton;
