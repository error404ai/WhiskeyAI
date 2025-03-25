import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link
                    href="/docs/getting-started"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Getting Started
                </Link>
                <h6 className="text-primary font-medium mb-2">GETTING STARTED</h6>
                <h1 className="text-4xl font-bold tracking-tight">Agent Dashboard</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    The Agent Dashboard is your command center for creating, monitoring, and managing all your AI agents.
                </p>

                <h2>Dashboard Overview</h2>

                <p>When you first log in to Whiskey.io, you&apos;ll be taken to the Agent Dashboard. This is where you can:</p>

                <ul>
                    <li>View all your existing agents and their status</li>
                    <li>Monitor agent performance and activity</li>
                    <li>Create new agents</li>
                    <li>Access agent settings and configurations</li>
                    <li>View token usage and balance</li>
                </ul>

                <h2>Creating a New Agent</h2>

                <p>
                    To create a new agent, click the &quot;Create New Agent&quot; button in the top right corner of the dashboard. This will
                    start the agent creation wizard, which will guide you through the process step by step.
                </p>

                <h2>Managing Existing Agents</h2>

                <p>For each agent in your dashboard, you wll see:</p>

                <ul>
                    <li>
                        <strong>Status indicator</strong> - Shows if the agent is active, paused, or has encountered an error
                    </li>
                    <li>
                        <strong>Performance metrics</strong> - Displays key statistics about your agents activities
                    </li>
                    <li>
                        <strong>Action buttons</strong> - Quick access to edit, pause/resume, or delete the agent
                    </li>
                </ul>

                <p>
                    Click on any agent card to access its detailed view, where you can see a complete activity log, performance
                    analytics, and access all configuration options.
                </p>

                <h2>Token Balance</h2>

                <p>
                    At the top of the dashboard, you wll see your current Whiskey token balance. This shows how many tokens you
                    have available for your agents to use. You can click on this balance to access token management options,
                    including purchasing more tokens or viewing your usage history.
                </p>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Getting Started
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/information">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Information
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

