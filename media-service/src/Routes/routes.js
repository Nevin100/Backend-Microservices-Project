import express from "express";
import {uploadMedia} from "../Controllers/Media.Controllers.js";
import multer from "multer";
import { authenticateRequest } from "../Middleware/authMiddleware.js";
import logger from "../Utils/logger.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024 
    }  
}).single('file');

// Route to handle media upload
router.post('/upload', authenticateRequest,(req,res, next) =>{
    upload(req,res, (err) => {
        if(err instanceof multer.MulterError){
            logger.warn(`Multer error during file upload: ${err.message}`);
            return res.status(400).json({ 
                success: false, 
                error: err.message,
            stack : err.stack 
        });
    } 
    else if(err){
        logger.error(`Unexpected error during file upload: ${err.message}`);
        return res.status(500).json({ 
            success: false, 
            error: 'An unexpected error occurred during file upload',
            stack : err.stack 
        });
    } else if(!req.file){ 
        logger.warn("No file was uploaded");
        return res.status(400).json({ 
            success: false, 
            error: "No file was uploaded"
        });
    }
});
}, uploadMedia);

export default router;
