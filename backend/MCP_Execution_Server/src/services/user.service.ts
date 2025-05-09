import type { NeynarService } from "./neynar.service.js";
import type { AIService } from "./ai.service.js";
import type { DBService } from "./db.service.js";

export enum FID_STATUS {
  NOT_EXIST = "NOT_EXIST",
  EXIST = "EXIST",
  SUBSCRIBED = "SUBSCRIBED",
}

export class UserService {
  constructor(
    private neynarService: NeynarService,
    private aiService: AIService,
    private db: DBService,
  ) { }

  async fetchAllUsers() {
    try {
      const { success, data } = await this.db.fetchAllFIDs();
      if (!success) throw new Error("Failed to fetch all users");
      return { success: true, data };
    } catch (err: any) {
      console.error("fetchAllUsers error", err);
      return { success: false, error: err.message || err };
    }
  }

  async checkSubscribedUser(fid: number) {
    try {
      const { success, subscribed } = await this.db.isSubscribed(fid);

      if (!success) throw new Error("Failed to check subscribed user");

      return { success: true, subscribed: subscribed };
    } catch (err: any) {
      console.error("checkSubscribedUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async checkFIDStatus(fid: number): Promise<{ success: boolean; status?: FID_STATUS; error?: string }> {
    try {
      const { success, data } = await this.db.checkFIDStatus(fid);

      if (!success) throw new Error("Failed to check FID status");

      if (!data) {
        return { success: true, status: FID_STATUS.NOT_EXIST };
      }
      if (data.is_subscribed) {
        return { success: true, status: FID_STATUS.SUBSCRIBED };
      }
      return { success: true, status: FID_STATUS.EXIST };
    } catch (err: unknown) {
      console.error("checkFIDStatus error", err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async registerUser(fid: string) {
    try {

      const { success, data: alreadySubscribedFIDs } = await this.db.fetchSubscribedFIDs();
      if (!success) throw new Error("Failed to fetch subscribed FIDs");
      console.log("alreadySubscribedFIDs", alreadySubscribedFIDs);


      const alreadySubsribed = await this.checkFIDStatus(Number(fid));
      if (alreadySubsribed.success) {

        if (alreadySubsribed.status === FID_STATUS.SUBSCRIBED) {
          return { success: true, data: `User ${fid} already subscribed` };
        }

        if (alreadySubsribed.status === FID_STATUS.EXIST) {
          const newSubscribedUserIds = [...alreadySubscribedFIDs, fid];
          await this.neynarService.updateWebhook({
            updatedFids: newSubscribedUserIds,
          });
          const { success } = await this.db.onlySubscribeFID(fid);
          if (!success) throw new Error("User subscription failed");
          return { success: true, data: `User ${fid} subscribed` };
        }

        const userData = await this.neynarService.aggregateUserData(fid);
        const summary = await this.aiService.summarizeUserContext(userData);
        if (!summary) throw new Error("Summary generation failed");
        const embeddings = await this.aiService.generateEmbeddings(summary);
        if (!embeddings) throw new Error("Embedding generation failed");

        const { success } = await this.db.registerAndSubscribeFID(fid, summary, embeddings);
        if (!success) throw new Error("User registration failed");

        const newSubscribedUserIds = [...alreadySubscribedFIDs, fid];
        await this.neynarService.updateWebhook({
          updatedFids: newSubscribedUserIds,
        });
        return { success: true, data: `User ${fid} subscribed` };
      }

      return { success: false, error: "User not found" };
    } catch (err: any) {
      console.error("registerUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async registerUserDataForBackend(fid: string) {
    try {
      // check if the user is already registered
      const { success, registered } = await this.db.isRegistered(Number(fid));
      if (success && registered) {
        console.log("User already registered, skipping, fid:", fid);
        return { success: true, data: registered };
      }
    } catch (error) {
      console.error("registerUserDataForBackend error", error);
    }

    try {
      const userData =
        await this.neynarService.aggregateUserDataForBackend(fid);
      const summary = await this.aiService.summarizeUserContext(userData);
      if (!summary) throw new Error("Summary generation failed");
      const embeddings = await this.aiService.generateEmbeddings(summary);
      if (!embeddings) throw new Error("Embedding generation failed");

      const { success } = await this.db.onlyRegisterFID(fid, summary, embeddings);
      console.log("Registered user data", fid);
      if (!success) throw new Error("User registration failed");
      return { success: true, data: userData };
    } catch (err: any) {
      console.error("registerUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async getUser(fid: string) {
    try {
      const { success, data } = await this.db.getUser(Number(fid));

      if (!success || !data) throw new Error("Failed to get user");

      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error("getUser error", err);
      return { success: false, error: err.message || err };
    }
  }

  async registerCast(fid: string, cast: any) {
    console.log("registering cast");

    const { data: existingReply } = await this.db.isCastReplyExists(cast.hash);

    if (existingReply) {
      console.log("Cast already processed, skipping");
      return { success: true, data: "Cast already processed" };
    }

    if (cast.parent_hash) {
      console.log("This is a reply, skipping");
      return { success: true, data: "This is a reply, skipping" };
    }

    try {
      // Step 1: Check if the DB has the FID of the user who sent the webhook
      const { success, registered } = await this.db.isRegistered(Number(fid));

      if (!success || !registered) {
        throw new Error(`User with fid ${fid} not found`);
      }

      // Step 2: Generate embeddings for the received cast
      const castSummary = await this.aiService.findMeaningFromText(cast.text);
      const castEmbeddings =
        await this.aiService.generateEmbeddings(castSummary);
      if (!castEmbeddings) {
        throw new Error("Embedding generation failed for the cast text");
      }

      const { data: similarUsers, error: similarityError } = await this.db.fetchSimilarFIDs(castEmbeddings, 0.4, 3);
      console.log("Similar users", similarUsers);
      if (similarityError || !similarUsers) {
        throw new Error("Error finding similar users");
      }

      const similarUserMap: any = {};
      for (const user of similarUsers) {
        if (fid === user.fid) {
          continue;
        }
        similarUserMap[user.fid] = {
          summary: user.summary,
        };
      }

      const userFeedPromises = Object.keys(similarUserMap).map(
        async (similarFid) => {
          const userData =
            await this.neynarService.fetchCastsForUser(similarFid);
          return { userData, summary: similarUserMap[similarFid].summary };
        },
      );
      const similarUserFeeds = await Promise.all(userFeedPromises);
      const trendingFeeds = await this.neynarService.fetchTrendingFeeds();

      const aiResponse = await this.aiService.generateReplyForCast({
        userCast: cast.text,
        castSummary: castSummary,
        similarUserFeeds,
        trendingFeeds,
      });

      if (!aiResponse || !aiResponse.replyText) {
        throw new Error("AI response generation failed");
      }

      if (
        aiResponse.replyText ===
        "No relevant trending casts found in the provided data."
      ) {
        console.log("No relevant trending casts found");
        return { success: true, data: aiResponse };
      }

      const castReply = await this.neynarService.replyToCast({
        text: aiResponse.replyText,
        parentHash: cast.hash,
        embeds: [
          {
            url: aiResponse.link,
          },
        ],
      });

      console.log("Cast replied");

      await this.db.addCastReply(cast.hash);

      return { success: true, data: castReply };
    } catch (err: any) {
      console.error("registerCast error", err);
      return { success: false, error: err.message || err };
    }
  }
}
