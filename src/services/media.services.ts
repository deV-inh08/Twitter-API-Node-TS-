import { Request } from "express";
import { getNameFromFullName, handleUploadImage } from "~/utils/file";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/dir";
import path from "path";
import fs from 'fs'
import { isProduction } from "~/constants/config";
import { config } from "dotenv";
import { MediaType } from "~/constants/enum";
import { Media } from "~/models/Orther";
config()

class MediasServices {
  async handleUploadSingleImage(req: Request) {
    const files = await handleUploadImage(req);
    const result: Media[] = await Promise.all(files.map( async (file) => {
      const newName = getNameFromFullName(file.newFilename);
      const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
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
};

const mediasServices = new MediasServices();
export default mediasServices