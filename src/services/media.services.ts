import { Request } from "express";
import { getNameFromFullName, handleUploadSingleImage } from "~/utils/file";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/dir";
import path from "path";
import fs from 'fs'
import { isProduction } from "~/constants/config";
import { config } from "dotenv";
config()

class MediasServices {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    const newName = getNameFromFullName(file.newFilename);
    console.log(newName)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath);
    return isProduction ? `${process.env.HOST}/static/image/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`
  }
};

const mediasServices = new MediasServices();
export default mediasServices