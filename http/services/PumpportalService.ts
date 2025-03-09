/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, Keypair, PublicKey, SendOptions, Transaction, VersionedTransaction } from "@solana/web3.js";

export class PumpportalService {
  public RPC_ENDPOINT = "https://kelcey-184ipf-fast-mainnet.helius-rpc.com";
  public web3Connection: Connection;

  constructor() {
    this.web3Connection = new Connection(this.RPC_ENDPOINT, "confirmed");
  }

  async sendWalletCreateTx(publicKey: PublicKey, signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>, metadataResponseJSON: any) {
    // Generate a keypair for the mint
    const mintKeypair = Keypair.generate();

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
        amount: 0.0001, // Use the provided buy amount or default to 1 SOL
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
