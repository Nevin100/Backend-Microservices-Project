import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/Token.js"

// Generating the token :
const generateToken = async(user) => {
    try {
        const accessToken = jwt.sign({
            userId : user._id,
            userName : user.userName
        }, process.env.JWT_SECRET, {
            expiresIn : "5m"
        })
        
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        
        //  refresh token string in 7 days
        expiresAt.setDate(expiresAt.getDate() + 7)    

        await RefreshToken.create(
            {
                token : refreshToken,
                user : user._id,
                expiresAt
            }
        )   

        return { accessToken, refreshToken}

    } catch (error) {
        throw new Error("Token generation failed");
    }
}

export default generateToken