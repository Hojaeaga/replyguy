import { getIPfsTask } from "./dal.service.js";
import { ReclaimService } from "./reclaim.service.js";
import type { Proof } from "@reclaimprotocol/js-sdk";

export async function validate(ipfsHash: string, expectedLength: string) {
  const reclaimService = new ReclaimService();

  let proof;
  let isVerified;
  let isCorrectLength;

  try {
    proof = await getIPfsTask(ipfsHash);
  }
  catch (err) {
    console.error("Error in retrieving IPFS:", err);
    return false;
  }

  try {
    isVerified = await reclaimService.verifyProof(proof);
  }
  catch (err) {
    console.error("Error in verifying proof:", err);
    return false;
  }

  const castDataLength = JSON.parse(proof.extractedParameterValues.data).casts.length;

  if (castDataLength === expectedLength) {
    isCorrectLength = true;
  }
  else {
    isCorrectLength = false;
  }

  return isVerified && isCorrectLength;
}

