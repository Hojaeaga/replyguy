
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export class DBService {
    supabase: SupabaseClient;
    constructor(SUPABASE_URL: string, SUPABASE_ANON_KEY: string) {
        this.supabase = createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    }

    async getUser(fid: number) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").select("*").eq("fid", fid);
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("getUser error", err);
            return { success: false, error: err.message || err };
        }
    }

    async isSubscribed(fid: number) {
        try {
            const { data, error } = await this.supabase
                .from("user_embeddings")
                .select("fid")
                .eq("fid", fid)
                .eq("is_subscribed", true)
                .maybeSingle();
            if (error) throw error;
            return { success: true, subscribed: !!data };
        } catch (err: any) {
            console.error("checkSubscribedUser error", err);
            return { success: false, error: err.message || err };
        }
    }

    async isRegistered(fid: number) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").select("fid").eq("fid", fid).maybeSingle();
            if (error) throw error;
            return { success: true, registered: !!data };
        } catch (err: any) {
            console.error("isRegistered error", err);
            return { success: false, error: err.message || err };
        }
    }

    async registerAndSubscribeFID(fid: string, summary: any, embeddings: any) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").insert({
                fid,
                summary,
                embeddings,
                is_subscribed: true
            });
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("registerUser error", err);
            return { success: false, error: err.message || err };
        }
    }

    async onlySubscribeFID(fid: string) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").update({ is_subscribed: true }).eq("fid", fid);
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("onlySubscribeFID error", err);
            return { success: false, error: err.message || err };
        }
    }

    async onlyRegisterFID(fid: string, summary: any, embeddings: any) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").insert({
                fid,
                summary,
                embeddings,
                is_subscribed: false
            });
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("registerUser error", err);
            return { success: false, error: err.message || err };
        }
    }

    async fetchSubscribedFIDs() {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").select("fid").eq("is_subscribed", true);
            if (error) throw error;
            const fids = data.map((user: any) => user.fid);
            return { success: true, data: fids };
        } catch (err: any) {
            console.error("fetchSubscribedFIDs error", err);
            return { success: false, error: err.message || err, data: [] };
        }
    }

    async checkFIDStatus(fid: number) {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").select("fid, is_subscribed").eq("fid", fid).maybeSingle();
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("checkFIDStatus error", err);
            return { success: false, error: err.message || err };
        }
    }

    async fetchAllFIDs() {
        try {
            const { data, error } = await this.supabase.from("user_embeddings").select("*");
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("fetchAllFIDs error", err);
            return { success: false, error: err.message || err };
        }
    }

    async fetchSimilarFIDs(cast_embeddings: any, match_threshold: number, match_count: number) {
        try {
            const { data, error } = await this.supabase.rpc("match_users_by_embedding", { query_embedding: cast_embeddings, match_threshold, match_count });
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("fetchSimilarFIDs error", err);
            return { success: false, error: err.message || err };
        }
    }

    async addCastReply(cast_hash: string) {
        try {
            const { data, error } = await this.supabase.from("cast_replies").insert([{ cast_hash }]);
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("addCastReply error", err);
            return { success: false, error: err.message || err };
        }
    }

    async isCastReplyExists(cast_hash: string) {
        try {
            const { data, error } = await this.supabase.from("cast_replies").select("cast_hash").eq("cast_hash", cast_hash).maybeSingle();
            if (error) throw error;
            return { success: true, data };
        } catch (err: any) {
            console.error("isCastReplyExists error", err);
            return { success: false, error: err.message || err };
        }
    }


}
