import cloudinary from '../configs/cloudinary';

const uploadToCloudinary = async (buffer: Buffer) => {
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'profile_pictures' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    stream.end(buffer);
  });
};

export default uploadToCloudinary;
