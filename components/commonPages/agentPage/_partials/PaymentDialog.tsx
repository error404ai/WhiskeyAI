"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendAgentPaymentTx } from "@/lib/solanaPaymentUtils";
import { PAYMENT_CONFIG, SOCIAL_CONFIG } from "@/server/config";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
  title?: string;
  description?: string;
};

enum PaymentStatus {
  INITIAL = "initial",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onOpenChange, onPaymentSuccess, title = "Create Your First AI Agent", description = `A one-time payment of ${PAYMENT_CONFIG.AGENT_CREATION_FEE} SOL is required to create your first agent. After payment, you can create up to ${PAYMENT_CONFIG.MAX_AGENTS_PER_USER} agents.` }) => {
  const { publicKey, signTransaction, connect, connected, connecting } = useWallet();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.INITIAL);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

  useEffect(() => {
    // Check if Phantom wallet is available
    const checkPhantom = () => {
      const isPhantomInstalled = window.solana && window.solana.isPhantom;
      setIsPhantomAvailable(isPhantomInstalled);
    };

    checkPhantom();
    window.addEventListener("load", checkPhantom);
    return () => window.removeEventListener("load", checkPhantom);
  }, []);

  const connectPhantom = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Error connecting to Phantom:", error);
      setPaymentError("Failed to connect to Phantom wallet");
    }
  };

  const handlePayment = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setPaymentError("Please connect your wallet first");
      return;
    }

    try {
      setPaymentStatus(PaymentStatus.PROCESSING);
      setPaymentError(null);

      // Process the payment
      const signature = await sendAgentPaymentTx(publicKey, signTransaction);
      setTxSignature(signature);

      // Update user payment status and validate the transaction
      const result = await AgentController.markUserAsPaid(signature, PAYMENT_CONFIG.AGENT_CREATION_FEE.toString());

      // Check if validation failed
      if (result && typeof result === "object" && "error" in result) {
        setPaymentStatus(PaymentStatus.ERROR);
        setPaymentError(result.error as string);
        return;
      }

      setPaymentStatus(PaymentStatus.SUCCESS);
      setTimeout(() => {
        onPaymentSuccess();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus(PaymentStatus.ERROR);
      setPaymentError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-center">{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {paymentStatus === PaymentStatus.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="mt-4 text-center text-lg">Processing payment...</p>
              <p className="text-muted-foreground mt-2 text-center text-sm">Please sign the transaction in your wallet</p>
            </div>
          )}

          {paymentStatus === PaymentStatus.SUCCESS && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-center text-lg">Payment successful!</p>
              <p className="text-muted-foreground mt-2 text-center text-sm">Thank you for your payment</p>
              {txSignature && (
                <a href={`${SOCIAL_CONFIG.SOLSCAN_TX_URL}${txSignature}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-blue-500 hover:underline">
                  View transaction on Solscan
                </a>
              )}
            </div>
          )}

          {paymentStatus === PaymentStatus.ERROR && (
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-center text-lg">Payment failed</p>
              <p className="mt-2 text-center text-sm text-red-500">{paymentError}</p>
              <Button onClick={() => setPaymentStatus(PaymentStatus.INITIAL)} className="mt-6" variant="outline">
                Try again
              </Button>
            </div>
          )}

          {paymentStatus === PaymentStatus.INITIAL && (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Payment Required</h3>
                  <p className="text-muted-foreground text-sm">
                    Pay {PAYMENT_CONFIG.AGENT_CREATION_FEE} SOL to unlock the ability to create up to {PAYMENT_CONFIG.MAX_AGENTS_PER_USER} agents
                  </p>
                </div>

                {!connected ? (
                  <>
                    {isPhantomAvailable ? (
                      <Button onClick={connectPhantom} className="w-full" disabled={connecting}>
                        {connecting ? "Connecting..." : "Connect Phantom Wallet"}
                      </Button>
                    ) : (
                      <Button onClick={() => window.open("https://phantom.app/download", "_blank")} className="w-full">
                        Install Phantom Wallet
                      </Button>
                    )}
                    <p className="text-muted-foreground text-xs">{isPhantomAvailable ? "You'll need to approve the connection in the Phantom wallet popup" : "After installing, refresh this page"}</p>
                  </>
                ) : (
                  <Button onClick={handlePayment} className="w-full">
                    Pay {PAYMENT_CONFIG.AGENT_CREATION_FEE} SOL
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
