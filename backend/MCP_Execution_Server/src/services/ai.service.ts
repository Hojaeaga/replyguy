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
From the user's Farcaster data, extract a structured keyword profile representing their interests, behaviors, communities, and preferences. 
This profile will be used to generate embeddings and cluster users into highly relevant cohorts.
</instruction>

<user_data>
${JSON.stringify(userData, null, 2)}
</user_data>

<output_requirements>
1. Return a flat list of lowercase, hyphenated keywords (no sentences).
2. Each keyword should reflect a meaningful trait, behavior, tool, or interest (e.g. 'zora-user', 'frame-builder', 'philosophy-discussions', 'onchain-gaming').
3. Focus on cohort-defining dimensions: content topics, communities, actions, personality style, and engagement type.
4. Avoid vague terms like "web3" or "crypto" unless combined with specificity (e.g. 'web3-design', 'crypto-security-research').
5. No filler words, no explanation — only the keyword list, comma-separated.
</output_requirements>

<examples>
Good output:
"frame-builder, farcaster-poweruser, zora-poster, thoughtful-replier, ai-curious, defi-scalability, ethcc-attendee, builder-in-public, photography-enthusiast, governance-participant"

Bad output:
"This user enjoys Web3 and tech. They are very active online and like to post." (Too vague, narrative style)
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
    const formattedTrendingFeeds = trendingFeeds
      .map((feed) => JSON.stringify(feed))
      .join("\n");
    const formattedSimilarUserFeeds = similarUserFeeds
      .map((feed) => JSON.stringify(feed))
      .join("\n");

    const prompt = `
<task>
Analyze the user's cast and the provided trending feeds to identify and select the SINGLE most relevant trending cast that connects with the user's interests or topic. Only select from the actual trending feeds provided - do not generate or fabricate content.
</task>

<user_cast>
${userCast}
</user_cast>

<similar_user_feeds>
${formattedSimilarUserFeeds}
</similar_user_feeds>

<trending_feeds>
${formattedTrendingFeeds}
</trending_feeds>

<instructions>
1. First identify key themes, topics, and interests in the user's cast.
2. Examine each trending cast in the provided feeds and select only ONE existing cast that best relates to the user's content.
3. Search if the in the cast can relate to any channel or topic the user is interested in - semantic similarity.
4. If no relevant casts are found or if all feeds are malformed, respond with: "No relevant trending casts found in the provided data."
5. Never fabricate or generate casts - only select from what is actually provided in the trending_feeds.
</instructions>

<output_format>
You MUST respond with ONLY a valid JSON object containing exactly these two fields:
- replyText: A string with the message "You should connect with [author_username], who said: '[cast_text]'" - Max 60-70 words, 320 characters.
- link: A string with the URL "https://warpcast.com/[author_username]/[cast_hash]"

If a channel exists, append "Join the conversation in the /[channel_name] channel." to the replyText value.

Example output:
{
  "replyText": "You should connect with username123, who said: 'This is an interesting thought about AI.' Join the conversation in the /ai channel.",
  "link": "https://warpcast.com/username123/0x123abc"
}
</output_format>
Your response should be a valid JSON object with no additional text or explanation.
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

      const content = res.data.choices[0].message.content.trim();

      try {
        return JSON.parse(content);
      } catch (jsonErr) {
        console.warn("Response was not valid JSON:", content);
        return { error: "Invalid JSON format in AI response", raw: content };
      }
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
