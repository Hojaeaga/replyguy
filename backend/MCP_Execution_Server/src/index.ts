import { config } from "./config.js";
import { AvsMCPServer } from "./server/mcp.server.js";
import { NeynarService } from "./services/neynar.service.js";
import { AIService } from "./services/ai.service.js";
import { UserService } from "./services/user.service.js";
import { createClient } from "@supabase/supabase-js";
/**
 * Main application entry point
 */
async function main() {
  try {
    const db = createClient(
      config.supabase.SUPABASE_URL as string,
      config.supabase.SUPABASE_ANON_KEY as string,
    );
    // Initialize services
    const services = {
      neynar: new NeynarService(config.neynar.apiKey, config.neynar.signerUuid),
      ai: new AIService(config.openai.apiKey as string),
      user: new UserService(
        config.network.rpcBaseAddress,
        config.network.privateKey,
        db,
      ),
      // ipfs: new IpfsService(config.pinata.apiKey, config.pinata.secretApiKey),
      //
      // avs: new AVSService(
      //   config.network.rpcBaseAddress,
      //   config.network.privateKey,
      // ),
      //
      // price: new PriceService(config.api.userAgent, config.api.binanceEndpoint),
    };

    // Create and start server
    const avsServer = new AvsMCPServer(config, services);
    await avsServer.start();

  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

// Run the application
main();
