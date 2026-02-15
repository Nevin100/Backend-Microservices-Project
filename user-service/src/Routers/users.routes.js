import express from "express";
import {loginUser, logoutUser, refreshTokenUser, resgisterUser} from "../Controllers/user.controllers.js";

const router = express.Router();

// User Service Route Endpoints : 

// 1.) Registeration Route :
router.post("/register", resgisterUser);

// 2.) Login Route :
router.post("/login", loginUser);

// 3.) Refresh Token Route :
router.post("/refresh-token", refreshTokenUser);

// 4.) LogOut Route :
router.post("/logout", logoutUser);

export default router;

