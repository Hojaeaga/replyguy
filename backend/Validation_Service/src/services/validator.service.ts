import { getIPfsTask } from "./dal.service.js";
import { ReclaimService } from "./reclaim.service.js";

export async function validate(ipfsHash: string, additionalData: string, taskDefinitionId: string) {
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
  if (taskDefinitionId === "0") {
    try {
      isVerified = await reclaimService.verifyProof(proof);
      console.log("isVerified", isVerified);
    }
    catch (err) {
      console.error("Error in verifying proof:", err);
      return false;
    }
  }

  if (taskDefinitionId === "1") {
    try {
      const proofVerified = await reclaimService.verifyProof(proof);

      if (proofVerified) {
        const data = JSON.parse(proof.extractedParameterValues.data);
        console.log("data", data);
        console.log("additionalData", additionalData);
        if (data.cast.hash !== additionalData) {
          isVerified = false;
        }
      }
    }
    catch (err) {
      console.error("Error in verifying proof:", err);
      return false;
    }
  }

  return isVerified;
}

