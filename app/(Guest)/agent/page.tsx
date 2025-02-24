"use client";

import YourAgentsSection from "@/components/Guest/Common/YourAgentsSection";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AgentPage() {
  return (
    <div>
      {/* <div className="container">
        <div className="bg-background relative overflow-hidden">
          <div className="bg-grid-slate-200/20 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
          <section className="relative container mx-auto px-4 py-12 sm:px-6 md:py-24 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                  Your AI
                  <span className="from-primary to-primary/50 bg-gradient-to-r bg-clip-text text-transparent"> Agents</span>
                </h1>

                <div className="bg-muted inline-flex items-center gap-2 rounded-full px-4 py-1">
                  <Sparkles className="text-primary h-4 w-4" />
                  <span className="text-sm font-medium">Everything you need to know about our AI agents</span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </div> */}

      <YourAgentsSection />

      <div className="text-white">
        {/* Call-to-Action Section */}
        <section className="bg-gray-900 py-20 text-center">
          <h2 className="text-3xl font-bold">No Agents Yet</h2>
          <p className="mt-4 text-lg text-gray-400">Connect your wallet to create AI agents and start automating today.</p>
          <button className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-md transition hover:bg-gray-300">Connect</button>
        </section>

        {/* Features Section */}
        <section className="bg-black px-8 py-16">
          <h2 className="mb-10 text-center text-3xl font-bold">Why Use Our AI Agent?</h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Automated Posting</h3>
              <p className="mt-2 text-gray-400">Schedule and post AI-generated tweets effortlessly.</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Custom AI Agents</h3>
              <p className="mt-2 text-gray-400">Personalize AI agents to match your style and tone.</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Solana Integration</h3>
              <p className="mt-2 text-gray-400">Securely log in using Phantom Wallet for a seamless experience.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
