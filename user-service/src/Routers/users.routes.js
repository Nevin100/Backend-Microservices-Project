import express from "express";
import {resgisterUser} from "../Controllers/user.controllers.js";

const router = express.Router();

// User Service Route Endpoints : 

// 1.) Registeration Route :
router.post("/register", resgisterUser);

// 2.) Login Route :


// 3.) LogOut Route :


export default router;

