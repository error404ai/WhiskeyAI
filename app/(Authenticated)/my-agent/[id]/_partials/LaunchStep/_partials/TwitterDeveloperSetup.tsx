"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react"
import { useParams } from "next/navigation"
import * as AgentController from "@/http/controllers/agent/AgentController"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { twitterCredentialsSchema } from "@/http/zodSchema/twitterCredentialsSchema"
import { z } from "zod"

export default function TwitterDeveloperSetup() {
    const [tutorialOpen, setTutorialOpen] = useState(false)
    const agentUuid = useParams().id as string

    const { data: agent, refetch } = useQuery({
        queryKey: ["getAgentByUuid", agentUuid],
        queryFn: () => AgentController.getAgentByUuid(agentUuid),
        enabled: !!agentUuid,
    })

    const methods = useForm<z.infer<typeof twitterCredentialsSchema>>({
        mode: "onTouched",
        resolver: zodResolver(twitterCredentialsSchema),
        defaultValues: {
            clientId: "",
            clientSecret: "",
        }
    })

    // Update form values when agent data is loaded
    useEffect(() => {
        if (agent) {
            methods.reset({
                clientId: agent.twitterClientId || "",
                clientSecret: agent.twitterClientSecret || "",
            });
        }
    }, [agent, methods]);

    const onSubmit = async (data: z.infer<typeof twitterCredentialsSchema>) => {
        try {
            await AgentController.updateAgentTwitterCredentials(agentUuid, data)
            await refetch()
            toast.success("Twitter credentials saved successfully")
            setTimeout(() => {
                methods.reset({}, { keepValues: true, keepIsSubmitSuccessful: false })
            }, 2000)
        } catch (error) {
            toast.error("Failed to save credentials")
            console.error(error)
        }
    }

    return (
        <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
                <Label className="text-base font-medium">Setup Twitter Developer</Label>
                <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="flex items-center gap-1">
                            <InfoIcon className="h-4 w-4" />
                            Tutorial
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>How to get Twitter Developer Credentials</DialogTitle>
                            <DialogDescription>
                                Follow this tutorial to set up your Twitter Developer account and get your Client ID and Client Secret.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/KNgg7a47y6g"
                                    title="Twitter Developer Setup Tutorial"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            <h3 className="font-medium">Quick Steps:</h3>
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>
                                    Go to{" "}
                                    <a
                                        href="https://developer.twitter.com"
                                        className="text-primary underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        developer.twitter.com
                                    </a>
                                </li>
                                <li>Sign in and create a new project</li>
                                <li>Create an app within your project</li>
                                <li>Navigate to the &quot;Keys and Tokens&quot; tab</li>
                                <li>Copy your Client ID and Client Secret</li>
                                <li>Paste them in the form below</li>
                            </ol>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Input 
                            id="clientId"
                            label="Client ID"
                            placeholder="Enter Client ID" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Input 
                            id="clientSecret"
                            label="Client Secret"
                            type="password"
                            placeholder="Enter Client Secret" 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="submit" loading={methods.formState.isSubmitting}>
                            Save Credentials
                        </Button>
                        {methods.formState.isSubmitSuccessful && (
                            <Badge className="py-2" variant={"success"}>
                                Saved
                            </Badge>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    )
} 