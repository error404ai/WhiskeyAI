"use client"
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import FaqSection from "../../../components/Guest/Common/FaqSection";


export default async function Home() {
  return <div className="container">
    <FaqSection />

    {/* Contact Section */}
    <section className="py-20 bg-gray-900 text-center">
      <h2 className="text-3xl font-bold text-white">Still Have Questions?</h2>
      <p className="mt-4 text-lg text-gray-400">
        Reach out to us for more information or support.
      </p>
      <button className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 transition">
        Contact Us
      </button>
    </section>
  </div>;
}
