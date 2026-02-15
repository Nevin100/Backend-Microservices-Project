import mongoose from "mongoose";
import logger from "../Utils/logger.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('Connected to MongoDB successfully from post-service');
    } catch (error) {
        logger.error(`Error connecting to MongoDB from post-service: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;