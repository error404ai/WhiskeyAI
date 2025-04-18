import { Switch } from "@/components/DatePicker/Switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AgentPlatformList } from "@/db/schema";
import * as AgentController from "@/server/controllers/agent/AgentController";
import { useQuery } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Twitter } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const PlatformStep = () => {
  const params = useParams();
  const agentUuid = params.id as string;

  const {
    isPending,
    isFetching,
    data: agent,
    refetch,
  } = useQuery({
    queryKey: ["getAgentByUuid"],
    queryFn: () => AgentController.getAgentByUuid(agentUuid),
  });

  const [platformOpen, setPlatformOpen] = useState(false);
  const [platforms, setPlatforms] = useState<AgentPlatformList[]>([]);
  const [status, setStatus] = useState<StatusType>("initial");
  const availablePlatforms: AgentPlatformList[] = [
    {
      name: "Twitter",
      description: "Automate your Twitter account by connecting it to your agent. Use natural language to schedule tweets, respond to mentions, and more.",
      enabled: true,
    },
  ];

  const handleAddPlatform = async (platform: AgentPlatformList) => {
    if (!platforms.some((p) => p.name === platform.name)) {
      setPlatforms([...platforms, { ...platform, enabled: false }]);
    }
    setPlatformOpen(false);
  };

  const handleDeletePlatform = async (platform: AgentPlatformList) => {
    setPlatforms(platforms.filter((p) => p.name !== platform.name));
  };

  const handleSavePlatformsList = async () => {
    setStatus("loading");
    await AgentController.storeAgentPlatformList(agentUuid, platforms);
    refetch();
    setStatus("success");
    setTimeout(() => {
      setStatus("initial");
    }, 2000);
  };

  useEffect(() => {
    if (agent && agent.agentPlatformList) {
      setPlatforms(agent.agentPlatformList);
    }
  }, [agent]);

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configure Platforms</h2>
        <p className="text-muted-foreground text-sm">Choose which platforms you want your agent on</p>
        {(isFetching || isPending) && <Skeleton className="mb-4" height={100} />}
        {!isFetching && !isPending && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {platforms?.map((platform) => (
              <Card key={platform.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted rounded-lg p-2">{platform.name === "Twitter" && <Twitter className="h-6 w-6" />}</div>
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <p className="text-muted-foreground text-sm">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlatform(platform)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Switch checked={true} />
                  </div>
                </div>
              </Card>
            ))}

            <Dialog open={platformOpen} onOpenChange={setPlatformOpen}>
              <DialogTrigger asChild>
                <Card className="hover:bg-muted/50 flex h-[104px] cursor-pointer items-center justify-center border-dashed p-4">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add Platform</span>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Platform</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {availablePlatforms
                    .filter((p) => !platforms?.find((existing) => existing.name === p.name))
                    .map((platform) => (
                      <Card key={platform.name} className="hover:bg-muted/50 cursor-pointer p-4" onClick={() => handleAddPlatform(platform)}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-muted rounded-lg p-2">{platform.name === "Twitter" && <Twitter className="h-6 w-6" />}</div>
                          <div>
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-muted-foreground max-w-[300px] text-sm">{platform.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <div className="flex gap-3">
          <Button parentClass="w-fit" loading={status === "loading"} onClick={handleSavePlatformsList}>
            Save
          </Button>
          {status === "success" && (
            <Badge variant={"success"} className="py-2">
              Success
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformStep;
