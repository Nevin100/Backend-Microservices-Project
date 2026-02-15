import Post from "../Models/Post.js";
import logger from "../Utils/logger.js";

// Create Post :
export const createPost = async(req,res) =>{
    logger.info('Creation of Post Starting..');
    try {
        const { content, mediaUrls } = req.body;

        if(!content){
            logger.warn('Content is missing in the request body');
            return res.status(400).json({ error: 'Content is required' });
        }

        if(!mediaUrls || !Array.isArray(mediaUrls)){
            logger.warn('Media URLs are missing or not an array in the request body');
            return res.status(400).json({ error: 'Media URLs must be an array' });
        }

        const newPost = new Post({
            user: req.user.user._id,
            content,
            mediaUrls: mediaUrls || []
        })

        const savedPost = await newPost.save();
        logger.info(`Post created successfully with ID: ${savedPost._id}`);
        res.status(201).json({
            message: 'Post created successfully',
            post: savedPost,
            error: false,
            success: true
        });

    } catch (error) {
        logger.error(`Error in createPost: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error in Post Creation' });
    }
}

// Get All Posts : 
export const GetAllPosts = async(req,res) =>{
    logger.info('Fetching All Posts Starting..');
    try {
    } catch (error) {
        logger.error(`Error in GetAllPosts: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error in Fetching All Posts' });
    }   
};

// Get Post By Id :
export const GetPostById = async(req,res) =>{
    logger.info('Fetching Post By Id Starting..');
    try {
        
    } catch (error) {
        logger.error(`Error in GetPostById: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error in Fetching Post By Id' });
    }
};

// Update Post By Id :
export const UpdatePostById = async(req,res) =>{
    logger.info('Updating Post By Id Starting..');
    try {
    } catch (error) {
        logger.error(`Error in UpdatePostById: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error in Updating Post By Id' });
    }
};

// Delete Post By Id :
export const DeletePostById = async(req,res) =>{
    logger.info('Deleting Post By Id Starting..');
    try {
    } catch (error) {
        logger.error(`Error in DeletePostById: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error in Deleting Post By Id' });
    }
};