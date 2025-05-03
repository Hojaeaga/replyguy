import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export async function getPrice(pair) {
    let res = null;
    try {
        const result = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        res = result.data;
    }
    catch (err) {
        console.error(err);
    }
    return res;
}
