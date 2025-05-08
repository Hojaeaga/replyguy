import Image from "next/image";

export default function AdOpportunitySection() {
  return (
    <section className="min-h-screen bg-[#f0f8ff] px-6 py-16 flex flex-col items-center justify-center text-center">
      <h2 className="text-[24px] font-bold text-gray-900 mb-4">
        🔍 Reach your audience like never before
      </h2>
      <p className="text-gray-700 max-w-2xl text-[15px] mb-8">
        Leverage casts, interests, and interactions to run hyper-personalized
        marketing campaigns directly on Farcaster. It&pos;s ad targeting, but
        smarter.
      </p>
      <Image
        src="/marketing.svg"
        alt="Marketing Illustration"
        width={400}
        height={300}
        className="rounded-md mb-8"
      />
      <div className="space-y-3">
        <p className="text-gray-600 text-sm max-w-md mx-auto font-semibold">
          🎯 Cast-based audience profiling
        </p>
        <p className="text-gray-600 text-sm max-w-md mx-auto font-semibold">
          📈 Real-time engagement insights
        </p>
        <p className="text-gray-600 text-sm max-w-md mx-auto font-semibold">
          🤝 Ethically personalized messaging
        </p>
      </div>
      <button className="mt-8 px-6 py-3 text-[14px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition">
        Get in touch with us
      </button>
    </section>
  );
}
