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
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "wagmi/query";
import { sdk } from "@farcaster/frame-sdk";
import { queryClient } from "./providers/WagmiProvider";
import { toast } from "sonner";
type UserSubscriptionResponse = {
  result: {
    subscribed: boolean;
  };
};

const textToShare = `
hey, checkout @yourreplyguy 👀

It helps to connect with and find revelant people as per your cast!
`;
const carouselItems = [
  {
    src: "/validation1.svg",
    alt: "job posted on Farcaster",
    text: "Job posted on Farcaster with just 100+ views, here’s when we help organsations reach the right audience!",
  },
  {
    src: "/validation2.svg",
    alt: "",
    text: "Connect with people meeting at events, by finding through their casts.",
  },
];

const fetchUserSubscription = async (
  fid: number,
): Promise<UserSubscriptionResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/user?fid=${fid}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
};

const registerUser = async (fid: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fid }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
};

const unsubscribeUser = async (fid: number) => {
  const response = await fetch(`/api/backend/unsubscribe`, {
    method: "POST",
    body: JSON.stringify({ fid }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Unsubscribe failed");
  }

  return response.json();
};

export default function Home() {
  const { context } = useFrame();
  const [isSubscribed, setSubscribed] = useState(false);
  const screen2Ref = useRef<HTMLDivElement>(null);
  const screen3Ref = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const fetchUserQuery = useQuery<
    UserSubscriptionResponse, // TQueryFnData
    Error, // TError
    UserSubscriptionResponse, // TData (same as raw here)
    [string, number | undefined] // TQueryKey
  >({
    queryKey: ["userSubscription", context?.user?.fid],
    queryFn: async () => {
      if (!context?.user?.fid) {
        return Promise.resolve({ result: { subscribed: false } });
      }
      return await fetchUserSubscription(context.user.fid);
    },
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      setSubscribed(true);
      queryClient.refetchQueries({
        queryKey: ["userSubscription", context?.user?.fid],
      });
    },
    onError: (error) => {
      setSubscribed(false);
      console.error("Error registering user:", error);
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: unsubscribeUser,
    onSuccess: (data) => {
      console.log("Unsubscribe successful:", data);
      setSubscribed(false);
      queryClient.refetchQueries({
        queryKey: ["userSubscription", context?.user?.fid],
      });
    },
    onError: (error) => {
      console.error("Error unsubscribing user:", error);
    },
  });

  const handleComposeMutation = useMutation({
    mutationFn: async () => {
      const result = await sdk.actions.composeCast({
        text: textToShare,
        embeds: ["https://replyguy.megabyte0x.xyz"],
      });
      return result;
    },
  });

  const handleSubscribe = async () => {
    if (!context || !context.user?.displayName) {
      toast.warning("This is a mini app, redirecting you to the main app");
      window.location.href = "https://farcaster.xyz/miniapps/1six6FpX-nRm/replyguy"
      return;
    }
    await mutation.mutateAsync(context.user.fid);
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      console.log("Error adding frame:", error);
    }
    setSubscribed(true);
  };
  useEffect(() => {
    if (!fetchUserQuery.data) return;
    setSubscribed(fetchUserQuery.data?.result.subscribed);
  }, [fetchUserQuery.data]);

  return (
    <main className="font-sans bg-white text-gray-900 overflow-x-hidden">
      {/* Screen 1 */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          className="absolute top-5 left-[43%]"
        />
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
            onClick={handleSubscribe}
            disabled={mutation.isPending}
            className="mt-6 px-4 py-2 text-[14.1px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition"
          >
            {mutation.isPending ? "Loading..." : "Count me in !"}
          </button>
        ) : (
          <>
            <p className="text-sm font-semibold text-green-600">
              🎉 You&apos;re already subscribed!
            </p>
            <button
              onClick={() => handleComposeMutation.mutate()}
              disabled={handleComposeMutation.isPending}
              className="mt-6 px-4 py-2 text-[14.1px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition"
            >
              Share with your friends!
            </button>
          </>
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
              onClick={handleSubscribe}
              disabled={mutation.isPending}
              className="mt-6 px-4 py-2 text-[14.1px] bg-black text-white rounded-[10px] font-semibold hover:scale-105 transition"
            >
              {mutation.isPending ? "Loading..." : "Count me in !"}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  unsubscribeMutation.mutate(context?.user.fid as number)
                }
                disabled={unsubscribeMutation.isPending}
                className="mt-6 px-4 py-2 text-[14.1px] bg-red-600 text-white rounded-[10px] font-semibold hover:bg-red-700 transition"
              >
                Unsubscribe
              </button>
              <p className="text-xs font-semibold text-red-600">
                We are sad to see you go
              </p>
            </div>
          )}
        </div>
        <p className="mt-4 text-gray-600 text-xs max-w-md text-center font-semibold">
          If you are an organisation, reach out to us to run personalised ads
        </p>
      </section>
    </main>
  );
}
