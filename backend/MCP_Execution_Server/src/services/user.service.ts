import { SupabaseClient } from "@supabase/supabase-js";
import { NeynarService } from "./neynar.service.js";
import { AIService } from "./ai.service.js";

export class UserService {
  constructor(
    private neynarService: NeynarService,
    private aiService: AIService,
    private db: SupabaseClient,
  ) { }

  async registerUser(fid: string) {
    try {
      const userData = await this.neynarService.aggregateUserData(fid);
      // // 2. Pass it to AI service for summarization
      // const summary = await this.aiService.summarizeUserContext(userData);
      // console.log("Summary", summary);
      // if (!summary) throw new Error("Summary generation failed");
      // // 3. Generate embeddings
      // const embeddings = await this.aiService.generateEmbeddings(summary);
      // console.log("Embeddings", embeddings);
      // if (!embeddings) throw new Error("Embedding generation failed");

      // 4. Store in DB
      // const { error } = await this.db.from("user_embeddings").upsert({
      //   fid,
      //   summary,
      //   embeddings,
      // });
      //
      // if (error) throw error;

      return { success: true, data: userData };
    } catch (err: any) {
      console.error("registerUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async getUser(fid: string) {
    try {
      const { data, error } = await this.db
        .from("user_embeddings")
        .select("*")
        .eq("fid", fid);

      if (error) throw error;

      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error("getUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async registerCast(fid: string, cast: any) {
    try {
      console.log("Received cast for processing", { fid, cast });

      // Step 1: Check if the DB has the FID of the user who sent the webhook
      const { data: userData, error: userError } = await this.db
        .from("user_embeddings")
        .select("*")
        .eq("fid", fid)
        .single();

      if (userError || !userData) {
        throw new Error(`User with fid ${fid} not found`);
      }

      // Step 2: Generate embeddings for the received cast
      const castEmbeddings = await this.aiService.generateEmbeddings(cast.text);
      if (!castEmbeddings) {
        throw new Error("Embedding generation failed for the cast text");
      }

      // Step 3: Use the match_users_by_embedding function to find similar users
      const { data: similarUsers, error: similarityError } = await this.db.rpc(
        "match_users_by_embedding",
        {
          query_embedding: castEmbeddings,
          match_threshold: 0.8, // Set the desired similarity threshold
          match_count: 5, // Limit to top 5 most similar users
        },
      );

      if (similarityError || !similarUsers) {
        throw new Error("Error finding similar users");
      }

      // Step 4: Create a map of the current fid and all similar ones
      const similarUserMap: any = {};
      similarUsers.forEach((user: any) => {
        similarUserMap[user.fid] = user.similarity;
      });

      // Step 5: For each similar user from DB, find their casts/feeds
      const userFeedPromises = Object.keys(similarUserMap).map(
        async (similarFid) => {
          const feed = await this.neynarService.fetchUserFeeds(similarFid);
          return { fid: similarFid, feed };
        },
      );
      const similarUserFeeds = await Promise.all(userFeedPromises);

      // Step 6: Find trending feed from Farcaster, limit 20
      const trendingFeeds = await this.neynarService.fetchTrendingFeeds();

      // Step 7: Pass all of this to AI to get a personalized reply
      const aiResponse = await this.aiService.generateReplyForCast({
        userCast: cast.text,
        similarUserFeeds,
        trendingFeeds,
      });

      if (!aiResponse || !aiResponse.replyText) {
        throw new Error("AI response generation failed");
      }

      const castReply = await this.neynarService.replyToCast({
        text: aiResponse.replyText,
        parentHash: cast.hash,
      });

      return { success: true, data: castReply };
    } catch (err: any) {
      console.error("registerCast error", err);
      return { success: false, error: err.message || err };
    }
  }
}
