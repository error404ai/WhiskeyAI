import { ArrowLeft, ArrowRight, Info } from "lucide-react"
import Link from "next/link"

export default function InformationPage() {
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
                <h1 className="text-4xl font-bold tracking-tight">Information</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    The Information step is where you define your agent&apos;s personality, goals, and behavior. This is the foundation
                    of your agent&apos;s identity and purpose.
                </p>

                <h2>Agent Background</h2>
                <p>
                    In this section, you&apos;ll define your agent&apos;s personality and settings. This information guides how your agent
                    interacts with users and performs tasks.
                </p>

                <div className="not-prose my-6 rounded-lg border p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Info className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Agent Definition Prompts</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">Configure your agent&apos;s behavior and capabilities</p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-2">Agent Description</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Outline your agent&apos;s personality by detailing aspects like tweeting habits, demeanor, and communication
                                style
                            </p>
                            <div className="bg-muted/50 rounded-md p-3 text-sm">
                                Example: &quot;A friendly crypto expert who shares daily market insights with a touch of humor. Uses simple
                                language to explain complex concepts and responds politely to questions.&quot;
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="font-medium mb-2">Agent Goal</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Specify the primary objective or core function of the agent. This guides the AI planner in task
                                generation.
                            </p>
                            <div className="bg-muted/50 rounded-md p-3 text-sm">
                                Example: &quot;Monitor crypto markets and share timely updates on significant price movements, emerging
                                trends, and noteworthy news to help followers make informed decisions.&quot;
                            </div>
                        </div>
                    </div>
                </div>

                <h2>Best Practices for Agent Definition</h2>

                <h3>Writing Effective Descriptions</h3>
                <ul>
                    <li>
                        <strong>Be specific and detailed</strong> - The more information you provide, the better your agent will
                        understand its role
                    </li>
                    <li>
                        <strong>Define communication style</strong> - Specify tone (formal, casual, humorous), vocabulary level, and
                        typical expressions
                    </li>
                    <li>
                        <strong>Include behavioral guidelines</strong> - How should the agent respond to different situations?
                    </li>
                    <li>
                        <strong>Set boundaries</strong> - Clarify what topics or actions are off-limits for your agent
                    </li>
                </ul>

                <h3>Setting Clear Goals</h3>
                <ul>
                    <li>
                        <strong>Be outcome-focused</strong> - What should your agent accomplish?
                    </li>
                    <li>
                        <strong>Prioritize objectives</strong> - If your agent has multiple goals, rank them by importance
                    </li>
                    <li>
                        <strong>Define success metrics</strong> - How will you measure if your agent is achieving its goals?
                    </li>
                    <li>
                        <strong>Consider constraints</strong> - Are there limitations your agent should work within?
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 dark:bg-amber-950/30 dark:border-amber-500/50">
                    <h3 className="text-amber-800 dark:text-amber-400 font-medium">Prompt Strength Indicator</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                        Pay attention to the &quot;Prompt strength&quot; indicator below each text field. A &quot;weak&quot; rating suggests your
                        description needs more detail. Aim for &quot;good&quot; or &quot;excellent&quot; ratings for optimal agent performance.
                    </p>
                </div>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/getting-started/dashboard">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Agent Dashboard
                        </div>
                    </div>
                </Link>
                <Link href="/docs/getting-started/twitter-configuration">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Twitter Configuration
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

