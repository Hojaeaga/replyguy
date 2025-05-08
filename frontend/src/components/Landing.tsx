"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "./providers/FrameProvider";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
const carouselItems = [
  {
    src: "/validation1.svg",
    alt: "job posted on Farcaster",
    text: "Job posted on Farcaster with just 100+ views, here’s when we help you reach the right audience!",
  },
  {
    src: "/validation2.svg",
    alt: "",
    text: "Connect with people meeting at events, by finding through their casts.",
  },
];
export default function Home() {
  const { context } = useFrame();
  const screen2Ref = useRef<HTMLDivElement>(null);
  const screen3Ref = useRef<HTMLDivElement>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const checkUserAlreadySubscribed = async () => {
    if (!context || !context.user.displayName) {
      console.log("User not logged in");
      return;
    }

    try {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/user`,
      );
      url.searchParams.append("fid", context.user.fid.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error(
          "Registration check failed with status:",
          response.status,
        );
        return;
      }

      const result = await response.json();
      console.log("Registration check result:", result);
      setIsSubscribed(result.subscribed);
      console.log("Registration check successful:", result);
    } catch (error) {
      console.error("Error checking user registration:", error);
    }
  };

  const subscribeUser = async () => {
    if (!context || !context.user.displayName) {
      console.log("User not logged in");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fid: context.user.fid }),
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

  useEffect(() => {
    if (!context) return;
    checkUserAlreadySubscribed();
  }, [context?.user?.fid]);
  return (
    <main className="font-sans bg-white text-gray-900 overflow-x-hidden">
      {/* Screen 1 */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
        <p className="text-base text-gray-500 mb-2">
          GM, {context?.user?.displayName || "there"}!
        </p>
        <h1 className="text-[24.6px] font-bold">
          We are here to{" "}
          <span className="text-[#7E7E7E] font-extrabold">Personalise</span>
          <br />
          your Experience.
        </h1>
        <p className="mt-4 text-gray-600 max-w-md">
          Discover ideas, people, connections , and more on Farcaster.
        </p>
        {!isSubscribed ? (
          <button
            onClick={subscribeUser}
            className="mt-6 px-4 py-2 text-[14.1px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition"
          >
            Count me in !
          </button>
        ) : (
          <p className="mt-6 text-[14px] font-semibold text-green-600">
            🎉 Thanks for subscribing!
          </p>
        )}

        <Image
          src="/illus.svg"
          alt="Phone screenshot"
          width={300}
          height={800}
        />
        <button
          className="absolute bottom-10 left-1/1.2 text-purple-600 hover:text-purple-800 transition flex flex-col items-center"
          aria-label="Scroll to How It Works"
        >
          <p className="mt-10 text-[10.53px] text-gray-500">
            Scroll Down to find out more !
          </p>
          <Image
            src="/arrow.svg"
            alt="Arrow down"
            width={20}
            height={20}
            className="mt-2"
          />
        </button>
      </section>

      {/* Screen 2 */}
      <section
        ref={screen2Ref}
        className="min-h-screen px-4 bg-[#f7f7f7] flex flex-col items-center justify-center text-center"
      >
        <h2 className="text-[24.6px] font-semibold mt-4">
          Here&apos;s a sneak peek
        </h2>
        <Image
          src="/phone.svg"
          alt="Phone screenshot"
          width={400}
          height={400}
          className="flex items-center justify-center"
        />
        <p className="text-gray-700 max-w-lg mb-4">
          We deliver the best content instantly based on your cast and
          interests.
        </p>
      </section>

      {/* Screen 3 */}
      <section
        ref={screen3Ref}
        className="min-h-screen px-6 bg-white flex flex-col items-center"
      >
        <h2 className="text-[21px] font-bold mt-8 mb-8 text-center">
          We discovered the need and we shipped!
        </h2>
        <Carousel
          className="p-4 w-[80%]"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {carouselItems.map((item, idx) => (
              <CarouselItem key={idx} className="flex flex-col items-center">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={400}
                  height={300}
                  className="rounded-md border"
                />
                <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto text-center">
                  {item.text}
                </p>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious ref={prevRef} />
          <CarouselNext ref={nextRef} />
        </Carousel>
        {!isSubscribed && (
          <>
            <p className="mt-4 text-gray-600 text-xs max-w-md text-center font-semibold">
              Looks fun to you ?
            </p>
            <p className="text-gray-600 text-xs max-w-md text-center font-semibold">
              Subscribe to us now !
            </p>
          </>
        )}

        <div className="relative inline-block mt-6">
          {!isSubscribed ? (
            <button
              onClick={subscribeUser}
              className="px-4 py-2 text-[14.1px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition"
            >
              Subscribe now!
            </button>
          ) : (
            <p className="text-sm font-semibold text-green-600">
              🎉 You&apos;re already subscribed!
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
