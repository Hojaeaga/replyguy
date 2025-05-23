// routes/user.routes.js
import express from "express";
import type { Request, Response, Router, NextFunction } from "express";
import type { UserService } from "../services/user.service.js";

export function userRouter(userService: UserService): Router {
  const router = express.Router();

  router.post(
    "/register/user",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { fid } = req.body;

      if (!fid) {
        res.status(400).json({ error: "Missing User FID" });
        return;
      }

      try {
        const result = await userService.registerUser(fid);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error("Error in /register/user:", error);
        next(error);
      }
    },
  );
  router.post(
    "/register/cast",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { type, data } = req.body;

      if (type !== "cast.created" || !data) {
        res.status(400).json({ error: "Invalid webhook payload" });
        return;
      }

      const cast = data;
      const userId = cast.author.fid; // You can look up your DB user via fid

      userService
        .registerCast(userId, cast)
        .catch((error) =>
          console.error("Background cast registration error:", error),
        );

      // Send immediate success response
      res.status(200).json({ success: true });
    },
  );
  router.get(
    "/register/user",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { fid } = req.query;

      if (!fid || typeof fid !== "string") {
        res.status(400).json({ error: "Missing or invalid User FID" });
        return;
      }

      try {
        const result = await userService.checkSubscribedUser(Number(fid));
        res.status(200).json({ result });
      } catch (error) {
        console.error("Error in /fetch/user:", error);
        next(error);
      }
    },
  );

  router.post(
    "/unsubscribe/user",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const apiKey = req.header("x-api-key");

      if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        res.status(401).json({ error: "Unauthorized: Invalid API key" });
        return;
      }
      const { fid } = req.body;
      if (!fid) {
        res.status(400).json({ error: "Missing User FID" });
        return;
      }

      try {
        const result = await userService.unsubscribeUser(fid);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error("Error in /unsubscribe/user:", error);
        next(error);
      }
    },
  );
  return router;
}
