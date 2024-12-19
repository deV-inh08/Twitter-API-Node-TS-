import { Request } from 'express'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  const uploadFolderPaths = path.resolve('uploads')
  if(!fs.existsSync(uploadFolderPaths)) {
    return fs.mkdirSync(uploadFolderPaths, {
      recursive: true // Folder nested
    })
  }
}


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
  return new Promise((resolve, reject) => {
    form.parse(req, (err, field, files) => {
      console.log('Field', field)
      console.log('File', files)
      if(err) {
        reject(err)
      }
      if(!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files)
    })
  })
}