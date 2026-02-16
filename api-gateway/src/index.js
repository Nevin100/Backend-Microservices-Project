// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Import core dependencies
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";

// Import custom logger from user service
import logger from "./Utils/logger.js";

// Import Redis store adapter for express-rate-limit
import { RedisStore } from "rate-limit-redis";

// Import rate limiting middleware
import { rateLimit } from "express-rate-limit";

// Import proxy middleware to forward requests to microservices
import proxy from "express-http-proxy";

// Import global error handling middleware
import errorHandler from "./Middleware/errorHandler.js";

// Import the Validation middleware
import validateToken from "./Middleware/authMiddleware.js";

// Initialize Express application
const app = express();

// Get PORT from environment variables
const PORT = process.env.PORT;

// Create Redis client using REDIS_URL
const redisClient = new Redis(process.env.REDIS_URL);

// Enable security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());


// Configure rate limiting middleware
const rateLimiter = rateLimit({

    // Time window of 15 minutes
    windowMs: 15 * 60 * 1000,

    // Maximum 50 requests allowed per IP in window
    max: 50,

    // Send standard rate limit headers
    standardHeaders: true,

    // Disable legacy headers
    legacyHeaders: false,

    // Custom handler when limit is exceeded
    handler: (req, res) => {

        // Log warning when rate limit exceeded
        logger.warn(
            `Sensitive endpoint rate limit exceeded for IP: ${req.ip}`
        );

        // Send 429 Too Many Requests response
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    },

    // Use Redis as storage backend for distributed rate limiting
    store: new RedisStore({

        // Use Redis client's call method for executing commands
        sendCommand: (...args) => redisClient.call(...args)
    })
});

// Apply rate limiter globally
app.use(rateLimiter);


// Log every incoming request
app.use((req, res, next) => {

    // Log request method, URL, and IP address
    logger.info(
        `Received request: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
    );

    // Move to next middleware
    next();
});


// Define proxy configuration options
const proxyOptions = {

    // Modify request path before forwarding to user service
    proxyReqPathResolver: (req) => {

        // Replace '/v1' with '/api'
        return req.originalUrl.replace(/^\/v1/, "/api");
    },

    // Handle errors occurring during proxy forwarding
    proxyErrorHandler: (err, res) => {

        // Log proxy error
        logger.error(`Error proxying request: ${err.message}`);

        // Send 500 error response
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
            error: err.message
        });
    }
};


// Forward all '/v1/auth' requests to USER_SERVICE_URL
app.use(
    "/v1/auth",
    proxy(process.env.USER_SERVICE_URL, {

        // Spread base proxy options
        ...proxyOptions,

        // Modify outgoing proxy request headers
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {

            // Ensure content type is JSON
            proxyReqOpts.headers["Content-Type"] = "application/json";

            return proxyReqOpts;
        },

        // Intercept and log response from user service
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {

            // Log response details
            logger.info(
                `Received response from user service for ${userReq.method} ${userReq.originalUrl} with status ${proxyRes.statusCode}`
            );

            // Return original response data
            return proxyResData;
        }
    })
);

// Forward all '/v1/posts' requests to POST_SERVICE_URL
app.use(
    "/v1/posts",
    validateToken,
    proxy(process.env.POST_SERVICE_URL, {

        // Spread base proxy options
        ...proxyOptions,

        // Modify outgoing proxy request headers
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {

            // Ensure content type is JSON
            proxyReqOpts.headers["Content-Type"] = "application/json";
            
            // Forward Authorization header from client to post service
            proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
            return proxyReqOpts;
        },

        // Intercept and log response from post service
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {

            // Log response details
            logger.info(
                `Received response from post service for ${userReq.method} ${userReq.originalUrl} with status ${proxyRes.statusCode}`
            );

            // Return original response data
            return proxyResData;
        }
    })
);

// Forward all "/v1/media" requests to MEDIA_SERVICE_URL
app.use(
    "/v1/media",
    validateToken,
    proxy(process.env.MEDIA_SERVICE_URL, { 
        // Spread base proxy options
        ...proxyOptions,
        // Modify outgoing proxy request headers
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            // Forward Authorization header from client to media service
            proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
            // If content type is multipart/form-data, change it to application/json for media service
            if(srcReq.headers['content-type'].startsWith('multipart/form-data')) {
                proxyReqOpts.headers['Content-Type'] = "application/json";
            }
            return proxyReqOpts;
        },

        // Intercept and log response from media service
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {

            // Log response details
            logger.info(
                `Received response from media service for ${userReq.method} ${userReq.originalUrl} with status ${proxyRes.statusCode}`
            );

            // Return original response data
            return proxyResData;
        }
    })
);

// Apply global error handling middleware
app.use(errorHandler);


// Start API Gateway server
app.listen(PORT, () => {

    // Log server startup information
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`User Service is running on ${process.env.USER_SERVICE_URL}`);
    logger.info(`Post Service is running on ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service is running on ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Redis is running on ${process.env.REDIS_URL}`);
});
