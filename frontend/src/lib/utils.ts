import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { mnemonicToAccount } from "viem/accounts";

interface FrameMetadata {
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  frame: {
    version: string;
    name: string;
    iconUrl: string;
    homeUrl: string;
    imageUrl: string;
    buttonTitle: string;
    splashImageUrl: string;
    splashBackgroundColor: string;
    webhookUrl: string;
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSecretEnvVars() {
  const seedPhrase = process.env.SEED_PHRASE;
  const fid = process.env.FID;

  if (!seedPhrase || !fid) {
    return null;
  }

  return { seedPhrase, fid };
}

export async function getFarcasterMetadata(): Promise<FrameMetadata> {
  // First check for FRAME_METADATA in .env and use that if it exists
  if (process.env.FRAME_METADATA) {
    try {
      const metadata = JSON.parse(process.env.FRAME_METADATA);
      console.log("Using pre-signed frame metadata from environment");
      return metadata;
    } catch (error) {
      console.warn("Failed to parse FRAME_METADATA from environment:", error);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_URL not configured");
  }

  // Get the domain from the URL (without https:// prefix)
  const domain = new URL(appUrl).hostname;
  console.log("Using domain for manifest:", domain);

  const secretEnvVars = getSecretEnvVars();
  if (!secretEnvVars) {
    console.warn(
      "No seed phrase or FID found in environment variables -- generating unsigned metadata",
    );
  }

  let accountAssociation;
  if (secretEnvVars) {
    // Generate account from seed phrase
    const account = mnemonicToAccount(secretEnvVars.seedPhrase);
    const custodyAddress = account.address;

    const header = {
      fid: parseInt(secretEnvVars.fid),
      type: "custody",
      key: custodyAddress,
    };
    const encodedHeader = Buffer.from(JSON.stringify(header), "utf-8").toString(
      "base64",
    );

    const payload = {
      domain,
    };
    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
      "utf-8",
    ).toString("base64url");

    const signature = await account.signMessage({
      message: `${encodedHeader}.${encodedPayload}`,
    });
    Buffer.from(signature, "utf-8").toString("base64url");

    accountAssociation = {
      header:
        "eyJmaWQiOjQzNTQ2NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDNkOTdiMDk2MDU2NzM0NTdiMjVCZWI0QjEyOTAxY0NDZEMwMUNFMWIifQ",
      payload: "eyJkb21haW4iOiJyZXBseWd1eS5tZWdhYnl0ZTB4Lnh5eiJ9",
      signature:
        "MHhjN2Q3NGNhNWJkNDk2ZWUwMDE3YThlNjkxYTA1MjhjZmI3MzI0NDIwMzAxMzc3MjAyNjRhZDNkZjAzZTU4MGY4NWJkYTQ2NThkOTg5N2Q3OTJjODQyMTdlZWE2ZmI0ODUyNjI5MzlkOTEwYmFmMzZkYzM0Y2ZlODljNWZhZjZlNjFi",
    };
  }

  // Determine webhook URL based on whether Neynar is enabled
  const neynarApiKey = process.env.NEYNAR_API_KEY;
  const neynarClientId = process.env.NEYNAR_CLIENT_ID;
  const webhookUrl =
    neynarApiKey && neynarClientId
      ? `https://api.neynar.com/f/app/${neynarClientId}/event`
      : `${appUrl}/api/webhook`;

  return {
    accountAssociation,
    frame: {
      version: "1",
      name: process.env.NEXT_PUBLIC_FRAME_NAME || "Frames v2 Demo",
      iconUrl: `${appUrl}/icon.png`,
      // @ts-expect-error sffds
      heroImageUrl: `${appUrl}/logo_replyguy.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image`,
      buttonTitle: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT || "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl,
    },
  };
}
