import { Connection, PublicKey, SendOptions, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";

const RPC_ENDPOINT = "https://kelcey-184ipf-fast-mainnet.helius-rpc.com";

const RECIPIENT_WALLET = "ASzaZmbQoNCAyvi7PKQauAiKvHosEXkoXyWCj2UzvtFp";

export const AGENT_CREATION_FEE = 0.0001;

export const sendAgentPaymentTx = async (publicKey: PublicKey, signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>): Promise<string> => {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(RECIPIENT_WALLET),
      lamports: AGENT_CREATION_FEE * 1e9,
    }),
  );

  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = publicKey;

  const signedTx = await signTransaction(transaction);

  const sendOptions: SendOptions = {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  };

  const signature = await connection.sendRawTransaction((signedTx as Transaction).serialize(), sendOptions);

  await connection.confirmTransaction(signature, "confirmed");
  return signature;
};

export const verifyPaymentTransaction = async (txSignature: string, payerPublicKey?: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    const transaction = await connection.getTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      return { isValid: false, error: "Transaction not found on the blockchain" };
    }

    if (!transaction.meta || transaction.meta.err) {
      return { isValid: false, error: "Transaction failed or was not confirmed" };
    }

    if (!transaction.meta) {
      return { isValid: false, error: "Transaction metadata is missing" };
    }

    const recipientPubkeyStr = RECIPIENT_WALLET;

    let recipientIndex = -1;

    const { meta } = transaction;

    if (transaction.transaction && transaction.transaction.message) {
      const accounts = JSON.stringify(transaction);

      if (!accounts.includes(recipientPubkeyStr)) {
        return { isValid: false, error: "Recipient wallet not found in transaction" };
      }

      if (payerPublicKey && !accounts.includes(payerPublicKey)) {
        return { isValid: false, error: "Payer wallet not found in transaction" };
      }

      for (let i = 0; i < meta.preBalances.length; i++) {
        const preBalance = meta.preBalances[i];
        const postBalance = meta.postBalances[i];

        if (postBalance - preBalance > 0.2 * 1e9) {
          recipientIndex = i;
          break;
        }
      }
    }

    if (recipientIndex === -1) {
      return { isValid: false, error: "Couldn't identify recipient in transaction" };
    }

    // Calculate the transferred amount
    const preBalance = meta.preBalances[recipientIndex];
    const postBalance = meta.postBalances[recipientIndex];
    const amountTransferred = (postBalance - preBalance) / 1e9;

    if (Math.abs(amountTransferred - AGENT_CREATION_FEE) > 0.01) {
      return {
        isValid: false,
        error: `Payment amount incorrect. Expected ${AGENT_CREATION_FEE} SOL, received approximately ${amountTransferred} SOL`,
      };
    }

    if (!transaction.blockTime) {
      return { isValid: false, error: "Could not verify transaction timestamp" };
    }

    const txTimestamp = transaction.blockTime * 1000;
    const currentTime = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (currentTime - txTimestamp > ONE_DAY_MS) {
      return { isValid: false, error: "Transaction is too old (more than 24 hours)" };
    }

    // All checks passed
    return { isValid: true };
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error verifying transaction",
    };
  }
};
