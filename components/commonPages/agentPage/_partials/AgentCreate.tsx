import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as AgentController from "@/http/controllers/agent/AgentController";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

type AgentCreateProps = {
  refetch: () => void;
};

const AgentCreate: React.FC<AgentCreateProps> = ({ refetch }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const methods = useForm<z.infer<typeof agentCreateSchema>>({
    mode: "onTouched",
    resolver: zodResolver(agentCreateSchema),
  });
  const onSubmit = async (data: z.infer<typeof agentCreateSchema>) => {
    await AgentController.createAgent(data);
    refetch();
  };

  if (methods.formState.isSubmitSuccessful) {
    setModalOpen(false);

    methods.reset();
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger>
        <Button as={"div"}>
          <Plus /> Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <FormProvider {...methods}>
          <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>
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
  );
};

export default AgentCreate;
