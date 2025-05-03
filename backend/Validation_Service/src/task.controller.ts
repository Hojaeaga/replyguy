import { Router } from "express";
import { CustomError } from "./utils/validateError.js";
import { CustomResponse } from "./utils/validateResponse.js";
import { validate } from "./validator.service.js";

const router = Router()

router.post("/validate", async (req: any, res: any) => {
    const proofOfTask = req.body.proofOfTask;
    console.log(`Validate task: proof of task: ${proofOfTask}`);
    try {
        const result = await validate(proofOfTask);
        console.log('Vote:', result ? 'Approve' : 'Not Approved');
        return res.status(200).send(new CustomResponse(result));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})

export default router;
