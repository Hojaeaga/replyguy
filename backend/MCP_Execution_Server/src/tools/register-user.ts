import axios from "axios";
import { UserService } from "../services/user.service.js";
import { NeynarService } from "../services/neynar.service.js";
import { AIService } from "../services/ai.service.js";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { AVSService } from "../services/avs.service.js";
import { IpfsService } from "../services/ipfs.service.js";
import { ReclaimClient } from "@reclaimprotocol/zk-fetch";

/**
 * CLI tool to register a user's data by FID
 */
async function registerUser() {
    const db = createClient(
        config.supabase.SUPABASE_URL as string,
        config.supabase.SUPABASE_ANON_KEY as string,
    );

    const reclaim = new ReclaimClient(
        config.reclaim.appId,
        config.reclaim.appSecret,
    )

    const ai = new AIService(config.openai.apiKey as string);
    console.log("RPC BASE ADDRESS:", config.network.rpcBaseAddress);
    const avs = new AVSService(
        config.network.rpcBaseAddress,
        config.network.privateKey,
    );
    const ipfs = new IpfsService(config.pinata.apiKey, config.pinata.secretApiKey);
    const neynar = new NeynarService(config.neynar.apiKey, config.neynar.signerUuid, reclaim, avs, ipfs);
    const userService = new UserService(neynar, ai, db);
    const channelId = "screens";
    let result: any;

    let members: { fid: number, memberAt: number }[] = [];
    try {
        result = await axios.get(`https://api.warpcast.com/fc/channel-members?channelId=${channelId}`)
    } catch (error) {
        console.error("Error occurred:", error);
    }

    if (result.data.next) {
        let cursor = result.data.next.cursor;

        while (cursor) {
            result = await axios.get(`https://api.warpcast.com/fc/channel-members?channelId=${channelId}&cursor=${cursor}`)
            members.push(...result.data.result.members);
            if (result.data.next) {
                cursor = result.data.next.cursor;
            } else {
                cursor = null;
            }
        }
    } else {
        members = result.data.result.members;
    }

    const fids = members.map((member: { fid: number, memberAt: number }) => member.fid);

    for (const fid of fids) {
        try {
            await userService.registerUserDataForBackend(fid.toString())
        } catch (error) {
            console.error("Error occurred:", error);
        }
    }

}

// Run the script
registerUser(); 