import { ArrowLeft, ArrowRight, Code } from "lucide-react"
import Link from "next/link"

export default function FunctionsPage() {
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
                <h1 className="text-4xl font-bold tracking-tight">Configure Functions</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    Functions define what actions your agent can perform. This step allows you to select and configure the
                    specific capabilities your agent will have.
                </p>

                <h2>Understanding Functions</h2>
                <p>
                    Functions are the building blocks of your agent&apos;s capabilities. They define the specific actions your agent
                    can take, such as posting tweets, analyzing data, or responding to messages. Each function is designed to
                    perform a specific task and can be triggered based on the conditions you set up in the previous step.
                </p>

                <div className="not-prose my-6 rounded-lg border p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Code className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Function Categories</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">Different types of actions your agent can perform</p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
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
                                    className="text-blue-500"
                                >
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                                <h4 className="font-medium">Twitter Functions</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Post tweets, reply to mentions, send direct messages, follow/unfollow users, and more.
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
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
                                    className="text-green-500"
                                >
                                    <path d="M3 3v18h18" />
                                    <path d="m19 9-5 5-4-4-3 3" />
                                </svg>
                                <h4 className="font-medium">Data Analysis</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Analyze market data, track trends, calculate metrics, and generate insights.
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
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
                                    className="text-purple-500"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                    <path d="M2 12h20" />
                                </svg>
                                <h4 className="font-medium">Web Interactions</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Fetch data from websites, interact with APIs, and monitor online resources.
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
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
                                    className="text-orange-500"
                                >
                                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <h4 className="font-medium">Notification Functions</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Send alerts, notifications, and reports through various channels.
                            </p>
                        </div>
                    </div>
                </div>

                <h2>Adding Functions to Your Agent</h2>

                <p>To add a function to your agent, follow these steps:</p>

                <ol>
                    <li>Click the &quot;Add Function&quot; button in the Configure Functions section</li>
                    <li>Browse or search for the function you want to add</li>
                    <li>Configure the function parameters</li>
                    <li>Save the function to your agent</li>
                </ol>

                <h3>Function Configuration</h3>

                <div className="not-prose my-6 space-y-6">
                    <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Function Name</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            Each function has a unique name that identifies its purpose.
                        </p>
                        <div className="bg-muted/50 rounded-md p-3 text-sm">Example: &quot;post_tweet&quot; or &quot;analyze_market_data&quot;</div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Function Description</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            A detailed description of what the function does and when it should be used.
                        </p>
                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                            Example: &quot;Posts a tweet with the provided content. Use this function when you want to share information
                            with your followers.&quot;
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Function Arguments</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            The inputs that the function requires to perform its task.
                        </p>
                        <div className="space-y-3">
                            <div className="bg-muted/50 rounded-md p-3 text-sm">
                                <strong>tweet_content</strong> (string): The text content of the tweet to be posted.
                            </div>
                            <div className="bg-muted/50 rounded-md p-3 text-sm">
                                <strong>include_hashtags</strong> (boolean, optional): Whether to automatically add relevant hashtags.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Usage Hints</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            Best practices and constraints for using the function effectively.
                        </p>
                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                            Example: &quot;Keep tweets under 280 characters. Include relevant hashtags for better visibility. Avoid posting
                            similar content too frequently.&quot;
                        </div>
                    </div>
                </div>

                <h3>Creating Custom Functions</h3>
                <p>
                    While Whiskey.io provides a wide range of pre-built functions, you can also create custom functions to meet
                    your specific needs:
                </p>

                <ul>
                    <li>
                        <strong>Function Builder</strong> - Use our no-code function builder to create custom functions without
                        writing code
                    </li>
                    <li>
                        <strong>API Integration</strong> - Connect to external APIs to extend your agent&apos;s capabilities
                    </li>
                    <li>
                        <strong>Function Chaining</strong> - Combine multiple functions to create complex workflows
                    </li>
                    <li>
                        <strong>Custom Parameters</strong> - Define custom parameters to make your functions more flexible
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 dark:bg-amber-950/30 dark:border-amber-500/50">
                    <h3 className="text-amber-800 dark:text-amber-400 font-medium">Testing Your Functions</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                        Before finalizing your agent, test each function individually to ensure it works as expected. Use the &quot;Test
                        Function&quot; button to run the function with sample inputs and verify the outputs.
                    </p>
                </div>

                <h2>Function Permissions</h2>
                <p>
                    Different functions require different levels of permissions. For example, functions that post content on your
                    behalf require write access to your accounts, while functions that only read data require read-only access.
                </p>

                <p>
                    When adding functions to your agent, make sure you understand the permissions they require and only grant the
                    necessary permissions. This helps maintain the security of your accounts and data.
                </p>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started/triggers">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Configure Triggers
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/launch">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Finalize & Launch
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

