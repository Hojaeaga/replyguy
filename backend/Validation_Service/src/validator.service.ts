import { ReclaimService } from "./reclaim.service.js";
import type { Proof } from "@reclaimprotocol/js-sdk";

export async function validate(proofOfTask: Proof) {
  const reclaimService = new ReclaimService();
  try {
    // const taskResult = await getIPfsTask(proofOfTask);
    // const data = await getPrice("ETHUSDT");
    // const upperBound = data.price * 1.05;
    // const lowerBound = data.price * 0.95;
    // let isApproved = true;
    // if (taskResult.price > upperBound || taskResult.price < lowerBound) {
    //   isApproved = false;
    // }

    const isApproved = await reclaimService.verifyProof(proofOfTask);
    return isApproved;
  } catch (err) {
    console.error(err);
    return false;
  }
}

