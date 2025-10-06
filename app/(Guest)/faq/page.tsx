"use client";

import FaqSection from "../../../components/Guest/Common/FaqSection";

export default function Home() {
  return (
    <div className="container">
      <FaqSection />

      {/* Contact Section */}
      <section className="bg-gray-900 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">Still Have Questions?</h2>
        <p className="mt-4 text-lg text-gray-400">Reach out to us for more information or support.</p>
        {/* <button className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-md transition hover:bg-gray-300">Contact Us</button> */}
        <a
  href="https://x.com/thewhiskeyai"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-md transition hover:bg-gray-300"
>
  Contact Us
</a>

      </section>
    </div>
  );
}
