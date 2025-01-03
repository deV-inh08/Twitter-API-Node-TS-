import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path';
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  [UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if(!fs.existsSync(dir)) {
      return fs.mkdirSync(dir, {
        recursive: true // Folder nested
      })
    }
  })
};

export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
};

export const getExtension = (fullName: string) => {
  const namearr = fullName.split('.');
  return namearr[namearr.length - 1];
};

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if(err) {
        reject(err)
      }
      if(!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
};

// Generate a unique ID upfront 
export const handleUploadVideo = async (req: Request) => {
  const nanoId = (await import('nanoid')).nanoid;
  const idName = nanoId();
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath);
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    filter: function({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    },
    filename: function(filename, ext) {
      return idName + ext
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if(err) {
        reject(err)
        if(!Boolean(files.video)) {
          return reject(new Error('File is empty'))
        }
      }
      const videos = files.video as File[];
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + `.` + `${ext}`)
        video.newFilename = video.newFilename + '.' + ext
        video.filepath = video.filepath + '.' + ext
      });
      resolve(files.video as File[])
    })
  })
}