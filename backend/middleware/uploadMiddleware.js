import multer from 'multer'
import path from 'path'
import fs from 'fs'

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'resume' ? 'uploads/resumes' : 'uploads/avatars'
    ensureDir(folder)
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueSuffix)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Resume must be a PDF file'), false)
    }
  }
  if (file.fieldname === 'avatar') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Avatar must be an image file'), false)
    }
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
