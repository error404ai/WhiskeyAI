import YourAgentsSection from "./_partials/YourAgentsSection";

const AgentPage = () => {
  return (
    <div>
      <YourAgentsSection />
      <div className="text-white">
        {/* Call-to-Action Section */}
        <section className="bg-gray-900 py-20 text-center">
          <h2 className="text-3xl font-bold">No Agents Yet</h2>
          <p className="mt-4 text-lg text-gray-400">Connect your wallet to create AI agents and start automating today.</p>
          <button className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-md transition hover:bg-gray-300">Connect</button>
        </section>

        {/* Features Section */}
        <section className="bg-black px-8 py-16">
          <h2 className="mb-10 text-center text-3xl font-bold">Why Use Our AI Agent?</h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Automated Posting</h3>
              <p className="mt-2 text-gray-400">Schedule and post AI-generated tweets effortlessly.</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Custom AI Agents</h3>
              <p className="mt-2 text-gray-400">Personalize AI agents to match your style and tone.</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-gray-800 p-6 text-center shadow-lg">
              <h3 className="text-xl font-semibold text-white">Solana Integration</h3>
              <p className="mt-2 text-gray-400">Securely log in using Phantom Wallet for a seamless experience.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgentPage;
