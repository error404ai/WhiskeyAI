import { ArrowLeft, Rocket, Twitter, Wallet, TestTube } from "lucide-react"
import Link from "next/link"

export default function LaunchPage() {
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
                <h1 className="text-4xl font-bold tracking-tight">Finalize & Launch</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    The Finalize & Launch step is where you connect necessary accounts, test your agent&apos;s functionality, and
                    deploy it to start working for you.
                </p>

                <h2>Finalize & Test</h2>
                <p>
                    Before deploying your agent, it&apos;s important to test its behavior to ensure it works as expected. This step
                    allows you to verify all configurations and make any necessary adjustments.
                </p>

                <div className="not-prose my-6 rounded-lg border p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <TestTube className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Testing Options</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">Test your agent&apos;s behavior before deployment</p>

                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <div className="rounded-md bg-muted px-3 py-1 text-sm font-medium">Twitter API</div>
                            <div className="rounded-md bg-muted px-3 py-1 text-sm font-medium">Dexscreener API</div>
                            <div className="rounded-md bg-muted px-3 py-1 text-sm font-medium">Coinmarket API</div>
                            <div className="rounded-md bg-muted px-3 py-1 text-sm font-medium">RPC API</div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Select the APIs you want to test. Each API test will verify that your agent can successfully connect and
                            perform the necessary operations.
                        </p>
                    </div>
                </div>

                <h2>Connect Required Accounts</h2>

                <h3>Twitter Integration</h3>
                <p>
                    To enable your agent to interact with Twitter, you need to connect your Twitter account and set up developer
                    credentials:
                </p>

                <div className="not-prose my-6 space-y-6">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                <Twitter className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-medium">Connect Twitter</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Link your Twitter account to allow your agent to post tweets and interact with users.
                                </p>
                                <button className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                                    Connect Twitter
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Setup Twitter Developer</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Configure your Twitter Developer account to enable API access for your agent.
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Tutorial</span>
                            <button className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                                View Tutorial
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 bg-blue-50/50 dark:bg-blue-950/20">
                        <h4 className="font-medium mb-2">Callback URL Configuration</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            When setting up your Twitter App, use the callback URL below in your Twitter Developer Portal:
                        </p>
                        <div className="flex items-center justify-between bg-background rounded border p-2 text-sm">
                            <code>https://thewhiskey.io/api/socialite/twitter</code>
                            <button className="text-muted-foreground hover:text-foreground">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-copy"
                                >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c0-1.1.9-2 2-2h2" />
                                    <path d="M4 12c0-1.1.9-2 2-2h2" />
                                    <path d="M4 8c0-1.1.9-2 2-2h2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-2">Client ID</h4>
                            <input
                                type="text"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Enter your Twitter API Client ID"
                            />
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-2">Client Secret</h4>
                            <input
                                type="password"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="••••••••••••••••••••••••••••••••"
                            />
                        </div>

                        <button className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                            Save Credentials
                        </button>
                    </div>
                </div>

                <h3>Connect Wallet</h3>
                <p>
                    Connecting a cryptocurrency wallet allows your agent to interact with blockchain networks and perform
                    token-related operations.
                </p>

                <div className="not-prose my-6 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                                <Wallet className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-medium">Connect Wallet</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Link your cryptocurrency wallet to enable blockchain interactions.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-green-600 font-medium">Wallet Connected</span>
                        </div>
                    </div>
                </div>

                <h3>Launch Type</h3>
                <p>
                    Choose how you want to deploy your agent. Different launch types have different requirements and capabilities.
                </p>

                <div className="not-prose my-6 rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Select Launch Type</h4>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="no_token">No Token (Free)</option>
                        <option value="token_required">Token Required</option>
                        <option value="premium">Premium</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-2">
                        The &quot;No Token&quot; option allows you to deploy your agent without requiring tokens, but with limited
                        functionality.
                    </p>
                </div>

                <h2>Deploy Your Agent</h2>
                <p>
                    Once you&apos;ve completed all the necessary configurations and tests, you&apos;re ready to deploy your agent. Click the
                    &quot;Deploy Agent&quot; button to launch your agent and start it working for you.
                </p>

                <div className="not-prose my-6">
                    <button className="w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90">
                        <Rocket className="mr-2 h-4 w-4" />
                        Deploy Agent
                    </button>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 dark:bg-amber-950/30 dark:border-amber-500/50">
                    <h3 className="text-amber-800 dark:text-amber-400 font-medium">Important Note</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                        After deployment, your agent will start operating according to the triggers and functions you&apos;ve configured.
                        You can monitor its performance and make adjustments at any time through the Agent Dashboard.
                    </p>
                </div>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started/functions">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Configure Functions
                        </div>
                    </div>
                </Link>
                <div className="opacity-50">
                    <span className="text-sm text-muted-foreground">Next</span>
                </div>
            </div>
        </div>
    )
}

