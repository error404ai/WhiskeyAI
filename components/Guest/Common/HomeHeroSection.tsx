"use client"

import { Bot, Sparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; 

export default function HomeHeroSection() {
  



  // Render animated version after client-side hydration
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
      <section className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid lg:grid-cols-1 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Intelligent Automation</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              AI Agents that work
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                {" "}
                for you
              </span>
            </h1>

            <p className="text-xl text-muted-foreground">
              Deploy autonomous AI agents that handle your tasks with human-like intelligence. Transform your workflow
              with next-generation AI automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
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
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted" />
                ))}
              </div>
              <p className="text-muted-foreground">Join 1000+ companies already using our AI agents</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

