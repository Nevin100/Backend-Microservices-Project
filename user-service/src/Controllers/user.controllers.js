import logger from "../Utils/logger.js";
import {validateRegistration, validateLogin} from "../Utils/validation.js";
import User from "../models/User.js";
import generateToken from "../Utils/generateToken.js"

// User Registeration : 
export const resgisterUser = async(req,res) =>{
    
    logger.info('registration Started :')
    
    try {
        // 1.) Validate Requested Data :
        const {error} = validateRegistration(req.body);
        if(error) {
            logger.warn("Validation error in Registration", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const {email, password, userName} = req.body;
        
        // 2.) Check whether the user exists or not :
        const existingUser = await User.findOne({$or : [{email}, {userName}]});
        if (existingUser) {
            logger.warn("User Already Exists");
            return res.status(400).json({
                success: false,
                message: "User already Exists"
            })
        }
         
        // 3.) New User creation :
        const user = new User({
            email,
            userName,
            password
        })

        // 4.) Save the User in Database :
        await user.save()

        logger.warn("User Saved Successfully", user._id);

        // 5.) Generate Refresh and AccessTokens: 
        const {accessToken, refreshToken} = await generateToken(user)

        if(accessToken && refreshToken){
            res.status(201).json({
                success: true,
                message : "User Registeration Successful",
                accessToken,
                refreshToken 
            });
        }
    } catch (error) {
        logger.error("Error occured in registeration", error)
        res.status(500).json({success: false, message: "Internal Server Issue in Register"});
    }
} 

// User Logging In : 
export const loginUser = async(req,res) =>{
    logger.info('login Started :')

    try{    
        // 1.) Validate Requested Data :
        const {error} = validateLogin(req.body);
        if(error) {
            logger.warn("Validation error in Login", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        // 2.) Check whether the user exists or not :
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            logger.warn("User Not Found");
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        // 3.) Match the password :
        const isPasswordMatch = await existingUser.comparepassword(password);
        if(!isPasswordMatch){
            logger.warn("Invalid Password");
            return res.status(400).json({
                success: false,
                message: "Invalid Password Credential"
            })
        }

        // 4.) Generate Refresh and AccessTokens:
        const {accessToken, refreshToken} = await generateToken(existingUser)

        if(accessToken && refreshToken){
            res.status(200).json({
                success: true,
                message : "User Login Successful",
                accessToken,
                refreshToken,
                userId : existingUser._id 
            });
        }

    }catch(error){
        logger.error("Error occured in login", error)
        res.status(500).json({success: false, message: "Internal Server Issue in Login"});
    }
}


// refresh token