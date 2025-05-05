"use client";

import { Brain, Cpu, Shield, Zap, MessageSquareCode, BarChart3 } from 'lucide-react';
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
    <section className="bg-muted/5 w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-[#00ffe020] via-transparent to-transparent opacity-30" />

      <div className="container px-4 md:px-6 relative">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(to right, #00ffe0, #00ffe055)"
                }}
              >
                &nbsp;Our AI Agents?
              </span>
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Empower your business with cutting-edge AI technology that delivers real results
            </p>
          </div>
        </MotionDiv>

        <div className="mt-16 grid lg:grid-cols-3 gap-8 items-start">
          {/* Left column features */}
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {features.slice(0, 3).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionDiv
                  key={index}
                  variants={itemVariants}
                  className="feature-card group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,224,0.3)]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 25px rgba(0, 255, 224, 0.4)"
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe0]/0 via-[#00ffe0]/0 to-[#00ffe0]/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-lg border border-[#00ffe0]/0 group-hover:border-[#00ffe0]/30 transition-colors duration-500"></div>

                  <div className="relative z-10">
                    <div className="mb-4">
                      <Icon className="h-8 w-8 text-[#00ffe0]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </MotionDiv>
              );
            })}
          </MotionDiv>

          {/* Center column - 3D Model */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full h-[500px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,224,0.3)] border border-[#00ffe0]/20"
          >
            <div className="relative w-full h-full">
              <iframe
                title="A sleek humanoid AI"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"

                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
                xr-spatial-tracking
                execution-while-out-of-viewport
                execution-while-not-rendered
                web-share="true"
                src="https://sketchfab.com/models/43997df9b47c46e6919a1da7f900bc26/embed?autostart=1&ui_infos=0&ui_controls=0&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&ui_annotations=0&ui_loading=0&transparent=1&scrolling=0"
              />
            </div>

            {/* Optional: Custom label */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <span className="text-[#00ffe0]">Next-Gen</span> AI Assistant
              </div>
            </div>
          </MotionDiv>

          {/* Right column features */}
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {features.slice(3, 6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionDiv
                  key={index}
                  variants={itemVariants}
                  className="feature-card group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,224,0.3)]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 25px rgba(0, 255, 224, 0.4)"
                  }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe0]/0 via-[#00ffe0]/0 to-[#00ffe0]/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                  {/* Border glow */}
                  <div className="absolute inset-0 rounded-lg border border-[#00ffe0]/0 group-hover:border-[#00ffe0]/30 transition-colors duration-500"></div>

                  <div className="relative z-10">
                    <div className="mb-4">
                      <Icon className="h-8 w-8 text-[#00ffe0]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </MotionDiv>
              );
            })}
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}