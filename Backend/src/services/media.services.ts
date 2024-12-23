import { Request } from "express";
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from "~/utils/file";
import sharp from "sharp";
import { UPLOAD_IMAGE_DIR } from "~/constants/dir";
import path from "path";
import fs from 'fs'
import { isProduction } from "~/constants/config";
import { config } from "dotenv";
import { MediaType } from "~/constants/enum";
import { Media } from "~/models/Orther";
import { encodeHLSWithMultipleVideoStreams } from "~/utils/video";
config()

class MediasServices {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req);
    const result: Media[] = await Promise.all(files.map( async (file) => {
      const newName = getNameFromFullName(file.newFilename);
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`);
      await sharp(file.filepath).jpeg().toFile(newPath);
      fs.unlinkSync(file.filepath);
      return{
        url: isProduction 
        ? `${process.env.HOST}/static/image/${newName}.jpg` 
        : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
        type: MediaType.Image
      } 
    }))
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
        ? `${process.env.HOTS}/static/video/${file.newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
  return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req);
    console.log(files)
    const result: Media[] = await Promise.all(files.map(async (file) => {
      await encodeHLSWithMultipleVideoStreams(file.filepath)
      return {
        url: isProduction
        ? `${process.env.HOTS}/static/video/${file.newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    }))
  return result
  }
};

const mediasServices = new MediasServices();
export default mediasServices