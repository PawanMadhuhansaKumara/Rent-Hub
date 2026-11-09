const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Multi-file upload middleware for Registration
const registerUpload = upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'nic_photo_front', maxCount: 1 },
  { name: 'nic_photo_back', maxCount: 1 }
]);

// Multi-file upload middleware for Profile Update
const userUpdateUpload = upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'cover_pic', maxCount: 1 }
]);

module.exports = {
  upload,
  registerUpload,
  userUpdateUpload
};
