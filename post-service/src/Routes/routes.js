import express from "express";
import {createPost, GetAllPosts, GetPostById, UpdatePostById, DeletePostById} from "../Controllers/post.controllers.js";
import authenticateRequest from "../Middleware/authMiddleware.js";

const router = express.Router();

// 1.) Create Post :
router.post('/create-post', authenticateRequest, createPost);

// 2.) Get All Posts :
router.get('/all-posts', authenticateRequest, GetAllPosts);

// 3.) Get Post By Id :
router.get('/:id', authenticateRequest, GetPostById);

// 4.) Update Post By Id :
router.put('/:id', authenticateRequest, UpdatePostById);

// 5.) Delete Post By Id :
router.delete('/:id', authenticateRequest, DeletePostById);


export default router;

