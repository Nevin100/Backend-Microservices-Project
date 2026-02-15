import Post from "../Models/Post.js";
import logger from "../Utils/logger.js";
import {validateCreatePost} from "../Utils/validation.js";
import {redisClient} from "../index.js";

// Create Post :
export const createPost = async(req,res) =>{
    logger.info('Creation of Post Starting..');
    try {
        // 1. Validate the request body
        const {error} = validateCreatePost(req.body);
        if (error) {
              logger.warn("Validation error in Create Post", error.details[0].message);
              return res.status(400).json({
                success: false,
                message: error.details[0].message,
              });
            }
        // 2. Extract content and mediaUrls from the request body
        const { content, mediaUrls } = req.body;
        
        if(!content){
            logger.warn('Content is missing in the request body');
            return res.status(400).json({ error: 'Content is required' });
        }

        // 4. Create a new post document and save it to the database
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaUrls: mediaUrls || []
        })

        const savedPost = await newPost.save();

        // 5. Log the successful creation of the post and send a response
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
        // 1. Implement pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        // 2. Check if the posts for the requested page and limit are present in the cache
        const cacheKey = `posts:${page}:${limit}`;
        const cachePosts = await redisClient.get(cacheKey);
        if (cachePosts) {
            logger.info(`Posts fetched from cache for page: ${page} and limit: ${limit}`);
            return res.status(200).json({
                message: 'Posts fetched successfully from cache',
                posts: JSON.parse(cachePosts),
                error: false,
                success: true
            });
        }

        // 3. If not present in cache, fetch from database (skip means how many documents to skip, limit means how many documents to return)
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit)

        // Get total count of posts for pagination metadata
        const totalPosts = await Post.countDocuments();

        // Prepare the result with pagination metadata
        const result = {
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts
        }

        // 4. Store the fetched posts in the cache with an expiration time of 1 hour (3600 seconds)
        await redisClient.setex(cacheKey, 3600, JSON.stringify(result));
        logger.info(`Posts fetched from database and stored in cache for page: ${page} and limit: ${limit}`);

        // 5. Log the successful fetching of posts and send a response
        logger.info(`Posts fetched successfully for page: ${page} and limit: ${limit}`);
        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: result,
            error: false,
            success: true
        });

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