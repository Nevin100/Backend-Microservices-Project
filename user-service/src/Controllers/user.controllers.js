import logger from "../Utils/logger.js";
import { validateRegistration, validateLogin } from "../Utils/validation.js";
import User from "../models/User.js";
import RefreshToken from "../models/Token.js";
import generateToken from "../Utils/generateToken.js";

// User Registeration :
export const resgisterUser = async (req, res) => {
  logger.info("registration Started :");

  try {
    // 1.) Validate Requested Data :
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error in Registration", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, userName } = req.body;

    // 2.) Check whether the user exists or not :
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      logger.warn("User Already Exists");
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    // 3.) New User creation :
    const user = new User({
      email,
      userName,
      password,
    });

    // 4.) Save the User in Database :
    await user.save();

    logger.warn("User Saved Successfully", user._id);

    // 5.) Generate Refresh and AccessTokens:
    const { accessToken, refreshToken } = await generateToken(user);

    if (accessToken && refreshToken) {
      res.status(201).json({
        success: true,
        message: "User Registeration Successful",
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    logger.error("Error occured in registeration", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Issue in Register" });
  }
};

// User Logging In :
export const loginUser = async (req, res) => {
  logger.info("login Started :");

  try {
    // 1.) Validate Requested Data :
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error in Login", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    // 2.) Check whether the user exists or not :
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      logger.warn("User Not Found");
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // 3.) Match the password :
    const isPasswordMatch = await existingUser.comparepassword(password);
    if (!isPasswordMatch) {
      logger.warn("Invalid Password");
      return res.status(400).json({
        success: false,
        message: "Invalid Password Credential",
      });
    }

    // 4.) Generate Refresh and AccessTokens:
    const { accessToken, refreshToken } = await generateToken(existingUser);

    if (accessToken && refreshToken) {
      res.status(200).json({
        success: true,
        message: "User Login Successful",
        accessToken,
        refreshToken,
        userId: existingUser._id,
      });
    }
  } catch (error) {
    logger.error("Error occured in login", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Issue in Login" });
  }
};

// Refresh token
export const refreshTokenUser = async (req, res) => {
  logger.info("refresh token Started :");

  try {
    // 1.) Validate the Refresh Token :
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // 2.) Check the validity of the Refresh Token :
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // 3.) Generate new Access and Refresh Tokens :
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // 4.) Generate new Access and Refresh Tokens :
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    // 5.) Delete the Old Refresh Token
    await RefreshToken.findByIdAndDelete(storedToken._id);

    // 6.) Send the new tokens in response :
    res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    logger.warn("Error occured in refresh token", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Issue in Refresh Token",
      });
  }
};

// Logout User :
export const logoutUser = async (req, res) => {
  logger.info("Logout Started :");

  try {
    // 1.) Validate the Refresh Token :
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is missing in Logout");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required for Logout",
      });
    }

    // 2.) Delete the Refresh Token from Database :
    await RefreshToken.findOneAndDelete({ token: refreshToken });

    // 3.) Send response to client :
    logger.info("Refresh token deleted successfully in Logout");
    res.status(200).json({
      success: true,
      message: "User Logged Out Successfully",
    });
    
  } catch (error) {
    logger.warn("Error occured in logout", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Issue in Logout" });
  }
};
