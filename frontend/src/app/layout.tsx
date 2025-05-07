import type { Metadata } from "next";

import { getSession } from "~/auth";
import "~/app/globals.css";
import { Providers } from "~/app/providers";

import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Add weights you plan to use
  variable: "--font-bricolage", // Optional for CSS variable usage
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "Frames v2 Demo",
  description:
    process.env.NEXT_PUBLIC_FRAME_DESCRIPTION ||
    "A Farcaster Frames v2 demo app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" className={bricolage.className}>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
