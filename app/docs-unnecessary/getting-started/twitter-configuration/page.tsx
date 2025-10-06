import { ArrowLeft, ArrowRight, Settings, Twitter } from "lucide-react"
import Link from "next/link"

export default function TwitterConfigurationPage() {
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
                <h1 className="text-4xl font-bold tracking-tight">Platform Configuration</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    The Platform Configuration step is where you select and configure the platforms your AI agent will operate on.
                </p>

                <h2>Configure Platforms</h2>
                <p>
                    In this section, you&apos;ll choose which platforms you want your agent to interact with. Currently, Whiskey.io
                    supports Twitter integration, with more platforms coming soon.
                </p>

                <div className="not-prose my-6 rounded-lg border p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Platform Selection</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">Choose which platforms you want your agent to operate on</p>

                    <div className="space-y-6">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                        <Twitter className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Twitter</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Automate your Twitter account by connecting it to your agent. Use natural language to schedule
                                            tweets, respond to mentions, and more.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center h-6">
                                    <div className="w-11 h-6 bg-primary rounded-full px-1 flex items-center">
                                        <div className="bg-white w-4 h-4 rounded-full ml-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-dashed p-4 flex items-center justify-center">
                            <div className="text-center">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                                    <span className="text-xl font-medium">+</span>
                                </div>
                                <p className="text-sm font-medium">Add Platform</p>
                                <p className="text-xs text-muted-foreground mt-1">More platforms coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2>Twitter Configuration</h2>

                <h3>Connecting Your Twitter Account</h3>
                <p>To connect your Twitter account to your Whiskey.io agent, follow these steps:</p>
                <ol>
                    <li>Toggle the Twitter platform switch to &quot;On&quot;</li>
                    <li>Click the &quot;Connect Twitter&quot; button that appears</li>
                    <li>You&apos;ll be redirected to Twitter to authorize the connection</li>
                    <li>Grant the necessary permissions for your agent to function</li>
                    <li>You&apos;ll be redirected back to Whiskey.io once authorization is complete</li>
                </ol>

                <h3>Permission Levels</h3>
                <p>
                    When connecting your Twitter account, you&apos;ll need to grant specific permissions based on what you want your
                    agent to do:
                </p>
                <ul>
                    <li>
                        <strong>Read-only</strong> - Allows your agent to monitor tweets, hashtags, and trends without posting
                    </li>
                    <li>
                        <strong>Read and write</strong> - Enables your agent to post tweets and respond to mentions
                    </li>
                    <li>
                        <strong>Direct messages</strong> - Grants access to send and receive direct messages (optional)
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 dark:bg-amber-950/30 dark:border-amber-500/50">
                    <h3 className="text-amber-800 dark:text-amber-400 font-medium">Security Note</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                        Whiskey.io uses secure OAuth connections and never stores your Twitter password. You can revoke access at
                        any time through your Twitter account settings or the Whiskey.io platform.
                    </p>
                </div>

                <h3>Advanced Twitter Settings</h3>
                <p>
                    After connecting your Twitter account, you can configure advanced settings by clicking the settings icon on
                    the Twitter platform card:
                </p>
                <ul>
                    <li>
                        <strong>Posting schedule</strong> - Set preferred times for your agent to post
                    </li>
                    <li>
                        <strong>Interaction limits</strong> - Control how frequently your agent responds to mentions
                    </li>
                    <li>
                        <strong>Content guidelines</strong> - Define topics and hashtags your agent should focus on
                    </li>
                    <li>
                        <strong>Approval workflow</strong> - Optionally require manual approval before tweets are posted
                    </li>
                </ul>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started/information">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Information
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/triggers">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Configure Triggers
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

