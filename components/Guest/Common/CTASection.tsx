"use client"

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

export default function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
      <div className="container px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Transform Your Business?</h2>
            <p className="max-w-[600px] md:text-xl/relaxed">Start automating your workflows with AI agents today</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
            >
              Schedule Demo
            </Button> */}
          </div>
        </MotionDiv>
      </div>
    </section>
  )
}

