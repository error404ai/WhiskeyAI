"use client";
import { Button } from "@/components/ui/button";
import * as AuthController from "@/http/controllers/authController";
import bs58 from "bs58";
import { useEffect, useState } from "react";

interface Solana {
  isPhantom?: boolean;
  publicKey?: {
    toBase58(): string;
  };
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: Solana;
  }
}

const LoginButton = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (window.solana) {
      window.solana.connect().then(({ publicKey }) => {
        setPublicKey(publicKey.toBase58());
      });
    }
  }, []);
  const handleLogin = async () => {
    if (!window.solana || !publicKey) {
      alert("Phantom Wallet not found!");
      return;
    }

    const message = "Sign this message to authenticate with NextAuth";
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");

    const url = await AuthController.login({
      publicKey,
      signature: bs58.encode(signedMessage.signature),
      message,
    });
    window.location.href = url;
  };

  return (
    <Button onClick={handleLogin} className="rounded-lg bg-white font-semibold text-black shadow-md transition hover:bg-gray-300">
      Login
    </Button>
  );
};

export default LoginButton;
