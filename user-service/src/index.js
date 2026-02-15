// -> Entry point of User Service (Microservice)
// Responsibilities:
// Load environment variables
// Initialize Express server
// Apply security & global middlewares
// Configure Redis-based rate limiting
// Register routes
// Handle global errors
// Start server & connect database

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Database connection utility
import ConnectDB from "./Utils/Db.js";

// Core framework
import express from "express";

// Centralized logger (Winston)
import logger from "./Utils/logger.js";

// Security middlewares
import helmet from "helmet"; // Protects HTTP headers
import cors from "cors";     // Enables Cross-Origin requests

// Redis & Rate Limiting libraries
// Advanced rate limiter :
import { RateLimiterRedis } from "rate-limiter-flexible"; 

// Redis client
import Redis from "ioredis";                              

// Express rate limiting
import { rateLimit } from "express-rate-limit";

// Redis-backed store
import { RedisStore } from "rate-limit-redis";            

// Application routes
import AuthRoutes from "./Routers/users.routes.js";

// Centralized error handling middleware
import errorHandler from "./Middlewares/errorhandler.js";

// Application port
const PORT = process.env.PORT;

// Initialize express app
const app = express();

// Redis Client Initialization 
// Used for:
// Rate limiting
// Distributed state (microservices friendly)
 
const redisClient = new Redis(process.env.REDIS_URL);

//GLOBAL MIDDLEWARES
 
// Adds security-related HTTP headers
app.use(helmet());

// Enables CORS for frontend-backend communication
app.use(cors());

// Parses incoming JSON request bodies
app.use(express.json());

// Request Logging Middleware
// Logs every incoming request for debugging and monitoring
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    next();
});

//GLOBAL RATE LIMITER (DDOS PROTECTION)
//Limits number of requests per IP
const rateLimiter = new RateLimiterRedis({
    // Redis as storage
    storeClient: redisClient, 
    
    // Redis key prefix
    keyPrefix: "middleware",  
    
    // 10 requests
    points: 10,               
    
    // per 1 second
    duration: 1               
});

// Apply rate limiter globally
// Blocks IP if request limit is exceeded
app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: "Too many requests from this IP"
            });
        });
});

// SENSITIVE ENDPOINT RATE LIMITER (Login / Register) 
// Extra protection against:
// Brute force attacks
// Credential stuffing
const sensitiveEndpointsLimiter = rateLimit({
     // 15 minutes window
    windowMs: 15 * 60 * 1000,

    // Max 50 requests per IP
    max: 50,                 

    // Return rate limit info in headers
    standardHeaders: true,  
    
    // Disable legacy headers
    // Legacy Headers are basically the old X-RateLimit-* headers.
    legacyHeaders: false,   

    // Custom handler when limit is exceeded
    handler: (req, res) => {
        logger.warn(
            `Sensitive endpoint rate limit exceeded for IP: ${req.ip}`
        );
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    },

    // Redis-backed store (important for microservices)
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
});

// Routes :

// Apply stricter rate limit only on registration endpoint
app.use("/api/auth/register", sensitiveEndpointsLimiter);

// Authentication routes
app.use("/api/auth", AuthRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Server Initialization : 
app.listen(process.env.PORT || PORT, () => {
    logger.info(`User-Service is running on port ${PORT}`);
    // Connect to database after server starts
    ConnectDB(); 
});

//UNHANDLED PROMISE REJECTION HANDLER
//Prevents silent crashes in production
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise);
    logger.error("Reason:", reason);
});
