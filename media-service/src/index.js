import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import logger from "./Utils/logger.js";
import MediaRoutes from "./Routes/routes.js";
import errorHandler from "./Middleware/errorHandler.js";
import connectDB from "./Utils/Db.js";

const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware for logging requests
app.use((req, res, next) =>{
    logger.info(`Received ${req.method} request for ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})

// Routes setup :
app.use("/api/media", MediaRoutes);

// Global error handling middleware
app.use(errorHandler);

// Starting the server :
app.listen(PORT, () =>{
    logger.info(`Media Service is running on port ${PORT}`);
    connectDB();
})


