import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { openAsBlob } from "fs";

export class PumpportalService {
  public RPC_ENDPOINT = "Your RPC Endpoint";
  public web3Connection: Connection;

  constructor() {
    this.web3Connection = new Connection(this.RPC_ENDPOINT, "confirmed");
  }

  async sendLocalCreateTx(walletPrivateKey: string, tokenMetadata: { file: string; name: string; symbol: string; description: string; twitter?: string; telegram?: string; website: string; showName: boolean }) {
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode(walletPrivateKey));

    // Generate a random keypair for token
    const mintKeypair = Keypair.generate();

    // Define token metadata
    const formData = new FormData();
    formData.append("file", await openAsBlob(tokenMetadata.file));
    formData.append("name", tokenMetadata.name);
    formData.append("symbol", tokenMetadata.symbol);
    formData.append("description", tokenMetadata.description);
    if (tokenMetadata.twitter) formData.append("twitter", tokenMetadata.twitter);
    if (tokenMetadata.telegram) formData.append("telegram", tokenMetadata.telegram);
    formData.append("website", tokenMetadata.website);
    formData.append("showName", String(tokenMetadata.showName));

    // Create IPFS metadata storage
    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });
    const metadataResponseJSON = await metadataResponse.json();

    // Get the create transaction
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicKey: signerKeyPair.publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: 1, // dev buy of 1 SOL
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });

    if (response.status === 200) {
      // successfully generated transaction
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([mintKeypair, signerKeyPair]);
      const signature = await this.web3Connection.sendTransaction(tx);
      console.log("Transaction: https://solscan.io/tx/" + signature);
    } else {
      console.log(response.statusText); // log error
    }
  }
}
