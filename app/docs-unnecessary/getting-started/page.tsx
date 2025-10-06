import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GettingStartedPage() {
    return (
        <div className="space-y-8">
            <div>
                <h6 className="text-primary font-medium mb-2">CREATE AN AGENT</h6>
                <h1 className="text-4xl font-bold tracking-tight">Getting Started</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    Welcome to Whiskey.io! This guide will walk you through the process of creating your first AI agent.
                </p>

                <p>
                    Creating an agent with Whiskey.io is a straightforward process that doesn&apos;t require any coding knowledge.
                    You&apos;ll configure your agent through a series of simple steps, and we&apos;ll guide you through each one.
                </p>

                <h2>The Agent Creation Process</h2>

                <p>Creating an agent involves the following steps:</p>

                <ol>
                    <li>
                        <strong>Agent Dashboard</strong> - Access your control center for creating and managing agents
                    </li>
                    <li>
                        <strong>Information</strong> - Set up the basic details and personality of your agent
                    </li>
                    <li>
                        <strong>Twitter Configuration</strong> - Connect your Twitter account and set permissions
                    </li>
                    <li>
                        <strong>Configure Triggers</strong> - Define when and why your agent should take action
                    </li>
                    <li>
                        <strong>Configure Functions</strong> - Select what actions your agent can perform
                    </li>
                    <li>
                        <strong>Finalize and Launch</strong> - Review settings and deploy your agent
                    </li>
                </ol>

                <p>
                    Each step is designed to be intuitive, with helpful tooltips and examples to guide you through the process.
                    Let&apos;s get started by exploring each step in detail.
                </p>
            </div>

            <div className="flex flex-col space-y-4 mt-6">
                <h3 className="text-lg font-medium">Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/docs/getting-started/dashboard" className="no-underline">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:bg-muted/50 transition-colors">
                            <h4 className="font-medium mb-1">Agent Dashboard</h4>
                            <p className="text-sm text-muted-foreground">
                                Access your control center for creating and managing agents
                            </p>
                            <Button variant="link" className="px-0 mt-2">
                                Learn more <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                    <Link href="/docs/getting-started/information" className="no-underline">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:bg-muted/50 transition-colors">
                            <h4 className="font-medium mb-1">Information</h4>
                            <p className="text-sm text-muted-foreground">Set up the basic details and personality of your agent</p>
                            <Button variant="link" className="px-0 mt-2">
                                Learn more <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                {/* <Link href="/docs/tokenomics">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Tokenomics
                        </div>
                    </div>
                </Link> */}

                <Link href="/docs/links">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Official Links
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/dashboard">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Agent Dashboard
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

