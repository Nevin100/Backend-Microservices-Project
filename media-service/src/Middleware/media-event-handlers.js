import logger from "../Utils/logger.js";
import Media from "../Models/Media.js";
import { DeleteMediaCloudinary } from "../Utils/cloudinary.js";

const handlePostsDeleted = async (event) =>{
    const { postId, mediaUrls } = event;
    logger.info(`Handling post deleted event for post ID: ${postId}`);
    logger.info(`Media URLs to be deleted: ${mediaUrls}`);
    try {
        const mediaToDeleted = await Media.find({ _id: { $in: mediaUrls } });
        for (const media of mediaToDeleted) {
            await DeleteMediaCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);

            logger.info(`Deleted media with ID: ${media._id} from database and Cloudinary`);
        }

        logger.info(`Successfully handled post deleted event`);
    } catch (error) {
        logger.error('Error handling post deleted event', { error });
        throw error;
    }

}

export default handlePostsDeleted;