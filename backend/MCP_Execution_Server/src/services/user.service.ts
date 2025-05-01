import { SupabaseClient } from "@supabase/supabase-js";

export class UserRegisterService {
  constructor(
    private neynarService: any,
    private aiService: any,
    private db: SupabaseClient,
  ) { }

  async registerUser(fid: string) {
    try {
      // 1. Get user data from Neynar
      const userData = await this.neynarService.aggregateUserData(fid);

      // 2. Pass it to AI service for summarization
      const summary = await this.aiService.summarizeUserContext(userData);
      if (!summary) throw new Error("Summary generation failed");

      // 3. Generate embeddings
      const embeddings = await this.aiService.generateEmbeddings(summary);
      if (!embeddings) throw new Error("Embedding generation failed");

      // 4. Store in DB
      const { error } = await this.db.from("user_embeddings").upsert({
        fid,
        summary,
        embeddings,
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error("registerUser error", err);
      return { success: false, error: err.message || err };
    }
  }
}
