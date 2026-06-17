const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'mathapp/misc';
    let resourceType = 'auto';
    if (file.mimetype.startsWith('image/')) folder = 'mathapp/images';
    else if (file.mimetype === 'application/pdf') folder = 'mathapp/pdfs';
    else if (file.mimetype.includes('video')) { folder = 'mathapp/videos'; resourceType = 'video'; }
    else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) folder = 'mathapp/presentations';
    return { folder, resource_type: resourceType, allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'ppt', 'pptx', 'mp4', 'webm'] };
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

module.exports = { upload, cloudinary };
