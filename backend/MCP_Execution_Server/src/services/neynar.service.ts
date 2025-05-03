import axios from "axios";
import type { ReclaimClient } from '@reclaimprotocol/zk-fetch';

export class NeynarService {
  constructor(
    private neynarApiKey: string,
    private signerUuid: string,
    private reclaimClient: ReclaimClient,
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

    let res: any;

    try {


      res = await this.reclaimClient.zkFetch(
        url,
        publicOptions,
        privateOptions,
      )



    } catch (err) {
      console.error("fetchUserPopularCasts error", err);
      return null;
    }

    if (res === undefined) {
      return null;
    }

    const castData = JSON.parse(res.extractedParameterValues.data);
    console.log("proof", res);
    return castData;

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
      return res.data;
    } catch (err) {
      console.error("fetchUserChannels error", err);
      return null;
    }
  }

  async aggregateUserData(fid: string) {
    const [popularCasts, channels] = await Promise.all([
      this.fetchUserPopularCasts(fid),
      this.fetchUserChannels(fid),
    ]);

    return {
      popularCasts,
      channels,
    };
  }
}
