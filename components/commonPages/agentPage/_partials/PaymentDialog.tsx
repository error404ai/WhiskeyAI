"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { AGENT_CREATION_FEE, sendAgentPaymentTx } from "@/lib/solanaPaymentUtils";
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

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  open, 
  onOpenChange, 
  onPaymentSuccess,
  title = "Create Your First AI Agent",
  description = `A one-time payment of ${AGENT_CREATION_FEE} SOL is required to create your first agent. After payment, you can create up to 50 agents.`
}) => {
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
      const result = await AgentController.markUserAsPaid(signature, AGENT_CREATION_FEE.toString());
      
      // Check if validation failed
      if (result && typeof result === 'object' && 'error' in result) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {paymentStatus === PaymentStatus.INITIAL && (
            <>
              <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {isPhantomAvailable 
                    ? "Please connect your wallet and complete the payment to continue."
                    : "Phantom wallet extension not detected. Please install it from the Chrome Web Store."}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Payment Required</h3>
                  <p className="text-muted-foreground text-sm">
                    Pay {AGENT_CREATION_FEE} SOL to unlock the ability to create up to 50 agents
                  </p>
                </div>

                {!connected ? (
                  <>
                    {isPhantomAvailable ? (
                      <Button 
                        onClick={connectPhantom} 
                        className="w-full"
                        disabled={connecting}
                      >
                        {connecting ? "Connecting..." : "Connect Phantom Wallet"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => window.open("https://phantom.app/download", "_blank")} 
                        className="w-full"
                      >
                        Install Phantom Wallet
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {isPhantomAvailable 
                        ? "You'll need to approve the connection in the Phantom wallet popup" 
                        : "After installing, refresh this page"}
                    </p>
                  </>
                ) : (
                  <Button onClick={handlePayment} className="w-full">
                    Pay {AGENT_CREATION_FEE} SOL
                  </Button>
                )}
              </div>
            </>
          )}

          {paymentStatus === PaymentStatus.PROCESSING && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-lg font-medium">Processing Payment</p>
              <p className="text-muted-foreground text-center text-sm">
                Please wait while we confirm your payment. This may take a few moments.
              </p>
            </div>
          )}

          {paymentStatus === PaymentStatus.SUCCESS && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-lg font-medium">Payment Successful!</p>
              <p className="text-muted-foreground text-center text-sm">
                You can now create up to 50 agents. Redirecting you shortly...
              </p>
              {txSignature && (
                <a 
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  View transaction on Solscan
                </a>
              )}
            </div>
          )}

          {paymentStatus === PaymentStatus.ERROR && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-lg font-medium">Payment Failed</p>
              <p className="text-muted-foreground text-center text-sm">
                {paymentError || "An error occurred while processing your payment. Please try again."}
              </p>
              <Button onClick={() => setPaymentStatus(PaymentStatus.INITIAL)} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 