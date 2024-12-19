import { Request } from "express";
import { getNameFromFullName, handleUploadSingleImage } from "~/utils/file";
import sharp from "sharp";
import { UPLOAD_DIR } from "~/constants/dir";
import path from "path";

class MediasServices {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    console.log(file)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    const info = await sharp(file.filepath).jpeg().toFile(newPath)
    return info
  }
};

const mediasServices = new MediasServices();
console.log(mediasServices)
export default mediasServices