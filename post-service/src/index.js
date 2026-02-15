import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import {Redis} from "ioredis";
import postRoutes from "./Routes/routes.js";
import errorHandler from "./Middleware/errorhandler.js";
import logger from "./Utils/logger.js";
import connectDB from "./Utils/DB.js";
import {RateLimiterRedis} from "rate-limiter-flexible";
import {rateLimit} from "express-rate-limit";
import {RedisStore} from "rate-limit-redis";

const app = express();
const PORT = process.env.PORT;
const redisClient = new Redis(process.env.REDIS_URL);

// Middleware :
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next) =>{
    logger.info(`Incoming Request: ${req.method} of ${req.url}`);
    logger.info(`Request Body, ${req.body}`);
    next();
})

// Global Rate Limiting Middleware using Redis :
const ratelimiterPost = new RateLimiterRedis({
    storeClient : redisClient,
    points : 100, 
    duration : 60, 
});

app.use((req, res, next) => {
    ratelimiterPost.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ 
                success:false,
                message: "Too Many Requests from this IP" });
        });
    }
);

// Sensitive Rate Limiter 
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10, 
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: (req, res) => {
        logger.warn(
            `Sensitive endpoint rate limit exceeded for IP: ${req.ip}`
        );
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

// app.use("/api/posts/create-post", sensitiveEndpointsLimiter);
app.use("/api/posts",(req,res, next) =>{
    req.redisClient = redisClient;
    next();
}, postRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Post Service is running on port ${PORT}`);
    connectDB();
});