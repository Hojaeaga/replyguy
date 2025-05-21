import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import type { CastWithInteractions, User } from '@neynar/nodejs-sdk/build/api';
// Load environment variables
dotenv.config();

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
const neynarClient = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();


// API endpoint to get reactions for all casts
app.get("/api/subscribers", async (req, res) => {
    let fids: number[] = [];
    let users: User[] = [];

    try {
        const { data, error } = await supabase.from("user_embeddings").select("fid").eq("is_subscribed", true);
        if (error) {
            throw error;
        }
        fids = data.map((user) => user.fid);
    } catch (error) {
        console.error('Error fetching followers:', error);
    }

    try {
        const BATCH_SIZE = 100;
        const DELAY_MS = 60000; // 1 minute delay between batches

        // Process fids in batches of 100
        for (let i = 0; i < fids.length; i += BATCH_SIZE) {
            const batchFids = fids.slice(i, i + BATCH_SIZE);

            try {
                const response = await neynarClient.fetchBulkUsers({ fids: batchFids });
                users = [...users, ...response.users];

                // Add delay between batches if there are more batches to process
                if (i + BATCH_SIZE < fids.length) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
                }
            } catch (error) {
                console.error(`Error fetching users for batch ${i / BATCH_SIZE + 1}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in batch processing:', error);
    }

    users.sort((a, b) => b.follower_count - a.follower_count);

    res.json(users);
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
