import { NeynarService } from "../services/neynar.service.js";

/**
 * Registers the cast tool with the MCP server
 * @param {McpServer} server - MCP server instance
 * @param {NeynarService} neynarService - Neynar service
 */
export function registerCastTool(server: any, neynarService: NeynarService) {
  server.tool(
    "cast",
    "Cast a reply to a specific cast from the user",
    async ({ text }: { text: string }) => {
      try {
        const cast = await neynarService.writeCast(text);
        console.log("cast", cast);
        return {
          content: [
            {
              type: "text",
              text: `Casted successfully`,
            },
          ],
        };
      } catch (error) {
        console.error("Error in cast tool:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to cast",
            },
          ],
        };
      }
    },
  );
}
