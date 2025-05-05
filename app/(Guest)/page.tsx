"use client"

import CTASection from "../../components/Guest/Common/CTASection";
import FaqSection from "../../components/Guest/Common/FaqSection";
import HomeFeatureSection from "../../components/Guest/Common/HomeFeatureSection";
import HomeHeroSection from "../../components/Guest/Common/HomeHeroSection";
import HomeTestimonialSection from "../../components/Guest/Common/HomeTestimonialSection";
import dynamic from "next/dynamic";

// Dynamically import both effects
const MovingSky = dynamic(() => import("../../components/MovingSky"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />,
});

const MouseFlowEffect = dynamic(() => import("../../components/MouseFlowEffect"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* Background layers */}
      <MovingSky />
      <MouseFlowEffect />
      
      <div className="container relative z-10">
        <HomeHeroSection />
        <HomeFeatureSection />
        <HomeTestimonialSection />
        <FaqSection />
        <CTASection />
      </div>
    </>
  );
}