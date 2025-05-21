"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const nodejs_sdk_1 = require("@neynar/nodejs-sdk");
// Load environment variables
dotenv_1.default.config();
// Environment variables
const PORT = process.env.PORT || 3001;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
// Check for required environment variables
if (!NEYNAR_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}
// Initialize clients
const neynarClient = new nodejs_sdk_1.NeynarAPIClient({ apiKey: NEYNAR_API_KEY });
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const app = (0, express_1.default)();
// API endpoint to get reactions for all casts
app.get("/api/subscribers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let fids = [];
    let users = [];
    try {
        const { data, error } = yield supabase.from("user_embeddings").select("fid").eq("is_subscribed", true);
        if (error) {
            throw error;
        }
        fids = data.map((user) => user.fid);
    }
    catch (error) {
        console.error('Error fetching followers:', error);
    }
    try {
        const BATCH_SIZE = 100;
        const DELAY_MS = 60000; // 1 minute delay between batches
        // Process fids in batches of 100
        for (let i = 0; i < fids.length; i += BATCH_SIZE) {
            const batchFids = fids.slice(i, i + BATCH_SIZE);
            try {
                const response = yield neynarClient.fetchBulkUsers({ fids: batchFids });
                users = [...users, ...response.users];
                // Add delay between batches if there are more batches to process
                if (i + BATCH_SIZE < fids.length) {
                    yield new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }
            }
            catch (error) {
                console.error(`Error fetching users for batch ${i / BATCH_SIZE + 1}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Error in batch processing:', error);
    }
    users.sort((a, b) => b.follower_count - a.follower_count);
    res.json(users);
}));
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
