import cloudinary from '../configs/cloudinary';

// For uploading profile picture of an user and -->
// Uploading multiple photos of a service

type Folder = 'profile_pictures' | 'services_pictures';

const uploadToCloudinary = async (buffer: Buffer, folder: Folder) => {
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    stream.end(buffer);
  });
};

export default uploadToCloudinary;
