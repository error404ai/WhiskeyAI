import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { openAsBlob } from "fs";

export class TokenLaunchService {
  static async sendCreateTx() {
    const mintKeypair = Keypair.generate();

    // Define token metadata
    const formData = new FormData();
    formData.append("file", await openAsBlob("./example.png"));
    formData.append("name", "PPTest");
    formData.append("symbol", "TEST");
    formData.append("description", "This is an example token created via PumpPortal.fun");
    formData.append("twitter", "https://x.com/a1lon9/status/1812970586420994083");
    formData.append("telegram", "https://x.com/a1lon9/status/1812970586420994083");
    formData.append("website", "https://pumpportal.fun");
    formData.append("showName", "true");

    // Create IPFS metadata storage
    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });
    const metadataResponseJSON = await metadataResponse.json();

    // Send the create transaction
    const response = await fetch(`https://pumpportal.fun/api/trade?api-key=your-api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri,
        },
        mint: bs58.encode(mintKeypair.secretKey),
        denominatedInSol: "true",
        amount: 1, // Dev buy of 1 SOL
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });
    if (response.status === 200) {
      // successfully generated transaction
      const data = await response.json();
      console.log("Transaction: https://solscan.io/tx/" + data.signature);
    } else {
      console.log(response.statusText); // log error
    }
  }
}
