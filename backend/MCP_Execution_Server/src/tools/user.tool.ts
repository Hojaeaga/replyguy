import { UserService } from "../services/user.service.js";

/**
 * Registers the user tool with the MCP server
 * @param {McpServer} server - MCP server instance
 * @param {UserService} userService - User service
 */
export function registerUserTool(server: any, userService: UserService) {
  server.tool(
    "get-user",
    "Get user information and the summary + embeddings of the user",
    async ({ fid }: { fid: string }) => {
      try {
        const user = await userService.getUser(fid);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user),
            },
          ],
        };
      } catch (error) {
        console.error("Error in get-user tool:", error);
        return {
          content: [
            {
              type: "text",
              text: "Failed to get user",
            },
          ],
        };
      }
    },
  );
}
