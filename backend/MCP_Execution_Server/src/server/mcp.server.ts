import express from "express";
import bodyParser from "body-parser";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPriceTool } from "../tools/price.tool.js";
import { registerTaskTool } from "../tools/task.tool.js";
import { registerSendTaskPrompt } from "../prompts/send-task.prompt.js";
import { createUserRouter } from "../routes/user.routes.js";

/**
 * Main AVS MCP server class
 */
export class AvsMCPServer {
  server: any;
  config: any;
  services: any;
  app: any;

  constructor(config: any, services: any) {
    this.config = config;
    this.services = services;

    this.server = new McpServer(
      {
        name: config.server.name,
        version: config.server.version
      },
      {
        capabilities: {
          prompts: {}
        }
      }
    );

    this.app = express();
    this.app.use(bodyParser.json());

    // Mount REST routes
    this.app.use("/api", createUserRouter(this.services.user));

    this.initializeServer();
  }

  /**
   * Register MCP prompts and tools
   */
  initializeServer() {
    registerSendTaskPrompt(this.server);
    registerPriceTool(this.server, this.services.price);
    registerTaskTool(this.server, this.services.ipfs, this.services.avs);
  }

  /**
   * Start both MCP and Express servers
   */
  async start() {
    try {
      // Start MCP server (stdio)
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      // Start Express REST API
      const PORT = this.config.port || 9000;
      this.app.listen(PORT, () => {
        console.log(`Express API running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error starting server:", error);
      throw error;
    }
  }
}

