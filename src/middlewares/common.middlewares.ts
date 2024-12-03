import {Request, Response, NextFunction} from 'express'
import { pick } from 'lodash'

type FilterKeys<T> = Array<keyof T>

export const filterMiddleware = <T>(filterKeys: FilterKeys<T>) =>  (req: Request, re: Response, next: NextFunction) => {
  req.body = pick(req.body, filterKeys)
  next()
}