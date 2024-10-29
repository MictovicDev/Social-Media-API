import express from "express";
import protectRoute  from "../middlewares/protectroute.js";
import {signupUser, loginUser, logoutUser, followUnfollowUser} from "../controllers/userController.js"


const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post('/logout', logoutUser);
router.post('/follow/:id', protectRoute, followUnfollowUser);



export default router;