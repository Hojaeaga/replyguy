import { getIPfsTask } from "./dal.service.js";
import { getPrice } from "./oracle.service.js";
export async function validate(proofOfTask) {
    try {
        const taskResult = await getIPfsTask(proofOfTask);
        const data = await getPrice("ETHUSDT");
        const upperBound = data.price * 1.05;
        const lowerBound = data.price * 0.95;
        let isApproved = true;
        if (taskResult.price > upperBound || taskResult.price < lowerBound) {
            isApproved = false;
        }
        return isApproved;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
