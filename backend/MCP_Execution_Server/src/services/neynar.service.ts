import axios from "axios";
import type { ReclaimClient } from '@reclaimprotocol/zk-fetch';
import type { AVSService } from "./avs.service.js";
export class NeynarService {
  constructor(
    private neynarApiKey: string,
    private signerUuid: string,
    private reclaimClient: ReclaimClient,
    private avs: AVSService,
  ) { }

  private getHeaders() {
    return {
      "x-api-key": this.neynarApiKey,
      "Content-Type": "application/json",
    };
  }

  async writeCast(text: string) {
    try {
      const res = await axios.post(
        "https://api.neynar.com/v2/farcaster/cast",
        {
          signer_uuid: this.signerUuid,
          text,
        },
        { headers: this.getHeaders() },
      );
      return res.data;
    } catch (err) {
      console.error("writeCast error", err);
      return null;
    }
  }

  async replyToCast({
    text,
    parentHash,
  }: {
    text: string;
    parentHash: string;
  }) {
    try {
      const res = await axios.post(
        "https://api.neynar.com/v2/farcaster/cast",
        {
          signer_uuid: this.signerUuid,
          text,
          parent_hash: parentHash,
        },
        { headers: this.getHeaders() },
      );
      return res.data;
    } catch (err) {
      console.error("replyToCast error", err);
      return null;
    }
  }

  async fetchUserRepliesAndRecasts(fid: string) {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/feed/user/replies_and_recasts",
        {
          params: { fid },
          headers: this.getHeaders(),
        },
      );
      const allCasts = res.data.casts;
      // Filter: meaningful replies or recasts with content
      const meaningfulCasts = allCasts.filter((cast: any) => {
        const text = cast.text?.trim();
        const hasText = !!text && text.length > 0;
        const hasMedia = cast.embeds?.length > 0 || cast.mentions?.length > 0;
        const isReply = cast.parent_hash !== null;
        const isRecast = cast.recasted_cast !== undefined;

        // Filter for thoughtful replies or recasts with context
        return (isReply || isRecast) && (hasText || hasMedia);
      });

      const top10 = meaningfulCasts.slice(0, 10);

      return top10;
    } catch (err) {
      console.error("fetchUserRepliesAndRecasts error", err);
      return null;
    }
  }

  async fetchUserPopularCasts(fid: string) {
    const publicOptions = {
      method: 'GET', // or POST
    }

    const privateOptions = {
      headers: {
        "x-api-key": this.neynarApiKey,
        "Content-Type": "application/json",
      }
    }

    const url = `https://api.neynar.com/v2/farcaster/feed/user/popular?fid=${fid}`;

    let proof: any;

    try {
      proof = await this.reclaimClient.zkFetch(url, publicOptions, privateOptions);
    } catch (err) {
      console.error("fetchUserPopularCasts error", err);
      return null;
    }

    if (proof === undefined) {
      return null;
    }

    const castData = JSON.parse(proof.extractedParameterValues.data);

    const simplifiedCasts = castData.casts.map((cast: any) => ({
      hash: cast.hash,
      text: cast.text,
      timestamp: cast.timestamp,
      channel: cast.channel?.name || null,
      embedUrls: cast.embeds?.map((e: any) => e.url) || [],
      frame: cast.frames?.length
        ? {
          title: cast.frames[0].title,
          buttons: cast.frames[0].buttons?.map((b: any) => b.title) || [],
        }
        : null,
      likes: cast.reactions?.likes_count || 0,
      recasts: cast.reactions?.recasts_count || 0,
    }));

    try {
      // await this.avs.sendTask(proof.proof, castData, 0);
      await axios.post("http://localhost:4002/task/validate", {
        proofOfTask: proof,
      });
    } catch (err) {
      console.error("sendTask error", err);
    }

    return simplifiedCasts;

  }

  async fetchUserChannels(fid: string) {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/user/channels",
        {
          params: { fid },
          headers: this.getHeaders(),
        },
      );

      const simplifiedChannels = res.data.channels.map((channel: any) => {
        const lead = channel.lead || {};
        const bio = lead.profile?.bio?.text || "";
        const locationObj = lead.profile?.location?.address;
        const location = locationObj
          ? `${locationObj.city || ""}, ${locationObj.country || ""}`
          : null;

        return {
          id: channel.id,
          name: channel.name,
          description: channel.description,
          follower_count: channel.follower_count,
          member_count: channel.member_count,
          url: channel.url,
          external_link: channel.external_link || null,
          image_url: channel.image_url,
          lead: {
            fid: lead.fid,
            username: lead.username,
            display_name: lead.display_name,
            bio,
            location,
            follower_count: lead.follower_count,
            verified_accounts:
              lead.verified_accounts?.map((acc: any) => acc.username) || [],
          },
        };
      });

      return simplifiedChannels;
    } catch (err) {
      console.error("fetchUserChannels error", err);
      return null;
    }
  }

  async fetchTrendingFeeds() {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/feed/trending?limit=10",
        {
          headers: this.getHeaders(),
        },
      );

      const simplifiedCasts = res.data.casts.map((cast: any) => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        channel: cast.channel?.name || null,
        embedUrls: cast.embeds?.map((e: any) => e.url) || [],
        frame: cast.frames?.length
          ? {
            title: cast.frames[0].title,
            buttons: cast.frames[0].buttons?.map((b: any) => b.title) || [],
          }
          : null,
        likes: cast.reactions?.likes_count || 0,
        recasts: cast.reactions?.recasts_count || 0,
      }));

      return simplifiedCasts;
    } catch (err) {
      console.error("fetchTrendingFeeds error", err);
      return null;
    }
  }

  async fetchUserFeeds(fid: string) {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/feed/user",
        {
          params: { fid },
          headers: this.getHeaders(),
        },
      );
      const simplifiedCasts = res.data.casts.map((cast: any) => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        channel: cast.channel?.name || null,
        embedUrls: cast.embeds?.map((e: any) => e.url) || [],
        frame: cast.frames?.length
          ? {
            title: cast.frames[0].title,
            buttons: cast.frames[0].buttons?.map((b: any) => b.title) || [],
          }
          : null,
        likes: cast.reactions?.likes_count || 0,
        recasts: cast.reactions?.recasts_count || 0,
      }));
      return simplifiedCasts;
    } catch (err) {
      console.error("fetchUserFeeds error", err);
      return null;
    }
  }

  async aggregateUserData(fid: string) {
    const [popularCasts, channels, recentCasts] = await Promise.all([
      this.fetchUserPopularCasts(fid),
      this.fetchUserChannels(fid),
      this.fetchUserRepliesAndRecasts(fid),
    ]);

    return {
      popularCasts,
      channels,
      recentCasts,
    };
  }
}
