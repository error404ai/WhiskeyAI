import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CapabilitiesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h6 className="text-primary font-medium mb-2">BASICS</h6>
                <h1 className="text-4xl font-bold tracking-tight">Platform Capabilities</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">
                    Whiskey.io empowers users with a robust suite of capabilities, designed to streamline the creation and deployment of AI agents—no coding required. Harness the power of intelligent automation and unlock new levels of productivity and engagement across platforms.
                </p>

                <h2>Platform Features</h2>

                <h3>Twitter Integration</h3>
                <p>
                    Seamlessly connect your agents to Twitter, enabling automated interactions with followers, hashtag monitoring, sentiment analysis, and scheduled posting. Perfect for enhancing social media presence and engagement.
                </p>

                <h3>Custom Triggers</h3>
                <p>
                    Create highly flexible triggers based on time, events, or specific data conditions, allowing your agents to act at the right moment—whether responding to real-time events or executing pre-scheduled tasks.
                </p>

                <h3>Comprehensive Function Library</h3>
                <p>
                    Whiskey.io offers an expanding library of pre-built functions. In addition, you can design custom functions tailored to your specific needs, extending your agents’ capabilities for complex automation workflows.
                </p>

                <h3>Multi-Agent Collaboration</h3>
                <p>
                    Orchestrate complex workflows by having multiple agents collaborate seamlessly. Agents can share information, coordinate actions, and collectively work toward achieving sophisticated, multi-step goals.
                </p>

                <h3>Advanced Data Analysis</h3>
                <p>
                    Leverage advanced data processing tools to analyze and extract valuable insights from diverse data sources, including social media and market data. Whiskey.io empowers your agents to provide actionable intelligence in real time.
                </p>

                <h2>AI Agent Types</h2>
                <p>
                    Whiskey.io’s versatile agents can be deployed for a variety of tasks, catering to different needs. Here are some of the core agent types you can create:
                </p>
                <ul>
                    <li>
                        <strong>Social Media Managers:</strong> Automate content posting, audience engagement, and growth strategies across Twitter.
                    </li>
                    <li>
                        <strong>Market Monitors:</strong> Track market trends, prices, and sentiment to stay ahead of the curve.
                    </li>
                    <li>
                        <strong>Content Creators:</strong> Automatically generate tweets, blog posts, articles, and other content tailored to your audience.
                    </li>
                    <li>
                        <strong>Community Managers:</strong> Moderate discussions and foster engagement across platforms like Discord, Telegram, and Twitter.
                    </li>
                    <li>
                        <strong>Trading Assistants:</strong> Identify market opportunities and execute trades based on your personalized strategies.
                    </li>
                </ul>

                <h2>Technical Specifications</h2>
                <p>
                    Whiskey.io is built on a robust, scalable infrastructure that supports the high demands of intelligent automation. Key technical features include:
                </p>
                <ul>
                    <li>Cloud-based infrastructure with an industry-leading 99.9% uptime guarantee</li>
                    <li>Enterprise-grade security, ensuring the protection of your data and assets</li>
                    <li>Comprehensive API access for advanced custom integrations and workflows</li>
                    <li>Scalable architecture capable of supporting thousands of concurrent AI agents</li>
                    <li>Real-time monitoring and analytics to track agent performance and results</li>
                </ul>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            What is Whiskey.io
                        </div>
                    </div>
                </Link>
                <Link href="/docs/roadmap">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Product Roadmap
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
