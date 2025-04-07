import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ExternalLink, Github, Twitter, Globe, MessageCircle, BookOpen } from "lucide-react"

export default function LinksPage() {
    return (
        <div className="space-y-8">
            <div>
                <h6 className="text-primary font-medium mb-2">BASICS</h6>
                <h1 className="text-4xl font-bold tracking-tight">Official Links</h1>
            </div>

            <div className="prose prose-slate max-w-none">
                <p className="lead">Connect with Whiskey.io through our official channels and resources.</p>

                <h2>Main Resources</h2>

                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <a href="https://thewhiskey.io/" target="_blank" rel="noopener noreferrer" className="no-underline">
                        <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Website</h3>
                                <p className="text-sm text-muted-foreground">thewhiskey.io</p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>

                    <a href="https://thewhiskey.io/docs" target="_blank" rel="noopener noreferrer" className="no-underline">
                        <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Documentation</h3>
                                <p className="text-sm text-muted-foreground">docs.whiskey.io</p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>

                    <a href="https://github.com/error404ai/WhiskeyAI" target="_blank" rel="noopener noreferrer" className="no-underline">
                        <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Github className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">GitHub</h3>
                                <p className="text-sm text-muted-foreground">error404ai/WhiskeyAI</p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>

                    <a href="https://twitter.com/whiskey_io" target="_blank" rel="noopener noreferrer" className="no-underline">
                        <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Twitter className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Twitter</h3>
                                <p className="text-sm text-muted-foreground">twitter.com/whiskey_io</p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>

                    <a href="https://discord.gg/whiskey" target="_blank" rel="noopener noreferrer" className="no-underline">
                        <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Discord Community</h3>
                                <p className="text-sm text-muted-foreground">discord.gg/whiskey</p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>
                </div>

                <h2>Support Channels</h2>
                <p>If you need help with Whiskey.io, you can reach out through the following channels:</p>
                <ul>
                    <li>Email: support@thewhiskey.io</li>
                    <li>Discord: #support channel</li>
                    <li>Twitter: DM @whiskey_io</li>
                </ul>

                {/* <h2>Legal Resources</h2>
                <ul>
                    <li>
                        <a href="https://whiskey.io/terms" target="_blank" rel="noopener noreferrer">
                            Terms of Service
                        </a>
                    </li>
                    <li>
                        <a href="https://whiskey.io/privacy" target="_blank" rel="noopener noreferrer">
                            Privacy Policy
                        </a>
                    </li>
                    <li>
                        <a href="https://whiskey.io/security" target="_blank" rel="noopener noreferrer">
                            Security
                        </a>
                    </li>
                </ul> */}
            </div>

            {/* Previous/Next Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-4">
                <Link href="/docs/roadmap">
                    <div className="flex flex-col items-start">
                        <span className="text-sm text-muted-foreground">Previous</span>
                        <div className="flex items-center font-medium">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Product Roadmap
                        </div>
                    </div>
                </Link>
                {/* <Link href="/docs/tokenomics">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Tokenomics
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link> */}
                <Link href="/docs/getting-started">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Next</span>
                        <div className="flex items-center font-medium">
                            Getting Started
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

