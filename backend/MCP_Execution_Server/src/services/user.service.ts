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
      const summary = await this.aiService.summarizeUserContext(userData);
      console.log("Summary", summary);
      if (!summary) throw new Error("Summary generation failed");
      // // 3. Generate embeddings
      const embeddings = await this.aiService.generateEmbeddings(summary);
      console.log("Embeddings", embeddings);
      if (!embeddings) throw new Error("Embedding generation failed");

      // 4. Store in DB
      const { error } = await this.db.from("user_embeddings").upsert({
        fid,
        summary,
        embeddings,
      });

      if (error) throw error;

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
}
