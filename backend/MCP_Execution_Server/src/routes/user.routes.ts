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



      userService.registerCast(userId, cast)
        .catch(error => console.error("Background cast registration error:", error));

      // Send immediate success response
      res.status(200).json({ success: true });
    },
  );
  return router;
}
