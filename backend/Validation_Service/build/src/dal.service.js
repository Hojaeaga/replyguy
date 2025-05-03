import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const ipfsHost = process.env.IPFS_HOST || '';
export async function getIPfsTask(cid) {
    const { data } = await axios.get(ipfsHost + cid);
    return {
        symbol: data.symbol,
        price: Number.parseFloat(data.price),
    };
}
