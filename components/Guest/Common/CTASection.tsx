"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import ConnectButton from "../Header/_partials/ConnectButton";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

export default function CTASection() {
  return (
    <section className="bg-primary w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-primary-foreground flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Transform Your Business?</h2>
            <p className="max-w-[600px] md:text-xl/relaxed">Start automating your workflows with AI agents today</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <ConnectButton size="lg" variant="secondary">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </ConnectButton>
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
  );
}
