import logger from "../Utils/logger.js";

const authenticateRequest = (req,res,next) =>{
    const userId = req.headers['x-user-id'];

    if(!userId){
        logger.warn('Authentication failed: Missing x-user-id header');
        return res.status(401).json({ 
            success: false,
            error: 'Unauthorized: Missing user ID' 
        });
    }

    req.user = {userId};
    next();
}

export default authenticateRequest;