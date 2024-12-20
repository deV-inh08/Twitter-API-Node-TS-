import { NextFunction, Request, Response } from "express";
import path from "path";
import { UPLOAD_DIR } from "~/constants/dir";
import USERS_MESSAGE from "~/constants/messages";
import mediasServices from "~/services/media.services";


export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasServices.handleUploadSingleImage(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
};

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    console.log(err)
    if(err) {
      res.status((err as any).status).send('Not found')
      
    }
  })
}