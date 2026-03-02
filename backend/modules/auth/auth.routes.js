import express from "express"
import {loginWithEmailPassword} from "./auth.controller.js"
const authRouter  = express.Router();
authRouter.post('/login',loginWithEmailPassword);
export default authRouter;