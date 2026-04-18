const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

async function uploadFile(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder: 'get-your-bot/documents',
  });
  return result.secure_url;
}

module.exports = { uploadFile, cloudinary };
