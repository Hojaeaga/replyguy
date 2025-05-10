import axios from "axios";
import type { AxiosResponse } from "axios";
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
    /**
     * Channel Fetched
     * Nomads
     * Monad
     * Screens
     * f1
     * books
     * ai
     * creators
     */

    const channelId = "crypto";

    // Define the response type based on the Farcaster API docs
    interface ChannelMember {
        fid: number;
        memberAt: number;
    }

    interface ChannelMembersResponse {
        result: {
            members: ChannelMember[];
        };
        next?: {
            cursor: string;
        };
    }

    let members: ChannelMember[] = [];

    try {
        // First API call to get initial members
        const initialResponse = await axios.get<ChannelMembersResponse>(
            `https://api.warpcast.com/fc/channel-members?channelId=${channelId}`
        );

        // Add initial members to our array
        if (initialResponse.data?.result?.members) {
            members = [...initialResponse.data.result.members];
        }

        // Handle pagination if there's a next cursor
        if (initialResponse.data?.next?.cursor) {
            let cursor: string | undefined = initialResponse.data.next.cursor;

            // Continue fetching pages while there's a cursor
            while (cursor) {
                const nextResponse: AxiosResponse<ChannelMembersResponse> = await axios.get<ChannelMembersResponse>(
                    `https://api.warpcast.com/fc/channel-members?channelId=${channelId}&cursor=${cursor}`
                );

                if (nextResponse.data?.result?.members) {
                    members.push(...nextResponse.data.result.members);
                }

                // Update cursor for next page or exit loop
                cursor = nextResponse.data?.next?.cursor;
            }
        } else {
            console.log("Only one page of results found");
        }

    } catch (error) {
        console.error("Error occurred fetching channel members:", error);
        return; // Exit early if we can't fetch the members
    }

    const fids = members.map((member: ChannelMember) => member.fid);
    console.log(`Total number of users for ${channelId} to register: ${fids.length}`);

    for (const fid of fids) {
        try {
            await userService.registerUserDataForBackend(fid.toString());
        } catch (error) {
            console.error(`Error registering user with FID ${fid}:`, error);
        }
    }
    console.log("Registered all users in the channel:", channelId);

    return;
}

// Run the script
registerUser(); 