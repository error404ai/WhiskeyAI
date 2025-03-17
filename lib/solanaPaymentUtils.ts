import { Connection, PublicKey, SendOptions, SystemProgram, Transaction, VersionedTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Use a reliable RPC endpoint
const RPC_ENDPOINT = "https://kelcey-184ipf-fast-mainnet.helius-rpc.com";

const RECIPIENT_WALLET = "ASzaZmbQoNCAyvi7PKQauAiKvHosEXkoXyWCj2UzvtFp";

export const AGENT_CREATION_FEE = 0.0001;

// Minimum rent-exempt balance for a new account
const MINIMUM_RENT_EXEMPT_BALANCE = 0.00203928; // 2,039,280 lamports

export const sendAgentPaymentTx = async (publicKey: PublicKey, signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>): Promise<string> => {
  const connection = new Connection(RPC_ENDPOINT, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
    httpHeaders: {
      "Content-Type": "application/json",
    },
  });

  try {
    // Check recipient account balance
    const recipientPubkey = new PublicKey(RECIPIENT_WALLET);
    const recipientBalance = await connection.getBalance(recipientPubkey);
    console.log("Recipient balance:", recipientBalance / LAMPORTS_PER_SOL, "SOL");

    // Calculate the total amount needed including rent-exempt balance
    const totalAmount = (AGENT_CREATION_FEE * LAMPORTS_PER_SOL) + 
                       (recipientBalance < MINIMUM_RENT_EXEMPT_BALANCE * LAMPORTS_PER_SOL ? 
                        MINIMUM_RENT_EXEMPT_BALANCE * LAMPORTS_PER_SOL - recipientBalance : 0);

    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports: totalAmount,
      }),
    );

    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = publicKey;

    // Get the transaction fee using getFeeForMessage
    const message = transaction.compileMessage();
    const fee = await connection.getFeeForMessage(message, 'confirmed');
    
    if (fee.value === null) {
      throw new Error("Failed to get transaction fee");
    }

    // Add the transaction fee to the total amount
    const totalAmountWithFees = totalAmount + fee.value;

    // Check if user has enough balance including fees
    const balance = await connection.getBalance(publicKey);
    console.log("Wallet balance:", balance / LAMPORTS_PER_SOL, "SOL");
    console.log("Required amount:", totalAmountWithFees / LAMPORTS_PER_SOL, "SOL");
    console.log("Transaction fee:", fee.value / LAMPORTS_PER_SOL, "SOL");
    console.log("Rent-exempt balance needed:", MINIMUM_RENT_EXEMPT_BALANCE, "SOL");

    // Add a small buffer for transaction fees (0.001 SOL)
    const minimumRequiredBalance = totalAmountWithFees + (0.001 * LAMPORTS_PER_SOL);
    
    if (balance < minimumRequiredBalance) {
      throw new Error(`Insufficient balance. Required: ${minimumRequiredBalance / LAMPORTS_PER_SOL} SOL (including fees and buffer)`);
    }

    const signedTx = await signTransaction(transaction);

    const sendOptions: SendOptions = {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    };

    const signature = await connection.sendRawTransaction((signedTx as Transaction).serialize(), sendOptions);

    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  } catch (error) {
    console.error("Payment transaction error:", error);
    if (error instanceof Error) {
      throw new Error(`Payment Failed: ${error.message}`);
    }
    throw new Error("Payment Failed: Unknown error occurred");
  }
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

      // Find the recipient by looking for the account that received the transfer
      for (let i = 0; i < meta.preBalances.length; i++) {
        const preBalance = meta.preBalances[i];
        const postBalance = meta.postBalances[i];
        const balanceChange = postBalance - preBalance;

        // Look for a positive balance change that matches our expected amount
        if (balanceChange > 0 && balanceChange >= AGENT_CREATION_FEE * LAMPORTS_PER_SOL) {
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
    const amountTransferred = (postBalance - preBalance) / LAMPORTS_PER_SOL;

    // Check if the transferred amount is at least the required fee
    if (amountTransferred < AGENT_CREATION_FEE) {
      return {
        isValid: false,
        error: `Payment amount incorrect. Expected at least ${AGENT_CREATION_FEE} SOL, received ${amountTransferred} SOL`,
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
