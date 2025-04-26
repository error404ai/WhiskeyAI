"use client";
import { Button } from "@/components/ui/button";
import * as AuthController from "@/server/controllers/auth/authController";
import bs58 from "bs58";
import { toast } from "sonner";

const ConnectButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => {
  const handleLogin = async () => {
    try {
      let publicKey = null;
      if (window.solana) {
        const { publicKey: publicKeyFromConnect } = await window.solana.connect();
        publicKey = publicKeyFromConnect.toBase58();
      }

      if (!window.solana || !publicKey) {
        toast.error("Phantom Wallet not found!");
        return;
      }

      const message = "Sign this message to authenticate with NextAuth";
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");
      const response = await AuthController.login({
        publicKey,
        signature: bs58.encode(signedMessage.signature),
        message,
      });

      if (!response.success) {
        toast.error(response.message || "Login failed. Please try again.");
        return;
      }

      window.location.href = "/my-agents"; // Previously redirected to "/dashboard"
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <Button onClick={handleLogin} {...props}>
      {children || "Connect"}
    </Button>
  );
};

export default ConnectButton;
