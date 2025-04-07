import { ArrowLeft, ArrowRight, Clock, Zap, Plus } from "lucide-react"
import Link from "next/link"

export default function TriggersPage() {
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
                <h1 className="text-4xl font-bold tracking-tight">Configure Triggers</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    Triggers define when and why your agent takes action. This step allows you to set up custom triggers that will
                    activate your agent based on specific conditions.
                </p>

                <h2>Understanding Triggers</h2>
                <p>
                    Triggers are the events or conditions that cause your agent to perform actions. They determine when your agent
                    should wake up and do something. Without triggers, your agent would remain dormant.
                </p>

                <div className="not-prose my-6 rounded-lg border p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Creating a Trigger</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">Follow these steps to create a new trigger</p>

                    <div className="space-y-6">
                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-3">Step 1: Basic Information</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Trigger Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        Enter Trigger Name
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Give your trigger a descriptive name (e.g., &quot;Daily Market Update&quot;)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Trigger Description <span className="text-red-500">*</span>
                                    </label>
                                    <div className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]">
                                        What does this trigger do?
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Describe what this trigger does and when it should activate
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-3">Step 2: Schedule</h4>
                            <div className="flex items-end gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">How Often Should The Trigger Run?</label>
                                    <input
                                        type="number"
                                        className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="15"
                                    />
                                </div>
                                <div>
                                    <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option>Select a unit</option>
                                        <option>minutes</option>
                                        <option>hours</option>
                                        <option>days</option>
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Set how frequently this trigger should check for conditions and activate
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-3">Step 3: Function (Optional)</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Switch to the Function tab to select which function this trigger should call when activated
                            </p>
                            <div className="flex gap-2">
                                <div className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">Basic</div>
                                <div className="rounded-md bg-muted px-3 py-1 text-sm font-medium">Function</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
                                Cancel
                            </button>
                            <button className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium">Save Trigger</button>
                        </div>
                    </div>
                </div>

                <h2>Example Triggers</h2>

                <div className="not-prose my-6 space-y-6">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-medium">post tweet</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Get the latest top posted tokens in twitter and swag se post karo
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Runs every 15 minutes</span>
                                </div>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-dashed p-4 flex items-center justify-center">
                        <button className="flex flex-col items-center text-muted-foreground hover:text-foreground">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm mt-2">Add Trigger</span>
                        </button>
                    </div>
                </div>

                <h3>Common Trigger Types</h3>
                <p>Whiskey.io supports various types of triggers to automate your agent&apos;s actions:</p>

                <ul>
                    <li>
                        <strong>Time-based triggers</strong> - Run your agent at specific intervals or times
                    </li>
                    <li>
                        <strong>Event-based triggers</strong> - Activate your agent when specific events occur (e.g., new mentions
                        on Twitter)
                    </li>
                    <li>
                        <strong>Data-based triggers</strong> - Trigger your agent when data conditions are met (e.g., price changes)
                    </li>
                    <li>
                        <strong>API triggers</strong> - Connect to external APIs to trigger your agent based on external events
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 dark:bg-amber-950/30 dark:border-amber-500/50">
                    <h3 className="text-amber-800 dark:text-amber-400 font-medium">Best Practice</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                        Start with simple triggers and gradually add complexity as you become more familiar with how your agent
                        works. Test each trigger thoroughly before adding new ones to ensure they function as expected.
                    </p>
                </div>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started/twitter-configuration">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Platform Configuration
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/functions">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Configure Functions
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

