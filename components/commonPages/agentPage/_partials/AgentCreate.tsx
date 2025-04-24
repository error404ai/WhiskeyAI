import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { agentCreateSchema } from "@/server/zodSchema/agentCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type AgentCreateProps = {
  refetch: () => void;
};

const AgentCreate: React.FC<AgentCreateProps> = ({ refetch }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Check how many agents user has
  const { data: agentCount, refetch: refetchAgentCount } = useQuery({
    queryKey: ["countUserAgents"],
    queryFn: AgentController.countUserAgents,
  });

  // Get user's max agents from the server
  const { data: maxAgents = 0 } = useQuery({
    queryKey: ["getUserMaxAgents"],
    queryFn: AgentController.getUserMaxAgents,
  });

  const methods = useForm<z.infer<typeof agentCreateSchema>>({
    mode: "onTouched",
    resolver: zodResolver(agentCreateSchema),
  });

  useEffect(() => {
    // When the form is closed, reset the form
    if (!modalOpen) {
      methods.reset();
    }
  }, [modalOpen, methods]);

  const handleFormSubmit = async (data: z.infer<typeof agentCreateSchema>) => {
    try {
      const result = await createAgent(data);
      if (!result.success) {
        methods.setError("root", { message: result.message || "Failed to create agent" });
        return;
      }
      refetch();
      refetchAgentCount();
      setModalOpen(false);
      methods.reset();
    } catch {
      methods.setError("root", { message: "Failed to create agent. Please try again." });
    }
  };

  const createAgent = async (data: z.infer<typeof agentCreateSchema>) => {
    return await AgentController.createAgent(data);
  };

  // Check if user has reached the agent limit
  const hasReachedAgentLimit = agentCount !== undefined && agentCount >= maxAgents;

  return (
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
              <DialogDescription>
                Create a new AI agent to manage your social media presence.
                {hasReachedAgentLimit && <span className="mt-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-700">You have reached the maximum limit of {maxAgents} agents. Please upgrade your plan to create more agents.</span>}
              </DialogDescription>
            </DialogHeader>
            {methods.formState.errors.root && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{methods.formState.errors.root.message}</div>}
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input id="name" {...methods.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
                <Input id="tickerSymbol" {...methods.register("tickerSymbol")} />
              </div>
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
  );
};

export default AgentCreate;
