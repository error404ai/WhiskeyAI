"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"

type TabType = "memory" | "simulation" | "connect" | "launch" | "custom_texts" | "post_id"

function LaunchStep() {
    const [activeTab, setActiveTab] = useState<TabType>("simulation")
    const [innerSimulateActiveTab, setinnerSimulateActiveTab] = useState<TabType>("custom_texts")
    const [formData, setFormData] = useState({
        memory: {
            management: "",
        },
        connect: {
            twitter: "",
            discordBot: "",
            telegramBot: "",
        },
        voice: {
            apiKey: "",
        },
        launch: {
            configuration: "",
        },
    })

    const tabs: { id: TabType; label: string }[] = [
        { id: "simulation", label: "Simulate" },
        { id: "memory", label: "Memory" },
        // { id: "connect", label: "Connect" },
        // { id: "launch", label: "Launch" },
    ]

    const innerSimulateTabs: { id: TabType; label: string }[] = [
        { id: "custom_texts", label: "Custom Texts" },
        { id: "post_id", label: "Post Id" },
        // { id: "connect", label: "Connect" },
        // { id: "launch", label: "Launch" },
    ]

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Finalize & Test</h2>
                        <p className="text-muted-foreground text-sm">
                            Test your agent&apos;s behavior before deployment. Make sure to test your changes before updating.
                        </p>
                    </div>

                    <div className="flex w-full">
                        {tabs.map((tab) => (
                            <div key={tab.id} className="w-1/2 px-1">
                                <Button
                                    variant={activeTab === tab.id ? "default" : "outline"}
                                    className={cn("w-full", activeTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </Button>
                            </div>
                        ))}
                    </div>



                    <div className="mt-6">
                        {activeTab === "memory" && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Memory Management</Label>
                                    <p className="text-sm text-muted-foreground mb-2">Manage your agent&apos;s memory</p>
                                    <Textarea
                                        placeholder="Agent cache layer (based on 32 bit tokens which is aligned critical between your data and the NLP). If you are storing the maximum you can set how much you get back."
                                        value={formData.memory.management}
                                        onChange={(e) =>
                                            setFormData({ ...formData, memory: { ...formData.memory, management: e.target.value } })
                                        }
                                        className="min-h-[200px]"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "simulation" && (
                            <div className="space-y-4 rounded-xl border p-4">
                                <div className="flex justify-between">
                                    <div>
                                        <Label>Simulate Reaction</Label>
                                        <p className="text-sm text-muted-foreground mb-2">Test how your agent reacts to content</p>
                                    </div>
                                    <Button size="sm" className="group">
                                        Simulate
                                        <Bot className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                                    </Button>
                                </div>

                                <div className="flex w-full">
                                    {innerSimulateTabs.map((tab) => (
                                        <div key={tab.id} className="w-1/2 px-1">
                                            <Button
                                                key={tab.id}
                                                variant={innerSimulateActiveTab === tab.id ? "default" : "outline"}
                                                className={cn("flex-1 w-full", innerSimulateActiveTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                                onClick={() => setinnerSimulateActiveTab(tab.id)}
                                            >
                                                {tab.label}
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label>Choose function(s) to test</Label>
                                    <div className="flex gap-2">

                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            defaultValue="post_tweet"
                                        >
                                            <option value="post_tweet">post_tweet</option>
                                            <option value="reply_tweet">reply_tweet</option>
                                            <option value="like_tweet">like_tweet</option>
                                            <option value="quote_tweet">quote_tweet</option>
                                            <option value="retweet">retweet</option>
                                        </select>
                                    </div>
                                </div>

                                {innerSimulateActiveTab === "custom_texts" && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Enter text to react to</Label>
                                            <Textarea
                                                placeholder="Enter the text you want the agent to react to..."
                                                value={formData.memory.management}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, memory: { ...formData.memory, management: e.target.value } })
                                                }
                                                className="min-h-[200px]"
                                            />
                                        </div>
                                    </div>
                                )}
                                {innerSimulateActiveTab === "post_id" && (
                                    <div className="space-y-2">
                                        <div>
                                            <Label>X (Twitter) Post ID</Label>
                                            <Input
                                                placeholder="Enter post ID (e.g., 1234567890)"
                                                value={formData.connect.twitter}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, connect: { ...formData.connect, twitter: e.target.value } })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* <div>
                                <Label>Simulation Logs</Label>
                                <p className="text-sm text-muted-foreground mb-2">Run your simulated prompts</p>
                                <div className="h-[200px] rounded-md border bg-muted/10 p-4">
                                    <p className="text-sm text-muted-foreground">Simulation results will appear here...</p>
                                </div>
                            </div> */}
                            </div>
                        )}
                        <div className="space-y-4 rounded-xl border p-4 mt-4">
                            <div className="flex justify-between">
                                <div>

                                    <Label>Connect Twitter
                                    </Label>
                                </div>

                            </div>
                            <Button variant={"outline"} className="flex-1 w-full">
                                Connect
                            </Button>
                        </div>
                        <div className="space-y-4 rounded-xl border p-4 mt-4">
                            <div className="flex justify-between">
                                <div>
                                    <Label>Wallet Management
                                    </Label>
                                </div>

                            </div>
                            <div className="space-y-2">
                                <div>
                                    <Label>Solana Public Wallet</Label>
                                    <Input
                                        placeholder="Enter post ID (e.g., 1234567890)"
                                        value="HcCUDzFp8RPD8FcKheFiUL9LxddNYuqcomwKqm2zhJhg"
                                        onChange={(e) =>
                                            setFormData({ ...formData, connect: { ...formData.connect, twitter: e.target.value } })
                                        }
                                    />
                                </div>
                            </div>
                        </div>


                        {/* {activeTab === "connect" && (
                        <div className="space-y-6">
                            <div>
                                <Label>Connect Twitter</Label>
                                <Input
                                    placeholder="Enter Twitter API Key"
                                    value={formData.connect.twitter}
                                    onChange={(e) =>
                                        setFormData({ ...formData, connect: { ...formData.connect, twitter: e.target.value } })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Connect Discord Bot</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    To add the Discord Bot, head up to the Discord Developer Portal, create a new application, and then
                                    create a bot user.
                                </p>
                                <Input
                                    placeholder="Enter Discord Bot Key"
                                    value={formData.connect.discordBot}
                                    onChange={(e) =>
                                        setFormData({ ...formData, connect: { ...formData.connect, discordBot: e.target.value } })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Connect Telegram Bot</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Configure your Telegram bot by obtaining a Bot Token on Telegram. Once you have the token, enter it
                                    below.
                                </p>
                                <Input
                                    placeholder="Enter Telegram Bot Key"
                                    value={formData.connect.telegramBot}
                                    onChange={(e) =>
                                        setFormData({ ...formData, connect: { ...formData.connect, telegramBot: e.target.value } })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Voice Configuration</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Configure your Eleven Labs Voice ID for your agent voice. Only connect if you want to use voice
                                    features.
                                </p>
                                <Input
                                    placeholder="Enter Voice Lab ID"
                                    value={formData.voice.apiKey}
                                    onChange={(e) => setFormData({ ...formData, voice: { ...formData.voice, apiKey: e.target.value } })}
                                />
                            </div>
                        </div>
                    )} */}

                        {/* {activeTab === "launch" && (
                        <div className="space-y-4">
                            <div>
                                <Label>Launch Configuration</Label>
                                <Select
                                    value={formData.launch.configuration}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, launch: { ...formData.launch, configuration: value } })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="No Team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="team">Team</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center mt-2">
                                    <input type="checkbox" id="confirm" className="mr-2" />
                                    <label htmlFor="confirm" className="text-sm text-muted-foreground">
                                        I will take care and verify my Config ID is SAFE4All
                                    </label>
                                </div>
                            </div>
                        </div>
                    )} */}
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Connect Model</Button>
                </div>
            </div>
        </div >
    )
}

export default LaunchStep

