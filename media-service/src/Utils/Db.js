import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
    try {
        logger.info('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}
export default connectDB;