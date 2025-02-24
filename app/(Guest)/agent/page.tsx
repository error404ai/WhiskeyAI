export default function AgentPage() {
    return (
      <div className="min-h-screen bg-black text-white">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 bg-gray-900">
          <h1 className="text-5xl font-bold">Your AI Agent</h1>
          <p className="mt-4 text-lg max-w-2xl text-gray-400">
            Automate your Twitter posts with precision and creativity.
          </p>
        </section>
  
        {/* Features Section */}
        <section className="py-16 px-8 bg-black">
          <h2 className="text-3xl font-bold text-center mb-10">Why Use Our AI Agent?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="p-6 shadow-lg rounded-lg bg-gray-800 text-center">
              <h3 className="text-xl font-semibold text-white">Automated Posting</h3>
              <p className="mt-2 text-gray-400">
                Schedule and post AI-generated tweets effortlessly.
              </p>
            </div>
  
            {/* Feature 2 */}
            <div className="p-6 shadow-lg rounded-lg bg-gray-800 text-center">
              <h3 className="text-xl font-semibold text-white">Custom AI Agents</h3>
              <p className="mt-2 text-gray-400">
                Personalize AI agents to match your style and tone.
              </p>
            </div>
  
            {/* Feature 3 */}
            <div className="p-6 shadow-lg rounded-lg bg-gray-800 text-center">
              <h3 className="text-xl font-semibold text-white">Solana Integration</h3>
              <p className="mt-2 text-gray-400">
                Securely log in using Phantom Wallet for a seamless experience.
              </p>
            </div>
          </div>
        </section>
  
        {/* Call-to-Action Section */}
        <section className="py-20 bg-gray-900 text-center">
          <h2 className="text-3xl font-bold">Get Started Now</h2>
          <p className="mt-4 text-lg text-gray-400">Create your AI agent and start automating today.</p>
          <button className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 transition">
            Create Agent
          </button>
        </section>
      </div>
    );
  }
  