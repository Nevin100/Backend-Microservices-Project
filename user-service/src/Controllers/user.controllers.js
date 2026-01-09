import logger from "../Utils/logger.js";
import {validateRegistration} from "../Utils/validation.js";
import User from "../models/User.js";

// User Registeration : 
export const resgisterUser = async(req,res) =>{
    logger.info('registration Started :')
    try {
        // 1.) Validate Requested Data :
        const {error} = validateRegistration(req.body);
        if(error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const {email, password, userName} = req.body;
        
        // 2.) Check whether the user exists or not :
        const user = await User.findOne({$or : [{email}, {userName}]});
        if (user) {
            logger.warn("User Already Exists");
            return res.status(400).json({
                success: false,
                message: "User lready Exists"
            })
        }
         
        // 3.) New User creation :
        user = new User({
            email,
            userName,
            password
        })

        // 4.) Save the User in Database :
        await user.save()

        logger.warn("User Saved Successfully", user._id);

    } catch (error) {
        console.log(error);
        res.status(500).json({"The error : ":  error, "error": true})
    }
} 


// User Logging In : 



// refresh token