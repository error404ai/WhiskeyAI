import { tokenMetadataSchema } from "@/http/zodSchema/tokenMetadataSchema";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { z } from "zod";

export class PumpportalService {
  public RPC_ENDPOINT = "Your RPC Endpoint";
  public web3Connection: Connection;

  constructor() {
    this.web3Connection = new Connection(this.RPC_ENDPOINT, "confirmed");
  }

  async sendLocalCreateTx(walletPrivateKey: string, tokenMetadata: z.infer<typeof tokenMetadataSchema>) {
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode(walletPrivateKey));

    const parsedTokenMetadata = tokenMetadataSchema.parse(tokenMetadata);

    const mintKeypair = Keypair.generate();

    const formData = new FormData();
    formData.append("file", parsedTokenMetadata.file);
    formData.append("name", parsedTokenMetadata.name);
    formData.append("symbol", parsedTokenMetadata.symbol);
    formData.append("description", parsedTokenMetadata.description);
    if (parsedTokenMetadata.twitter) formData.append("twitter", parsedTokenMetadata.twitter);
    if (parsedTokenMetadata.telegram) formData.append("telegram", parsedTokenMetadata.telegram);
    formData.append("website", parsedTokenMetadata.website);
    formData.append("showName", String(parsedTokenMetadata.showName));

    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });
    const metadataResponseJSON = await metadataResponse.json();

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
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([mintKeypair, signerKeyPair]);
      const signature = await this.web3Connection.sendRawTransaction(tx.serialize());
      console.log("Transaction: https://solscan.io/tx/" + signature);
    } else {
      console.log(response.statusText); // log error
    }
  }
}
