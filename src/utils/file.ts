import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  const uploadFolderPath = UPLOAD_TEMP_DIR
  if(!fs.existsSync(uploadFolderPath)) {
    return fs.mkdirSync(uploadFolderPath, {
      recursive: true // Folder nested
    })
  }
};

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb
    filter: function({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      if(err) {
        reject(err)
      }
      if(!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
};


export const getNameFromFullName = (fullname: string) => {
  const namearr = fullname.split('.')
  console.log(namearr)
  namearr.pop()
  return namearr.join('')
}