import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import PaymentDialog from "./PaymentDialog";
import { useQuery } from "@tanstack/react-query";

type AgentCreateProps = {
  refetch: () => void;
};

const AgentCreate: React.FC<AgentCreateProps> = ({ refetch }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [attemptingToCreate, setAttemptingToCreate] = useState<boolean>(false);

  // Check if user has already paid
  const { data: hasPaid, refetch: refetchPaymentStatus } = useQuery({
    queryKey: ["hasUserPaidForAgents"],
    queryFn: AgentController.hasUserPaidForAgents,
  });

  // Check how many agents user has
  const { data: agentCount, refetch: refetchAgentCount } = useQuery({
    queryKey: ["countUserAgents"],
    queryFn: AgentController.countUserAgents,
  });

  const methods = useForm<z.infer<typeof agentCreateSchema>>({
    mode: "onTouched",
    resolver: zodResolver(agentCreateSchema),
  });

  useEffect(() => {
    // When the form is closed, reset the attempting state
    if (!modalOpen) {
      setAttemptingToCreate(false);
    }
  }, [modalOpen]);

  const handleFormSubmit = async (data: z.infer<typeof agentCreateSchema>) => {
    // Check if user can create an agent
    if (!hasPaid && agentCount === 0) {
      // User needs to pay for their first agent
      setAttemptingToCreate(true);
      setShowPaymentDialog(true);
      return;
    }

    // If they've paid or this isn't their first agent, proceed
    if (hasPaid || (agentCount && agentCount > 0)) {
      await createAgent(data);
    }
  };

  const createAgent = async (data: z.infer<typeof agentCreateSchema>) => {
    await AgentController.createAgent(data);
    refetch();
    refetchAgentCount();
    setModalOpen(false);
    methods.reset();
  };

  const handlePaymentSuccess = () => {
    refetchPaymentStatus();
    
    // If the user was attempting to create an agent when prompted to pay,
    // automatically proceed with agent creation after payment
    if (attemptingToCreate) {
      createAgent(methods.getValues());
    }
  };

  if (methods.formState.isSubmitSuccessful && !attemptingToCreate) {
    setModalOpen(false);
    methods.reset();
  }

  // Check if user has reached the agent limit
  const hasReachedAgentLimit = agentCount !== undefined && agentCount >= 50;

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger>
          <Button as={"div"} disabled={hasReachedAgentLimit}>
            <Plus /> Create New Agent
            {hasReachedAgentLimit && <span className="ml-2 text-xs">(Limit reached)</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <FormProvider {...methods}>
            <form className="space-y-6" onSubmit={methods.handleSubmit(handleFormSubmit)}>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input id="link" label="Agent Name" name="name" placeholder="e.g. whiskeyAI" />
                <Input id="link" label="Ticker Symbol" name="tickerSymbol" placeholder="e.g. $whiskeyAI" />
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p>Configure your agent&apos;s behavior and personality anytime by clicking the Configure button. You can launch the token when you&apos;re ready from the configuration page.</p>
              </div>
              <DialogFooter className="flex justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <Button loading={methods.formState.isSubmitting}>Create Agent</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog 
        open={showPaymentDialog} 
        onOpenChange={setShowPaymentDialog} 
        onPaymentSuccess={handlePaymentSuccess} 
      />
    </>
  );
};

export default AgentCreate;
