import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RoadmapPage() {
    return (
        <div className="space-y-8">
            <div>
                <h6 className="text-primary font-medium mb-2">BASICS</h6>
                <h1 className="text-5xl font-extrabold tracking-tight mb-4">Product Roadmap</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead text-xl font-semibold mb-6">
                    Our vision for Whiskey.io extends far beyond its current capabilities. Here&apos;s a glimpse into our future plans.
                </p>

                <h2 className="text-3xl font-bold text-primary mt-8">March 2025 - Current Phase</h2>
                <h6 className="font-bold text-primary mt-8">Agent Development and Updates</h6>
                <ul className="list-disc pl-8 mt-4">
                    <li>✅ Added various features to agents, including updated trigger descriptions, new methods, and Coinmarket functions.</li>
                    <li>✅ Improved the Coinmarket functions, integrating more advanced features for enhanced automation and data handling.</li>
                    <li>✅ Basic agent configuration</li>
                </ul>

                <h6 className="font-bold text-primary mt-8">Integration and API Improvements</h6>
                <ul className="list-disc pl-8 mt-4">
                    <li>✅ Integrated APIs like Dexscreener and Coinmarket to expand data sources and enhance functionality.</li>
                    <li>✅ Updated token profile retrieval methods for better data accuracy.</li>
                </ul>

                <h6 className="font-bold text-primary mt-8">UI and Deployment Enhancements</h6>
                <ul className="list-disc pl-8 mt-4">
                    <li>✅ Introduced new UI/UX improvements to enhance user experience.</li>
                    <li>✅ Updates to the deployment systems for better management of agents.</li>
                    <li>✅ Addressed container management and Docker production optimizations.</li>
                </ul>

                <h6 className="font-bold text-primary mt-8">Security & Performance Optimization</h6>
                <ul className="list-disc pl-8 mt-4">
                    <li>✅ Improved security, particularly related to access keys and the payment system (Solana payment issue resolution).</li>
                    <li>✅ Optimized functions related to RPC calls and increased system stability, ensuring better scaling for high usage.</li>
                </ul>

                <hr />


                <h2 className="text-3xl font-bold text-primary mt-8">Upcoming Tasks (Q2 2025)</h2>
                <h6 className="font-bold text-primary mt-8">Expanded Social Media Integration</h6>

                <ul className="list-disc pl-8 mt-4">
                    <li>🔄 Extend capabilities for Twitter integration to support more platforms like Instagram and Facebook.</li>
                    <li>🔄 Enhance multi-agent functionality to support collaborative systems where multiple agents coordinate actions.</li>
                    <li>🔄 Custom AI model integration</li>
                </ul>

                <h6 className="font-bold text-primary mt-8">Advanced Data and Analytics</h6>
                <ul className="list-disc pl-8 mt-4">
                    <li>📅 Implement more advanced data analytics tools for market insights and sentiment analysis, especially for trading assistants.</li>
                    <li>📅 Enhance the ability of agents to process and extract insights from diverse data sources.</li>
                    <li>📅 Advanced security features</li>
                </ul>

                <h2 className="font-bold text-primary mt-8">Function and Trigger Automation</h2>
                <ul className="list-disc pl-8 mt-4">
                    <li>🔄 Expand the trigger library with more sophisticated conditions based on user data, events, or time.</li>
                    <li>🔄 Introduce new agent functionalities for fully automated trading, social media interaction, and content creation.</li>
                </ul>
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/capabilities">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Capabilities
                        </div>
                    </div>
                </Link>
                <Link href="/docs/links">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Official Links
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
