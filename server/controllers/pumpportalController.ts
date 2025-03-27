"use server";
import { API_CONFIG, SOCIAL_CONFIG, SOLANA_CONFIG } from "@/server/config";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_ENDPOINT = SOLANA_CONFIG.RPC_ENDPOINT;
const PUMP_FUN_API = API_CONFIG.PUMP_FUN_API;
const SOLSCAN_TX_URL = SOCIAL_CONFIG.SOLSCAN_TX_URL;

export const uploadMetadata = async (formData: FormData) => {
  const metadataResponse = await fetch(`${PUMP_FUN_API}/ipfs`, {
    method: "POST",
    body: formData,
  });

  if (!metadataResponse.ok) {
    throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
  }

  const metadataResponseJSON = await metadataResponse.json();

  return metadataResponseJSON;
};

export const fetchTokenDetails = async (mintAddress: string) => {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  // Initialize Metaplex
  const metaplex = Metaplex.make(connection);

  try {
    // Validate mint address
    const mintPublicKey = new PublicKey(mintAddress);

    // Fetch token metadata using findByMint
    const tokenMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    if (!tokenMetadata || !tokenMetadata.metadataAddress) {
      throw new Error("No metadata found for this token");
    }

    // Fetch off-chain metadata (e.g., image, description) from the URI if available
    let offChainData = {};
    if (tokenMetadata.uri) {
      const uriResponse = await fetch(tokenMetadata.uri);
      if (uriResponse.ok) {
        offChainData = await uriResponse.json();
      } else {
        console.warn("Failed to fetch off-chain metadata:", uriResponse.statusText);
      }
    }

    // Fetch transaction history (e.g., token creation or first transfer)
    const signatures = await connection.getSignaturesForAddress(mintPublicKey, { limit: 10 });
    let txLink = "";
    if (signatures.length > 0) {
      const oldestSignature = signatures[signatures.length - 1].signature; // Oldest tx
      txLink = `${SOLSCAN_TX_URL}${oldestSignature}`;
    }

    return {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      uri: tokenMetadata.uri,
      offChainData, // Additional data like image, description, etc.
      transactionLink: txLink || "No transaction found",
    };
  } catch (error) {
    throw new Error(`Failed to fetch token details: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
