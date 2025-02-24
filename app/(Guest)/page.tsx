"use client"
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import HomeHeroSection from "../../components/Guest/Common/HomeHeroSection";
import HomeFeatureSection from "../../components/Guest/Common/HomeFeatureSection";
import HomeTestimonialSection from "../../components/Guest/Common/HomeTestimonialSection";
import HomePricingSection from "../../components/Guest/Common/HomePricingSection";
import FaqSection from "../../components/Guest/Common/FaqSection";
import CTASection from "../../components/Guest/Common/CTASection";


export default async function Home() {
  return <div className="container">
   <HomeHeroSection />
   <HomeFeatureSection />
   <HomeTestimonialSection />
   <HomePricingSection />
   <FaqSection />
   <CTASection />
  </div>;
}
