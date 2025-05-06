import express from "express";
import bodyParser from "body-parser";
import { userRouter } from "../routes/user.routes.js";

/**
 * Main Execution server class
 */
export class ExecutionServer {
  config: any;
  services: any;
  app: any;

  constructor(config: any, services: any) {
    this.config = config;
    this.services = services;


    this.app = express();
    this.app.use(bodyParser.json());

    // Mount REST routes
    this.app.use("/api", userRouter(this.services.user));

  }

  /**
   * Start both MCP and Express servers
   */
  async start() {
    try {
      // Start Express REST API
      const PORT = this.config.port || 4003;
      this.app.listen(PORT, () => {
        console.log(`Express API running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error starting server:", error);
      throw error;
    }
  }
}

