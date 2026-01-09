import mongoose from "mongoose"
import logger from "../Utils/logger.js";

const ConnectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        logger.info("Connected to MongoDB Database")
    } catch (error) {
        logger.error("Connection Error in mongodb", error)
        process.exit(1);    
    }
}

export default ConnectDB;