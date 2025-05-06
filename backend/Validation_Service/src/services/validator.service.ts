import { getIPfsTask } from "./dal.service.js";
import { ReclaimService } from "./reclaim.service.js";

export async function validate(ipfsHash: string, timestamp: string) {
  const reclaimService = new ReclaimService();

  let proof;
  let isVerified;

  try {
    proof = await getIPfsTask(ipfsHash);
  }
  catch (err) {
    console.error("Error in retrieving IPFS:", err);
    return false;
  }

  try {
    isVerified = await reclaimService.verifyProof(proof);
    console.log("isVerified", isVerified);
  }
  catch (err) {
    console.error("Error in verifying proof:", err);
    return false;
  }


  return isVerified;
}

