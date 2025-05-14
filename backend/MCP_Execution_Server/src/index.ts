import { ReclaimClient } from "@reclaimprotocol/zk-fetch";

import { config } from "./config.js";

import { ExecutionServer } from "./server/execution.server.js";
import { NeynarService } from "./services/neynar.service.js";
import { AIService } from "./services/ai.service.js";
import { UserService } from "./services/user.service.js";
import { AVSService } from "./services/avs.service.js";
import { IpfsService } from "./services/ipfs.service.js";
import { DBService } from "./services/db.service.js";
import { GeminiAiService } from "./services/gemini_ai.service.js";

/**
 * Main application entry point
 */
async function main() {
  const db = new DBService(
    config.supabase.SUPABASE_URL,
    config.supabase.SUPABASE_ANON_KEY,
  );

  const reclaim = new ReclaimClient(
    config.reclaim.appId,
    config.reclaim.appSecret,
  );
  const geminiai = new GeminiAiService(config.gemini.apiKey);
  const ai = new AIService(config.openai.apiKey);
  const avs = new AVSService(
    config.network.rpcBaseAddress,
    config.network.privateKey,
  );
  const ipfs = new IpfsService(
    config.pinata.apiKey,
    config.pinata.secretApiKey,
  );
  const neynar = new NeynarService(
    config.neynar.apiKey,
    config.neynar.signerUuid,
    reclaim,
    avs,
    ipfs,
  );
  const user = new UserService(neynar, ai, db, geminiai);

  // Initialize services
  const services = {
    neynar,
    ai,
    user,
    reclaim,
    ipfs,
    avs,
    geminiai,
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
