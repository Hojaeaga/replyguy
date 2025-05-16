// routes/user.routes.js
import express from "express";
import type { Request, Response, Router, NextFunction } from "express";
import { DBService } from "../services/db.service.js";
import { config } from "../config.js";

export function appRouter(): Router {
    const router = express.Router();

    const db = new DBService(config.supabase.SUPABASE_URL, config.supabase.SUPABASE_ANON_KEY);

    router.get(
        "/app/get-subscriber-count",
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const result = await db.fetchSubscriberCount();
                res.status(200).json({ data: result.data });
            } catch (error) {
                console.error("Error in /app/get-subscriber-count:", error);
                next(error);
            }
        },
    );
    return router;
}
