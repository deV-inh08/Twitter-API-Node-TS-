import express, {Request, Response, NextFunction} from "express"
import { validationResult, ValidationChain, } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema";

const validate = (validation: RunnableValidationChains<ValidationChain>) => {
    return async (req: Request, res:Response, next:NextFunction ) => {
        const result = await validation.run(req);

        const errors = validationResult(req);
        // isEmpty == Not Error
        if(errors.isEmpty()) {
            return next()
        };
        res.status(400).json({
            errors: errors.mapped()
        })
    }
};

export default validate;