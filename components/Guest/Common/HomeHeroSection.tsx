"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from 'lucide-react';
import ConnectButton from "../Header/_partials/ConnectButton";

export default function HomeHeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid-slate-200/20 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
      <section className="relative container mx-auto px-4 py-12 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="bg-muted/10 inline-flex items-center gap-2 rounded-full px-4 py-1">
              <Sparkles className="text-white h-4 w-4" />
              <span className="text-sm font-medium">Intelligent Automation</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              AI Agents
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(to right, #00ffe0, #00ffe055)"
                }}
              >
                &nbsp;that work for you
              </span>
            </h1>

            <p className="text-muted-foreground text-xl">Deploy autonomous AI agents that handle your tasks with human-like intelligence. Transform your workflow with next-generation AI automation.</p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <ConnectButton
                size="lg"
                className="group bg-gradient-to-r from-[#00ffe0] to-[#00ffe055] text-black hover:brightness-110 transition-all"
              >
                Get Started
                <Bot className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </ConnectButton>
            </div>
          </motion.div>

          {/* Video Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,224,0.2)]"
          >
            <div className="aspect-video">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="object-cover w-full h-full"
              >
                <source src="/images/Gen_4_Turbo.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Optional: Add a subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />

            {/* Optional: Add a glowing border */}
            <div className="absolute inset-0 border border-[#00ffe0]/30 rounded-lg pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}