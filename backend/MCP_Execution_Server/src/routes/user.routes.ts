// routes/user.routes.js
import express, { Request, Response, Router, NextFunction } from "express";
import { UserService } from "../services/user.service.js";

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

      if (type !== "cast.create" || !data?.cast) {
        res.status(400).json({ error: "Invalid webhook payload" });
        return;
      }

      const cast = data.cast;
      const userId = cast.author.fid; // You can look up your DB user via fid

      try {
        const result = await userService.registerCast(userId, cast);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error("Error in /register/cast:", error);
        next(error);
      }
    },
  );
  return router;
}
