import { type Proof, verifyProof } from '@reclaimprotocol/js-sdk';

export class ReclaimService {
    async verifyProof(proof: Proof): Promise<boolean> {
        let result: boolean;
        try {
            result = await verifyProof(proof);
        } catch (error) {
            console.error("Error verifying proof", error);
            throw error;
        }
        return result;
    }
}