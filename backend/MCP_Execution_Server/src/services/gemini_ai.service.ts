import { GoogleGenAI } from "@google/genai";

export class GeminiAiService {
  private ai: GoogleGenAI;
  private geminiModel: string;
  private embeddingModel: string;

  constructor(private geminiApiKey: string) {
    this.ai = new GoogleGenAI({
      apiKey: this.geminiApiKey,
    });
    this.geminiModel = "gemini-2.5-flash";
    this.embeddingModel = "embedding-001";
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
      const result = await this.ai.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
      });
      return result.text;
    } catch (err: any) {
      console.error("summarizeUserContext error", err);
      return null;
    }
  }

  async findMeaningFromText(text: string) {
    const prompt = `
<instruction>
Analyze the following Farcaster cast and extract a flat, structured list of cohort-relevant keywords.
These keywords will be used for user clustering, so focus on identifying meaningful interests, behaviors, communities, and intent expressed in the cast.
</instruction>

<cast_text>
${text}
</cast_text>

<output_requirements>
1. Return a flat list of lowercase, hyphenated keywords (no sentences or explanations).
2. Each keyword should reflect a cohort-relevant dimension such as:
    - Specific interest/topic (e.g. 'onchain-fitness', 'ai-art-tools')
    - Behavioral pattern or intent (e.g. 'open-collab-invite', 'builder-outreach')
    - Community or context (e.g. 'farcaster-networking', 'zora-poster')
    - Product or content domain (e.g. 'fitness-dapp-creator', 'frame-developer')
    - Personality or engagement style (e.g. 'thoughtful-replier', 'public-builder')
3. Avoid vague terms like 'web3', 'tech', or generic verbs.
4. Keep it concise — no more than 10 keywords per cast.
5. Output must be a single comma-separated line of keywords only.
</output_requirements>

<examples>
Input: "building something around onchain-fitness — let's connect?"
Output: onchain-fitness, builder-outreach, farcaster-networking, fitness-dapp-creator, open-collab-invite, community-collaborator, health-and-wellness

Input: "launched a new frame using Zora — supports music NFTs"
Output: zora-frame-builder, music-nft-creator, frame-launcher, zora-user, creative-tools-user, public-release-announcement
</examples>
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
      });
      return result.text;
    } catch (err: any) {
      console.error("findMeaningFromText error", err);
      return null;
    }
  }

  async generateReplyForCast({
    userCast,
    castSummary,
    similarUserFeeds,
    trendingFeeds,
  }: {
    userCast: string;
    castSummary: string;
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
Analyze the user's cast and prioritize finding relevant content from similar users first, then trending feeds if necessary. Select the SINGLE most relevant cast that connects with the user's interests or topic. Only select from the actual provided content - never generate or fabricate anything.
</task>

<user_cast>
${userCast}
</user_cast>

Use the cast summary to understand the user's interests and context, this will provide a deeper understanding of the user's intent and preferences.
<cast_summary>
${castSummary}
</cast_summary>

<similar_user_feeds>
${formattedSimilarUserFeeds}
</similar_user_feeds>

<trending_feeds>
${formattedTrendingFeeds}
</trending_feeds>

<instructions>
1. First identify key themes, topics, and interests in the user's cast.
2. PRIORITIZE similar user feeds - examine these first and try to find the most relevant match here before looking at trending feeds.
3. Only if no good match exists in similar user feeds, then examine the trending feeds.
4. Select only ONE existing cast that best relates to the user's content based on:
    - Topic relevance
    - Semantic similarity
    - Any shared channels or interests
5. If no relevant casts are found or if all feeds are malformed, respond with: "No relevant trending casts found in the provided data."
6. Never fabricate or generate casts - only select from what is actually provided in the similar_user_feeds or trending_feeds.
7. AVOID talking about airdrops and giveaways.
</instructions>

<output_format>
You MUST respond with ONLY a valid JSON object containing exactly these two fields:
- replyText: A string with the message "You should connect with [author_username], who said: '[cast_text]'" - Max 60-70 words, 320 characters.
- link: A string with the URL "https://warpcast.com/[author_username]/[cast_hash]" - this should MATCH the cast you selected and not a fabricated/random one.

If a channel exists, append "Join the conversation in the /[channel_name] channel." to the replyText value.

Example output:
{
  "replyText": "You should connect with username123, who said: 'This is an interesting thought about AI.' Join the conversation in the /ai channel.",
  "link": "https://warpcast.com/username123/0x123abc"
}

If and only if you find no relevant casts, respond with this exact format:
{
  "replyText": "No relevant trending casts found in the provided data.",
  "link": ""
}
</output_format>

<response_requirements>
Your response should be a valid JSON object with no additional text or explanation.
</response_requirements>
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
      });
      const content = result.text?.trim();

      try {
        return content
          ? JSON.parse(content)
          : {
              replyText:
                "No relevant trending casts found in the provided data.",
              link: "",
            };
      } catch (jsonErr) {
        console.warn("Response was not valid JSON:", content);
        return { error: "Invalid JSON format in AI response", raw: content };
      }
    } catch (err: any) {
      console.error("generateReplyForCast error", err);
      return "Sorry, I couldn't generate a reply at the moment.";
    }
  }

  async generateEmbeddings(text: string) {
    try {
      const result = await this.ai.models.embedContent({
        model: this.embeddingModel,
        contents: text,
      });
      return result.embeddings;
    } catch (err: any) {
      console.error("generateEmbeddings error", err);
      return null;
    }
  }
}
