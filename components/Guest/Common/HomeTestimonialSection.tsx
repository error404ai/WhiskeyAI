"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import dynamic from "next/dynamic"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "CTO, TechCorp",
    content:
      "The AI agents have transformed our customer service. We've seen a 70% reduction in response time and significantly improved customer satisfaction.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Michael Chen",
    role: "Founder, InnovateLabs",
    content:
      "Implementation was seamless, and the results were immediate. Our team now focuses on strategic tasks while the AI handles the routine work.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emma Rodriguez",
    role: "Operations Director, GlobalTech",
    content:
      "The natural language processing capabilities are impressive. Our agents understand context and nuance better than any other AI solution we've tried.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function HomeTestimonialSection() {
  return (
    <section className="bg-muted/10 w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(to right, #00ffe0, #00ffe055)"
                }}
              >
                &nbsp;Industry Leaders
              </span>
            </h2>
            <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what our customers are saying about their experience
            </p>
          </div>
        </MotionDiv>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <MotionDiv
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 25px rgba(0, 255, 224, 0.4)",
              }}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,224,0.3)]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe0]/0 via-[#00ffe0]/0 to-[#00ffe0]/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

              {/* Border glow */}
              <div className="absolute inset-0 rounded-lg border border-[#00ffe0]/0 group-hover:border-[#00ffe0]/30 transition-colors duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 border border-[#00ffe0]/20">
                    <AvatarImage alt={testimonial.name} src={testimonial.avatar || "/placeholder.svg"} />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-gray-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-gray-300 mt-4">&quot;{testimonial.content}&quot;</blockquote>
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>
    </section>
  )
}
