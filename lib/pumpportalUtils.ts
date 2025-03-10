/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, Keypair, PublicKey, SendOptions, Transaction, VersionedTransaction } from "@solana/web3.js";
const RPC_ENDPOINT = "https://kelcey-184ipf-fast-mainnet.helius-rpc.com";

export const sendWalletCreateTx = async (publicKey: PublicKey, signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>, metadataResponseJSON: any, amount: string) => {
  const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");
  const mintKeypair = Keypair.generate();
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
      amount: amount,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create transaction: ${response.statusText}`);
  }
  const data = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(data));

  tx.sign([mintKeypair]);
  const signedTx = await signTransaction(tx);
  const sendOptions: SendOptions = {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  };
  const signature = await web3Connection.sendRawTransaction((signedTx as VersionedTransaction).serialize(), sendOptions);
  await web3Connection.confirmTransaction(signature, "confirmed");
  return signature;
};
