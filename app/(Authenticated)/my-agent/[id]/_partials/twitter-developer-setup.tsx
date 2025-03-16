"use client"

import { useState } from "react"
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

export default function TwitterDeveloperSetup() {
    const [open, setOpen] = useState(false)

    return (
        <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
                <Label className="text-base font-medium">Setup Twitter Developer</Label>
                <Dialog open={open} onOpenChange={setOpen}>
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
                                Follow this tutorial to set up your Twitter Developer account and get your Access Token and Secret Key.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            {/* Replace with actual video embed */}
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
                                <li>Generate your Access Token and Secret Key</li>
                                <li>Copy and paste these</li>
                            </ol>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="devAccessToken">Access Token</Label>
                    <Input id="devAccessToken" required name="devAccessToken" placeholder="Enter Access Token" defaultValue="" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="devSecretKey">Secret Key</Label>
                    <Input id="devSecretKey" name="devSecretKey" required placeholder="Enter Secret Key" defaultValue="" />
                </div>
                <Button className="w-full">Save Credentials</Button>
            </div>
        </div>
    )
}

