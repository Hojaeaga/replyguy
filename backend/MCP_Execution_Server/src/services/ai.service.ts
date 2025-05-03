// services/AIService.ts
import axios from "axios";

export class AIService {
  constructor(private openAiApiKey: string) { }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.openAiApiKey}`,
      "Content-Type": "application/json",
    };
  }

  async summarizeUserContext(userData: any) {
    const prompt = `
<instruction>
Generate a comprehensive but concise summary of the user's interests, preferences, and personality based on their Farcaster data. 
This summary will be used to create embeddings for accurate user cohort matching.
</instruction>

<user_data>
${JSON.stringify(userData, null, 2)}
</user_data>

<output_requirements>
1. Focus on extracting key interests, topics, and behavioral patterns
2. Include engagement styles (how they interact with content)
3. Identify content preferences and themes they gravitate toward
4. Note any distinct personality traits evident from their activity
5. Highlight potential affinity groups or communities they might belong to
6. Keep the summary between 200-300 words for optimal embedding performance
7. Use specific examples from their data to support your analysis
8. Return ONLY the summary text with no preamble or explanation
</output_requirements>

<examples>
A good summary clearly identifies patterns like "Tech enthusiast focused on AI and web3, regularly engages with philosophical discussions, shows interest in DeFi projects especially those focusing on scalability, tends to respond thoughtfully to long-form content..."

A poor summary would be vague like "This user likes crypto and tech" or include irrelevant metadata that doesn't help with cohort matching.
</examples>
    `;

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert analyst generating psychological and content interest summaries.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        { headers: this.getHeaders() },
      );

      return res.data.choices[0].message.content;
    } catch (err: any) {
      console.error("summarizeUserContext error", err.response?.data || err);
      return null;
    }
  }
  async generateReplyForCast(
    fid: string,
    cast: any,
  ): Promise<{ replyText: string }> {
    try {
      const castText = cast.text;

      // 1. Generate embedding for the incoming cast
      const castEmbedding = await this.generateEmbeddings(castText);
      if (!castEmbedding) throw new Error("Failed to generate cast embedding");

      // 2. Query Supabase for similar users using vector similarity
      const { data: similarUsers, error } = await this.db.rpc(
        "match_users_by_embedding",
        {
          query_embedding: castEmbedding,
          match_threshold: 0.75,
          match_count: 5,
        },
      );

      if (error || !similarUsers || similarUsers.length === 0) {
        console.warn("No similar users found");
      }

      // 3. Pull recent replies and recasts for these users using Neynar
      const relatedCasts = [];
      for (const user of similarUsers) {
        const repliesAndRecasts = await this.neynarService.getRepliesAndRecasts(
          user.fid,
        );
        relatedCasts.push(...(repliesAndRecasts || []));
      }

      // 4. Generate the prompt with context
      const prompt = `
<instruction>
Write an engaging, thoughtful reply to the following cast.
Use the cast content and similar users' interactions for inspiration.
</instruction>

<cast>
${castText}
</cast>

<context_from_similar_users>
${relatedCasts
          .slice(0, 5)
          .map((c, i) => `${i + 1}. ${c.text}`)
          .join("\n")}
</context_from_similar_users>

<guidelines>
- Keep tone friendly and natural
- Ensure relevance to the original cast
- Avoid generic phrases, use specific keywords if helpful
- Keep it under 300 characters
</guidelines>
    `;

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a Farcaster reply bot that responds in contextually smart and friendly ways.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        { headers: this.getHeaders() },
      );

      const replyText = res.data.choices[0].message.content.trim();
      return { replyText };
    } catch (err: any) {
      console.error("generateReplyForCast error", err.response?.data || err);
      return { replyText: "Appreciate your cast! 😊" }; // fallback
    }
  }

  async generateEmbeddings(text: string) {
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
          model: "text-embedding-3-small",
          input: text,
        },
        { headers: this.getHeaders() },
      );

      return res.data.data[0].embedding;
    } catch (err: any) {
      console.error("generateEmbeddings error", err.response?.data || err);
      return null;
    }
  }
}
