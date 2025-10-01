"use client";

import { Brain, Cpu, Shield, Zap, MessageSquareCode, BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

const features = [
  {
    icon: Brain,
    title: "Advanced AI Learning",
    description: "Self-improving agents that learn from every interaction, getting smarter and more efficient over time.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security protocols to keep your data and operations completely safe.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Processes and completes tasks in seconds, not hours. 100x faster than traditional methods.",
  },
  {
    icon: Cpu,
    title: "Seamless Integration",
    description: "Easily connects with your existing tools and workflows. No complex setup required.",
  },
  {
    icon: MessageSquareCode,
    title: "Natural Language",
    description: "Communicate with your agents in plain English. No technical expertise needed.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Detailed insights and performance metrics to optimize your automation workflow.",
  },
];

export default function HomeFeatureSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section className="bg-muted/50 w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Our AI  <span className="from-primary to-primary/50 bg-gradient-to-r bg-clip-text text-transparent"> Agents?</span></h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">Empower your business with cutting-edge AI technology that delivers real results</p>
          </div>
        </MotionDiv>
        <MotionDiv variants={containerVariants} initial="hidden" animate="visible" className="mx-auto mt-12 grid gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <MotionDiv key={index} variants={itemVariants} className="group bg-background relative overflow-hidden rounded-lg border p-6 transition-shadow hover:shadow-lg">
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <div className="bg-primary/10 absolute inset-0 scale-[2] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <Icon className="text-primary/80 relative z-10 h-12 w-12 transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </MotionDiv>
            );
          })}
        </MotionDiv>
      </div>
    </section>
  );
}
