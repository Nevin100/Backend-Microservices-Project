import express from "express";
import {loginUser, logoutUser, resgisterUser} from "../Controllers/user.controllers.js";

const router = express.Router();

// User Service Route Endpoints : 

// 1.) Registeration Route :
router.post("/register", resgisterUser);

// 2.) Login Route :
router.post("/login", loginUser);

// 3.) LogOut Route :
router.post("/logout", logoutUser);

export default router;

