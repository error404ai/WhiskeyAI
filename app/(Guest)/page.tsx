"use client";
import { Navbar } from "@/components/Guest/Common/navbar";
import CTASection from "../../components/Guest/Common/CTASection";
import FaqSection from "../../components/Guest/Common/FaqSection";
import HomeFeatureSection from "../../components/Guest/Common/HomeFeatureSection";
import HomeHeroSection from "../../components/Guest/Common/HomeHeroSection";
import HomePricingSection from "../../components/Guest/Common/HomePricingSection";
import HomeTestimonialSection from "../../components/Guest/Common/HomeTestimonialSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container">
        <HomeHeroSection />
        <HomeFeatureSection />
        <HomeTestimonialSection />
        <HomePricingSection />
        <FaqSection />
        <CTASection />
      </div>
    </>

  );
}
