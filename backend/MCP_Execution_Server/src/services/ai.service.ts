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
    const formattedTrendingFeeds = trendingFeeds
      .map((feed) => JSON.stringify(feed))
      .join("\n");
    const prompt = `
<task>
Analyze the user's cast and the provided trending feeds to identify and select the SINGLE most relevant trending cast that connects with the user's interests or topic. Only select from the actual trending feeds provided - do not generate or fabricate content.
</task>

<user_cast>
${userCast}
</user_cast>

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
