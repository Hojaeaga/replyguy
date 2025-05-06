"use client";
import {
  Bot,
  UserCheck,
  Compass,
  MessageSquare,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import { useState, useEffect, ReactNode, useRef } from "react";
import { useFrame } from "./providers/FrameProvider";

type FloatingElementProps = {
  size: string;
  color: string;
  top: number;
  left: number;
  delay: number;
};

const FloatingElement = ({
  size,
  color,
  top,
  left,
  delay,
}: FloatingElementProps) => {
  const [position, setPosition] = useState({ x: left, y: top });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        x: prev.x + (Math.random() - 0.5) * 10,
        y: prev.y + (Math.random() - 0.5) * 10,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute rounded-full bg-${color} opacity-30 blur-xl`}
      style={{
        width: size,
        height: size,
        top: `${position.y}%`,
        left: `${position.x}%`,
        transition: `all 3s ease-in-out ${delay}s`,
        zIndex: 0,
      }}
    />
  );
};

// Background Elements
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <FloatingElement
        size="200px"
        color="purple-400"
        top={15}
        left={10}
        delay={0}
      />
      <FloatingElement
        size="300px"
        color="blue-300"
        top={60}
        left={80}
        delay={0.5}
      />
      <FloatingElement
        size="150px"
        color="indigo-500"
        top={80}
        left={20}
        delay={1}
      />
      <FloatingElement
        size="250px"
        color="violet-300"
        top={30}
        left={70}
        delay={1.5}
      />
      <FloatingElement
        size="180px"
        color="fuchsia-400"
        top={50}
        left={40}
        delay={2}
      />

      {/* Futuristic grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

type FloatingCardProps = {
  children: ReactNode;
};

const FloatingCard = ({ children }: FloatingCardProps) => (
  <div className="transform transition-all duration-500 hover:translate-y-2 hover:shadow-lg">
    {children}
  </div>
);

export default function Home() {
  const { context } = useFrame();
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const scrollToSection = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const buttonClicked = async () => {
    if (!context || !context.user.displayName) {
      console.log("User not logged in");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fid: context.user.fid,
          }),
        },
      );
      if (!response.ok) {
        console.error("Registration failed with status:", response.status);
        return;
      }
      const result = await response.json();
      console.log("Registration successful:", result);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#f6f7f9] to-[#e6e8ec] text-gray-900 font-sans relative overflow-hidden">
      <BackgroundElements />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

        <p className="text-base md:text-lg font-medium text-gray-600 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" /> Hey there,{" "}
          {context?.user?.displayName as string}!
        </p>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mb-4">
          <span className="inline-block bg-purple-600 italic px-4 py-2 text-white drop-shadow-[3px_3px_0_rgba(0,0,0,0.4)] rounded-lg transform hover:scale-105 transition-transform duration-300">
            Personalize
          </span>
          <span className="text-gray-900 block mt-2">Your Experience.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-700 max-w-xl leading-relaxed text-center">
          Discover <span className="text-purple-600 font-semibold">ideas</span>,{" "}
          <span className="text-purple-600 font-semibold">people</span>,{" "}
          <span className="text-purple-600 font-semibold">connections</span>,
          and more on{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 font-bold">
            Farcaster
          </span>
          .
        </p>

        <button
          type="button"
          className="z-10 mt-8 px-8 py-4 text-base font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 rounded-full flex items-center gap-2 transition-all duration-300"
          onClick={buttonClicked}
        >
          Sign up
        </button>

        <button
          onClick={scrollToSection}
          className="absolute bottom-10 left-1/1.2 animate-bounce text-purple-600 hover:text-purple-800 transition"
          aria-label="Scroll to How It Works"
        >
          <ArrowDown className="w-8 h-8" />
        </button>
      </section>

      <section
        ref={howItWorksRef}
        className="py-24 px-6 bg-white rounded-t-[3rem] shadow-inner relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
              The Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              How It Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FloatingCard>
              <StepCard
                icon={<UserCheck className="w-6 h-6" />}
                title="Sign up in the miniapp"
                description="Start your journey by signing up and making a quick payment inside our miniapp."
              />
            </FloatingCard>

            <FloatingCard>
              <StepCard
                icon={<Compass className="w-6 h-6" />}
                title="We read your profile"
                description="Our system learns your interests by analyzing your Farcaster profile."
              />
            </FloatingCard>

            <FloatingCard>
              <StepCard
                icon={<Bot className="w-6 h-6" />}
                title="AI curates for you"
                description="Our AI finds the most relevant posts and people for you — automatically."
              />
            </FloatingCard>

            <FloatingCard>
              <StepCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="You cast, we reply"
                description="Whenever you cast, the AI responds with useful replies based on your needs."
              />
            </FloatingCard>

            <FloatingCard>
              <StepCard
                icon={<UserCheck className="w-6 h-6" />}
                title="No channels, no tags"
                description="No extra work. Just cast as usual and we'll bring the right info to you."
              />
            </FloatingCard>

            <FloatingCard>
              <StepCard
                icon={<Compass className="w-6 h-6" />}
                title="Example: Travel Help"
                description="Looking for Dubai tips during Token2049? We'll reply with guides from trusted people."
              />
            </FloatingCard>
          </div>
        </div>
      </section>
    </main>
  );
}

type StepCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function StepCard({ icon, title, description }: StepCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-[#f7f9fc] rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full group">
      <div className="mb-6 text-purple-600 bg-purple-100 p-3 rounded-lg inline-block group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
