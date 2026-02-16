import express from "express";
import {uploadMedia} from "../Controllers/Media.Controllers.js";
import multer from "multer";
import authenticateRequest  from "../Middleware/authMiddleware.js";
// import logger from "../Utils/logger.js";

const router = express.Router();

// Route to handle media upload
router.post(
  "/upload",
  authenticateRequest,
  multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }
  }).single("file"),
  uploadMedia
);

export default router;
