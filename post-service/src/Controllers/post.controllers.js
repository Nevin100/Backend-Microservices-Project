import Post from "../Models/Post.js";
import logger from "../Utils/logger.js";
import { publishEvent } from "../Utils/rabbitmq.js";
import {validateCreatePost, validateUpdatePost} from "../Utils/validation.js";
import {redisClient} from "../index.js";

// Utility function to clear cache for posts
async function clearCache(req, input) {
    const keys = await redisClient.keys("posts:*");
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
}

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

        // 5. Clear the cache for posts to ensure the new post is reflected in subsequent fetches
        await clearCache(req, newPost._id.toString());

        // 6. Log the successful creation of the post and send a response
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
        res.status(500).json({ success: false, error: 'Internal Server Error in Fetching All Posts' });
    }   
};

// Get Post By Id :
export const GetPostById = async(req,res) =>{
    logger.info('Fetching Post By Id Starting..');
    try {
        // 1. Extract the post ID from the request parameters
        const postId = req.params.id;

        // 2. Check if the post with the given ID is present in the cache
        const cacheKey = `post:${postId}`;
        const cachePost = await redisClient.get(cacheKey);

        if(cachePost) {
            logger.info(`Post fetched from cache for ID: ${postId}`);
            return res.status(200).json({
                message: 'Post fetched successfully from cache',
                post: JSON.parse(cachePost),
                error: false,
                success: true
            });
        }

        // 3. If not present in cache, fetch from database
        const post = await Post.findById(postId);   

        if(!post) {
            logger.warn(`Post not found with ID: ${postId}`);
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        //4. Store the post in cache for future requests
        await redisClient.setex(cacheKey, 3600, JSON.stringify(post));

        // 5. Log the successful fetching of the post and send a response
        logger.info(`Post fetched successfully for ID: ${postId}`);
        res.status(200).json({
            message: 'Post fetched successfully',
            post,
            error: false,
            success: true
        });

    } catch (error) {
        logger.error(`Error in GetPostById: ${error.message}`);
        res.status(500).json({ success: false, error: 'Internal Server Error in Fetching Post By Id' });
    }
};

// Update Post By Id :
export const UpdatePostById = async(req,res) =>{
    logger.info('Updating Post By Id Starting..');
    try {
        const postId = req.params.id;

        // 1. Validate the request body
        const {error} = validateUpdatePost(req.body);
        if (error) {
              logger.warn("Validation error in Update Post By Id", error.details[0].message);
              return res.status(400).json({
                success: false,
                message: error.details[0].message,
              });
            }
        // 2. Extract content and mediaUrls from the request body
        const { content, mediaUrls } = req.body;

        // 3. Find the post by ID and update it (only if user owns it)
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, user: req.user.userId },
            { content, mediaUrls: mediaUrls || [] },
            { new: true }
        );

        if (!updatedPost) {
            logger.warn(`Post not found or unauthorized update attempt: ${postId}`);
            return res.status(404).json({
                success: false,
                error: 'Post not found or unauthorized'
            });
        }

        // 4. Clear the cache for the updated post and all pagination cache
        const singlePostCacheKey = `post:${postId}`;
        await redisClient.del(singlePostCacheKey);
        await clearCache();

        // 5. Log the successful update of the post and send a response
        logger.info(`Post updated successfully with ID: ${postId}`);
        res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost,
            error: false,
            success: true
        });
    } catch (error) {
        logger.error(`Error in UpdatePostById: ${error.message}`);
        res.status(500).json({ success: false, error: 'Internal Server Error in Updating Post By Id' });
    }
};

// Delete Post By Id :
export const DeletePostById = async (req, res) => {
    logger.info('Deleting Post By Id Starting..');

    try {
        const postId = req.params.id;

        // 1. Validate Post ID
        if (!postId) {
            logger.warn('Post ID is missing in the request parameters');
            return res.status(400).json({
                success: false,
                error: 'Post ID is required for deletion'
            });
        }

        // 2. Delete from Database (only if user owns it)
        const deletedPost = await Post.findOneAndDelete({
            _id: postId,
            user: req.user.userId
        });

        if (!deletedPost) {
            logger.warn(`Post not found or unauthorized deletion attempt: ${postId}`);
            return res.status(404).json({
                success: false,
                error: 'Post not found or unauthorized'
            });
        }

        // Publish an event to RabbitMQ for post deletion (if needed)
        await publishEvent('post-deleted', {
            postId: deletedPost._id,
            userId: req.user.userId,
            mediaUrls: deletedPost.mediaUrls
        })

        // 3. Delete Single Post Cache
        const singlePostCacheKey = `post:${postId}`;
        await redisClient.del(singlePostCacheKey);

        // 4. Delete All Pagination Cache
        await clearCache();

        logger.info(`Post deleted successfully with ID: ${postId}`);

        return res.status(200).json({
            success: true,
            error: false,
            message: 'Post deleted successfully',
            post: deletedPost
        });

    } catch (error) {
        logger.error(`Error in DeletePostById: ${error.message}`);

        return res.status(500).json({
            success: false,
            error: 'Internal Server Error in Deleting Post'
        });
    }
};