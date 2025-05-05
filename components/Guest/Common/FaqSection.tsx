"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import dynamic from "next/dynamic"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false })

const faqs = [
  {
    question: "How do AI agents learn and improve over time?",
    answer:
      "Our AI agents use advanced machine learning algorithms to continuously learn from interactions. They analyze patterns, user feedback, and outcomes to optimize their performance and decision-making capabilities.",
  },
  {
    question: "What kind of tasks can AI agents handle?",
    answer:
      "AI agents can handle a wide range of tasks including customer service, data analysis, scheduling, document processing, and workflow automation. They're particularly effective at repetitive tasks that require consistent attention to detail.",
  },
  {
    question: "How secure is the AI agent platform?",
    answer:
      "We implement bank-grade security measures including end-to-end encryption, regular security audits, and compliance with industry standards. Your data is protected with enterprise-level security protocols.",
  },
  {
    question: "Can I customize the AI agents for my specific needs?",
    answer:
      "Yes, our AI agents are highly customizable. You can train them on your specific processes, integrate them with your existing tools, and configure them to match your business requirements.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide comprehensive support including 24/7 technical assistance, detailed documentation, training resources, and dedicated account managers for enterprise clients.",
  },
]

export default function FaqSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently  <span
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #00ffe0, #00ffe055)"
              }}
            >
              &nbsp;Asked Questions
            </span></h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about our AI agents
            </p>
          </div>
        </MotionDiv>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-[800px] mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </MotionDiv>
      </div>
    </section>
  )
}

