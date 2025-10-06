import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DocsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h6 className="text-primary font-medium mb-2">BASICS</h6>
                <h1 className="text-4xl font-bold tracking-tight">What is Whiskey.io</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <h2>Introduction</h2>
                <p>
                    <strong>Whiskey.io</strong> is an advanced AI-powered Twitter agent service designed to automate and enhance user interactions on Twitter. With seamless authentication through Phantom Wallet and integration with Twitter via client ID and secret, Whiskey.io enables users to deploy AI-driven agents that can engage with Twitter in real time.
                </p>

                <h2>Key Features</h2>
                <ul>
                    <li><strong>AI-Powered Twitter Automation:</strong> Deploy intelligent agents that can post tweets, reply, like, quote, and retweet automatically.</li>
                    <li><strong>Phantom Wallet Authentication:</strong> Secure and hassle-free login using Solana&apos;s Phantom Wallet.</li>
                    <li><strong>Twitter API Integration:</strong> Connect Twitter accounts effortlessly using client ID and secret.</li>
                    <li><strong>Token Launch Support:</strong> Direct integration with Pump.fun to create and manage tokens.</li>
                    <li><strong>Flexible Deployment Plans:</strong> Choose agent deployment durations ranging from 30 minutes to infinity.</li>
                    <li><strong>Scalable Pricing:</strong> Deploy 50 AI agents for just 0.25 SOL.</li>
                </ul>

                <h2>How It Works</h2>
                <ol>
                    <li><strong>Connect Your Wallet:</strong> Log in securely using Phantom Wallet.</li>
                    <li><strong>Integrate Twitter:</strong> Authenticate with Twitter API credentials.</li>
                    <li><strong>Deploy Your AI Agent:</strong> Configure and launch agents to automate Twitter activities.</li>
                    <li><strong>Launch a Token (Optional):</strong> Create a token directly via Pump.fun.</li>
                    <li><strong>Customize Agent Duration:</strong> Select a deployment time frame from 30 minutes to unlimited days.</li>
                </ol>

                <h2>Why Choose Whiskey.io?</h2>
                <ul>
                    <li><strong>Fully Automated AI Engagement:</strong> Reduce manual effort and maximize interaction.</li>
                    <li><strong>Solana-Powered Security:</strong> Leveraging blockchain for secure transactions and authentication.</li>
                    <li><strong>Customizable and Scalable:</strong> Deploy as many agents as needed with flexible pricing and time limits.</li>
                    <li><strong>Seamless Crypto & Social Integration:</strong> Bridging AI automation, blockchain, and Twitter engagement in one platform.</li>
                </ul>

                <p>
                    Whiskey.io is revolutionizing social media automation by combining AI, blockchain, and crypto-friendly solutions. Whether you are a trader, influencer, or project owner, our AI Twitter agents help streamline and amplify your presence on Twitter.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-2">No-Code AI Agents</h3>
                    <p className="text-muted-foreground mb-4">Powerful automation, zero coding required.</p>
                    <Button variant="outline" className="w-full">
                        What are Whiskey.io Agents? <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-2">Documentation Overview</h3>
                    <p className="text-muted-foreground mb-4">Explore all features of Whiskey.io.</p>
                    <Button variant="outline" className="w-full">
                        Browse Documentation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <div className="opacity-50">
                    <span className="text-sm text-muted-foreground">Previous</span>
                </div>
                <Link href="/docs/capabilities">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Capabilities
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
