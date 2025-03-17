"use client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { SOLANA_CONFIG } from "@/config";

// Import wallet styles
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Get network from config
  const network = SOLANA_CONFIG.NETWORK;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => SOLANA_CONFIG.RPC_ENDPOINT || clusterApiUrl(network), [network]);
  
  // Initialize wallet adapter with autoConnect set to true
  const wallets = useMemo(
    () => [new PhantomWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
