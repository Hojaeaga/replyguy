import { createClient } from "@supabase/supabase-js";
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';

import { config } from "./config.js";

import { ExecutionServer } from "./server/execution.server.js";
import { NeynarService } from "./services/neynar.service.js";
import { AIService } from "./services/ai.service.js";
import { UserService } from "./services/user.service.js";
import { AVSService } from "./services/avs.service.js";

/**
 * Main application entry point
 */
async function main() {
  const db = createClient(
    config.supabase.SUPABASE_URL as string,
    config.supabase.SUPABASE_ANON_KEY as string,
  );

  const reclaim = new ReclaimClient(
    config.reclaim.appId,
    config.reclaim.appSecret,
  )

  const ai = new AIService(config.openai.apiKey as string);
  const avs = new AVSService(
    config.network.rpcBaseAddress,
    config.network.privateKey,
  );
  const neynar = new NeynarService(config.neynar.apiKey, config.neynar.signerUuid, reclaim, avs);
  const user = new UserService(neynar, ai, db);

  // Initialize services
  const services = {
    neynar,
    ai,
    user,
    reclaim,
    // ipfs: new IpfsService(config.pinata.apiKey, config.pinata.secretApiKey),
    avs,
  };
  const executionServer = new ExecutionServer(config, services);

  try {
    // Create and start server
    await executionServer.start();

  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

// Run the application
main();
