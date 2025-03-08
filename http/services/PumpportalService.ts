import { tokenMetadataSchema } from "@/http/zodSchema/tokenMetadataSchema";
import { Connection, Keypair, PublicKey, SendOptions, Transaction, VersionedTransaction } from "@solana/web3.js";

import { z } from "zod";

export class PumpportalService {
  public RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
  public web3Connection: Connection;

  constructor() {
    this.web3Connection = new Connection(this.RPC_ENDPOINT, "confirmed");
  }

  async sendWalletCreateTx(publicKey: PublicKey, signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>, tokenMetadata: z.infer<typeof tokenMetadataSchema>) {
    const parsedTokenMetadata = tokenMetadataSchema.parse(tokenMetadata);

    console.log("buy amount is", parsedTokenMetadata.buyAmount);

    // Generate a keypair for the mint
    const mintKeypair = Keypair.generate();

    // Upload metadata to IPFS
    const formData = new FormData();
    formData.append("file", parsedTokenMetadata.file as File);
    formData.append("name", parsedTokenMetadata.name);
    formData.append("symbol", parsedTokenMetadata.symbol);
    formData.append("description", parsedTokenMetadata.description);
    if (parsedTokenMetadata.twitter) formData.append("twitter", parsedTokenMetadata.twitter);
    if (parsedTokenMetadata.telegram) formData.append("telegram", parsedTokenMetadata.telegram);
    formData.append("website", parsedTokenMetadata.website);
    formData.append("showName", "true");

    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });

    console.log("metadataResponse is", metadataResponse);

    if (!metadataResponse.ok) {
      throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
    }

    const metadataResponseJSON = await metadataResponse.json();

    // Get the create transaction from the API
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: parsedTokenMetadata.buyAmount, // Use the provided buy amount or default to 1 SOL
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });

    console.log("response is", response);

    if (!response.ok) {
      throw new Error(`Failed to create transaction: ${response.statusText}`);
    }

    // Deserialize the transaction
    const data = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(data));

    // The mint keypair needs to sign the transaction
    // First, we get the signature from the mint keypair
    tx.sign([mintKeypair]);

    // Then, we have the wallet sign the transaction
    const signedTx = await signTransaction(tx);

    // Send the transaction to the network
    const sendOptions: SendOptions = {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    };

    const signature = await this.web3Connection.sendRawTransaction((signedTx as VersionedTransaction).serialize(), sendOptions);

    // Wait for confirmation
    await this.web3Connection.confirmTransaction(signature, "confirmed");

    return signature;
  }
}
