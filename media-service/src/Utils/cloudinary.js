import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import logger from "./logger.js";

cloudinary.v2.config({
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

export default UploadMediaToCloudinary;