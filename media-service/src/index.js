import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./Utils/logger.js";
import MediaRoutes from "./Routes/routes.js";
import errorHandler from "./Middleware/errorHandler.js";
import connectDB from "./Utils/Db.js";
import { connectRabbitMQ, consumeEvents } from "./Utils/rabbitmq.js";
import handlePostsDeleted from "./Middleware/media-event-handlers.js";

const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(helmet());
app.use(cors());

// Middleware for logging requests
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  logger.info(`Request body: ${req.body}`);
  next();
});

// Routes setup :
app.use("/api/media", MediaRoutes);

// Global error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to RabbitMQ before starting the server
    await connectRabbitMQ();

    await consumeEvents('post-deleted', handlePostsDeleted);
    // Starting the server :
    app.listen(PORT, () => {
      logger.info(`Media Service is running on port ${PORT}`);
      connectDB();
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

startServer();
