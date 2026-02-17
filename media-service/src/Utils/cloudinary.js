import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import logger from "./logger.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const UploadMediaToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
            },
            (error, result) =>{
                if(error){
                    logger.warn(`Error uploading media to Cloudinary: ${error}`);
                    reject(error);
                } else{
                    resolve(result);
                }
            }
        )
        uploadStream.end(file.buffer);
    })}

// Function to delete media from Cloudinary by public ID 
export const DeleteMediaCloudinary = async(publicId) =>{
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Media with public ID ${publicId} deleted from Cloudinary`);
        return result;
    } catch (error) {
        logger.error(`Error deleting media from Cloudinary: ${error}`);
        throw error;
    }
}

export default UploadMediaToCloudinary;