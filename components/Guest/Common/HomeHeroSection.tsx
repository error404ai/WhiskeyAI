"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

export default function HomeHeroSection() {
  // Render animated version after client-side hydration
  return (
    <div className="bg-background relative overflow-hidden">
      <div className="bg-grid-slate-200/20 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
      <section className="relative container mx-auto px-4 py-12 sm:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <div className="bg-muted inline-flex items-center gap-2 rounded-full px-4 py-1">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="text-sm font-medium">Intelligent Automation</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              AI Agents that work
              <span className="from-primary to-primary/50 bg-gradient-to-r bg-clip-text text-transparent"> for you</span>
            </h1>

            <p className="text-muted-foreground text-xl">Deploy autonomous AI agents that handle your tasks with human-like intelligence. Transform your workflow with next-generation AI automation.</p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="group">
                Get Started
                <Bot className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-background bg-muted h-8 w-8 rounded-full border-2" />
                ))}
              </div>
              <p className="text-muted-foreground">Join 1000+ companies already using our AI agents</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
