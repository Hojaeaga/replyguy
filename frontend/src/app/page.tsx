import type { Metadata } from "next";
import App from "./app";

const appUrl =  `https://replyguy.megabyte0x.xyz`;

// frame preview metadata
const appName = "ReplyGuy";
const splashImageUrl = `${appUrl}/logo_replyguy.png`;
const iconUrl = `${appUrl}/logo_replyguy.png`;

const framePreviewMetadata = {
  version: "next",
  imageUrl: `${appUrl}/full_logo.png`,
  iconUrl,
  heroImageUrl: `${appUrl}/full_logo.png`,
  button: {
    title: "Get my reply guy!",
    action: {
      type: "launch_frame",
      name: appName,
      url: appUrl,
      splashImageUrl,
      iconUrl,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: appName,
    openGraph: {
      title: appName,
      description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION,
    },
    other: {
      "fc:frame": JSON.stringify(framePreviewMetadata),
    },
  };
}

export default function Home() {
  return <App />;
}
