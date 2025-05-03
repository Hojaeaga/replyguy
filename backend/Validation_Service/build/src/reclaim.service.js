import { verifyProof } from '@reclaimprotocol/js-sdk';
export class ReclaimService {
    async verifyProof(proof) {
        let result;
        try {
            result = await verifyProof(proof);
        }
        catch (error) {
            console.error("Error verifying proof", error);
            throw error;
        }
        return result;
    }
}
