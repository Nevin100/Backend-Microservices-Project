import jwt from "jsonwebtoken";
import logger from "../Utils/logger.js";

// Validate JWT token middleware :
const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 1. Check if token is provided
    if(!token){
        logger.warn('No token provided!! Unauthorized access attempt.');
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized Attempt' });
    }

    // 2. Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            logger.warn('Invalid token provided!! Unauthorized access attempt.');
            return res.status(403).json({ 
                success: false,
                message: 'Forbidden Access!! Invalid Token' });
        }

        // 3. Attach user info to request object and proceed
        req.user = user;
        next();
    });

}

export default validateToken;