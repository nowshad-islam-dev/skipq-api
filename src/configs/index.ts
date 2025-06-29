import 'dotenv/config';

const port = process.env.PORT || 3000;
const cloudinary_cloud_name = process.env.CLOUDINARY_CLOUD_NAME!;
const cloudinary_api_key = process.env.CLOUDINARY_API_KEY!;
const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET!;

export {
  port,
  cloudinary_cloud_name,
  cloudinary_api_key,
  cloudinary_api_secret,
};
