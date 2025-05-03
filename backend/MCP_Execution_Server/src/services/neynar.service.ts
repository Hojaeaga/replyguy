import axios from "axios";

export class NeynarService {
  constructor(
    private neynarApiKey: string,
    private signerUuid: string,
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
      console.log("writeCast", res.data);
      return res.data;
    } catch (err) {
      console.error("writeCast error", err);
      return null;
    }
  }

  async fetchUserPopularCasts(fid: string) {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/feed/user/popular",
        {
          params: { fid },
          headers: this.getHeaders(),
        },
      );
      console.log("fetchUserPopularCasts", res.data);
      return res.data;
    } catch (err) {
      console.error("fetchUserPopularCasts error", err);
      return null;
    }
  }

  async fetchUserReactions(fid: string) {
    try {
      const res = await axios.get(
        "https://api.neynar.com/v2/farcaster/reactions/user",
        {
          params: { fid },
          headers: this.getHeaders(),
        },
      );
      console.log("fetchUserReactions", res.data);
      return res.data;
    } catch (err) {
      console.error("fetchUserReactions error", err);
      return null;
    }
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
      console.log("fetchUserChannels", res.data);
      return res.data;
    } catch (err) {
      console.error("fetchUserChannels error", err);
      return null;
    }
  }

  async aggregateUserData(fid: string) {
    const [popularCasts, reactions, channels] = await Promise.all([
      this.fetchUserPopularCasts(fid),
      this.fetchUserReactions(fid),
      this.fetchUserChannels(fid),
    ]);

    return {
      popularCasts,
      reactions,
      channels,
    };
  }
}
