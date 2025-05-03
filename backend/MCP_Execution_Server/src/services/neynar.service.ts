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

    let proof: any;

    try {
      proof = await this.reclaimClient.zkFetch(
        url,
        publicOptions,
        privateOptions,
      )
    } catch (err) {
      console.error("fetchUserPopularCasts error", err);
      return null;
    }

    if (proof === undefined) {
      return null;
    }

    const castData = JSON.parse(proof.extractedParameterValues.data);
    try {
      // await this.avs.sendTask(proof.proof, castData, 0);
      await axios.post("http://localhost:4002/task/validate", {
        proofOfTask: proof,
      });
    } catch (err) {
      console.error("sendTask error", err);
    }
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
