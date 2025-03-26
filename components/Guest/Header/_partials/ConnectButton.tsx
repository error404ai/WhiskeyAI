"use client";
import { Button } from "@/components/ui/button";
import * as AuthController from "@/http/controllers/authController";
import bs58 from "bs58";

const ConnectButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => {
  const handleLogin = async () => {
    let publicKey = null;
    if (window.solana) {
      const { publicKey: publicKeyFromConnect } = await window.solana.connect();
      publicKey = publicKeyFromConnect.toBase58();
    }

    if (!window.solana || !publicKey) {
      alert("Phantom Wallet not found!");
      return;
    }
    const message = "Sign this message to authenticate with NextAuth";
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");
    const res = await AuthController.login({
      publicKey,
      signature: bs58.encode(signedMessage.signature),
      message,
    });

    if (typeof res === "boolean" && !res) {
      console.log(res);
      return;
    }

    console.log("logged in");
    window.location.href = "/my-agent"; // Previously redirected to "/dashboard"
  };

  return (
    <Button onClick={handleLogin} {...props}>
      {children || "Connect"}
    </Button>
  );
};

export default ConnectButton;
