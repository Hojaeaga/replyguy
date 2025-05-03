// services/AIService.ts
import axios from "axios";
// <similar_user_feeds>
// ${similarUserFeeds.join("\n")}
// </similar_user_feeds>
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
  async generateReplyForCast({
    userCast,
    similarUserFeeds,
    trendingFeeds,
  }: {
    userCast: string;
    similarUserFeeds: any[];
    trendingFeeds: any[];
  }) {
    const prompt = `
<instruction>
Analyze the user's cast and search through the trending feeds to find the most relevant cast that connects with the user's interests or topic. Reply with the selected trending cast details and explain why it's specifically relevant to the user.
</instruction>

<user_cast>
${userCast}
</user_cast>

<trending_feeds>
${trendingFeeds.join("\n")}
</trending_feeds>

<output_requirements>
1. First identify key themes, topics, and interests in the user's cast.
2. Select the SINGLE most relevant cast from the trending feeds that best connects to the user's content.
3. Structure your reply in two parts:
   a) The complete details of the relevant trending cast
   b) A brief explanation (2-3 sentences) of why this specific cast is relevant to the user
4. The explanation should highlight specific connections between the user's content and the recommended cast.
5. Keep the total response under 200 words.
6. Be specific about the connection points rather than making generic statements.
</output_requirements>

<examples>
A good reply would include: "I found this trending cast by @username that discusses [specific topic from user's cast]. They explore [key detail] which connects with your interest in [user's specific interest]."

A poor reply would vaguely say "This might interest you" without explaining the specific relevance or connection points.
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
                "You are an expert conversational AI, generating replies based on user context and trending topics.",
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
      console.error("generateReplyForCast error", err.response?.data || err);
      return "Sorry, I couldn't generate a reply at the moment.";
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
