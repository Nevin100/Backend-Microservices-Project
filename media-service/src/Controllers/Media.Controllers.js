import UploadMediaToCloudinary from "../Utils/cloudinary.js";
import logger from "../Utils/logger.js";
import Media from "../Models/Media.js";

// Controller to handle media upload
export const uploadMedia = async (req, res) => {
    logger.info('Received request to upload media');
    try {
        // 1. Validate the file
        if(!req.file){
            logger.warn('No file provided in the request from media controller');
            return res.status(400).json({ success: false, error: 'No file provided' });
        }

        // 2. Extract file details
        const {originalname, mimetype, buffer} = req.file;
        const userID = req.user.userId;

        // 3. Log file details
        logger.info("File details - Name: " + originalname + ", Type: " + mimetype + ", Size: " + buffer.length);

        // 4. Upload to Cloudinary
        logger.info(`Uploading media to Cloudinary`);
        const result = await UploadMediaToCloudinary(req.file);

        // 5. Log the result and save media details to the database
        logger.info(`Media uploaded successfully: ${result.public_id}`);
        const newlyCreatedMedia = new Media({
            publicId: result.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: result.secure_url,
            userId: userID
        });

        await newlyCreatedMedia.save();

        // 6. Respond with success and media details
        logger.info(`Media details saved to database with ID: ${newlyCreatedMedia._id}`);
        res.status(200).json({ 
            success: true, 
            mediaId: newlyCreatedMedia._id, 
            url: newlyCreatedMedia.url });

    } catch (error) {
        logger.error(`Error uploading media in Media Service ${error}`);
        res.status(500).json({ success: false, error: 'Failed to upload media' });
    }
}