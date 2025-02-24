"use client"

import { Check } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small teams and startups",
    features: ["2 AI Agents", "1,000 tasks per month", "Basic analytics", "Email support", "API access"],
  },
  {
    name: "Pro",
    price: "$99",
    description: "Best for growing businesses",
    features: [
      "10 AI Agents",
      "10,000 tasks per month",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "Team collaboration",
      "Workflow automation",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited AI Agents",
      "Unlimited tasks",
      "Custom analytics",
      "24/7 dedicated support",
      "Custom development",
      "SLA guarantee",
      "Advanced security",
      "Custom training",
    ],
  },
]

export default function HomePricingSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 border-t">
      <div className="container px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, transparent pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the perfect plan for your business needs
            </p>
          </div>
        </MotionDiv>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-3 gap-8 mt-12"
        >
          {plans.map((plan, index) => (
            <MotionDiv
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-6 bg-background rounded-lg shadow-lg border ${
                plan.popular ? "border-primary" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-4xl font-bold">{plan.price}</div>
                <p className="text-muted-foreground text-sm">per month</p>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant={plan.popular ? "default" : "outline"} className="mt-8 w-full">
                Get Started
              </Button>
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>
    </section>
  )
}

