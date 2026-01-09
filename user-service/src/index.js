import dotenv from "dotenv";
dotenv.config()
import ConnectDB from "./Utils/Db.js";
import express from "express";
import logger from "./Utils/logger.js";
import helmet from "helmet";
import cors from "cors";
import {RateLimiterRedis} from "rate-limiter-flexible";
import Redis from "ioredis";
import {rateLimit} from "express-rate-limit"
import {RedisStore} from "rate-limit-redis";
import AuthRoutes from "./Routers/users.routes.js";
import errorHandler from "../Middlewares/errorhandler.js";

const PORT = process.env.PORT;
const app = express();

const redisClient = new Redis(process.env.REDIS_URL);

// Middleware : 
app.use(helmet())
app.use(cors())
app.use(express.json());

app.use((req,res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
})

// Rate Limiter for DDOS Protection:
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    points : 10,
    duration : 1
})

app.use((req,res, next) =>{
    rateLimiter.consume(req.ip).then(() => next()).catch(() => {logger.warn(`Rate Limit exceed for IP : ${req.ip}`)
    res.status(429).json({success : false, message: "Too many request for this IP"});
})});

// Ip based rate limiting for sensitive endpoints 
const sensitiveEndpointsLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false ,
    handler : (req,res) =>{
        logger.warn(`Sensitive Endpoint rate limit exceeded for the ip : ${req.ip}`);
        res.status(429).json({message : "Too many requests", success : false});
    },
    store : new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }) 
})

app.use("/api/auth/register", sensitiveEndpointsLimiter)
app.use("/api/auth", AuthRoutes)
app.use(errorHandler)

// Server Starting : 
app.listen(process.env.PORT || PORT , () => {
    logger.info(`User-Service is running on ${PORT}`);
    ConnectDB();
});

// Unhandled Promise rejection : 
process.on('unhandledRejection',(reason,promise) => {
    logger.error("Unhandled Rejection at :", promise, "Reason :", reason);
})

