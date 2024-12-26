import { NextFunction, Request, Response } from "express";
import path from "path";
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir";
import HTTP_STATUS from "~/constants/httpStatus";
import USERS_MESSAGE from "~/constants/messages";
import mediasServices from "~/services/media.services";
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasServices.uploadImage(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
};

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if(err) {
      res.status((err as any).status).send('Not found') 
    }
  })
};

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasServices.uploadVideo(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
};

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasServices.uploadVideoHLS(req)
  return res.json({
    message: USERS_MESSAGE.UPLOAD_SUCCESS,
    result: url
  })
};

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {

    const range = req.headers.range;
    if(!range) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
    }
    const { name } = req.params;
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
    // 1MB = 10^6 bytes || 1MB = 2**20

    const videoSize = fs.statSync(videoPath).size

    const chuckSize = 10 ** 6;

    // Get bytes start from headers
    const start = Number(range?.replace(/\D/g, ''))

    // Get bytes end 
    const end = Math.min(start + chuckSize, videoSize - 1)

    const contentLenght = end - start + 1;
    // fix ES modules run Common JS enviroment
    
    const mime = (await import('mime')).default;
    const contentType = mime.getType(videoPath) || 'video/*'
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges':  'bytes',
      'Content-Lenght': contentLenght,
      'Content-Type': contentType
    }

    res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.pipe(res)
}


export const serveVideoM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if(err) {
      res.status((err as any).status).send('Not found') 
    }
  })
};

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if(err) {
      res.status((err as any).status).send('Not found') 
    }
  })
};