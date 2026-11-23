const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  // Security: block dangerous executable files
  const blockedExecutables = /^(exe|bat|cmd|sh|msi|vbs|scr|pif|com)$/i;
  if (blockedExecutables.test(ext)) {
    return cb(new Error(`Executable files (.${ext}) are not permitted for security reasons.`), false);
  }

  // Thumbnails must be standard web image formats
  if (file.fieldname === 'thumbnail') {
    const allowedImages = /^(jpeg|jpg|png|webp|svg|gif|avif)$/i;
    if (ext && !allowedImages.test(ext)) {
      return cb(new Error(`Thumbnail must be an image (.jpg, .png, .webp, .svg, .gif).`), false);
    }
  }

  // All valid digital deliverables allowed up to 50MB
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maximum
  },
  fileFilter
});

module.exports = upload;
