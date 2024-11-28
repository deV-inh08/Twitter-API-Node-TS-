import express, {Request, Response, NextFunction} from "express"
import { validationResult, ValidationChain, } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema";
import { EntityError, ErrorWithStatus } from "~/models/Errors";
import HTTP_STATUS from "~/constants/httpStatus";
const validate = (validation: RunnableValidationChains<ValidationChain>) => {
    return async (req: Request, res:Response, next:NextFunction ) => {
        const result = await validation.run(req);
        const errors = validationResult(req);
           // isEmpty == Not Error
           if(errors.isEmpty()) {
            return next()
        };

        const errorsObject = errors.mapped();
        const entityError = new EntityError({ errors: {}})
        for(const key in errorsObject) {
          // Not Error Validate
          const { msg } = errorsObject[key]
          if(msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_UNTITY) {
            return next(msg)
          }
          entityError.errors[key] = errorsObject[key]
        }
        next(entityError)
    }
};

export default validate;