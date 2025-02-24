"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "CTO, TechCorp",
    content: "The AI agents have transformed our customer service. We've seen a 70% reduction in response time and significantly improved customer satisfaction.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Michael Chen",
    role: "Founder, InnovateLabs",
    content: "Implementation was seamless, and the results were immediate. Our team now focuses on strategic tasks while the AI handles the routine work.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emma Rodriguez",
    role: "Operations Director, GlobalTech",
    content: "The natural language processing capabilities are impressive. Our agents understand context and nuance better than any other AI solution we've tried.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function HomeTestimonialSection() {
  return (
    <section className="bg-muted/50 w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Industry Leaders</h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">See what our customers are saying about their experience</p>
          </div>
        </MotionDiv>
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <MotionDiv key={testimonial.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Card className="flex h-full flex-col p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage alt={testimonial.name} src={testimonial.avatar} />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-muted-foreground mt-4">&quot;{testimonial.content}&quot;</blockquote>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
}
