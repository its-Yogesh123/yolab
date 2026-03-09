import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./modules/users/user.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import srv001Routes from "./modules/short-url/srv001.routes.js"
import {isLoggedIn} from "./modules/auth/middlewares/authenticate.js"
import {isAuthorize} from "./modules/auth/middlewares/authorize.js"
const app = express();

/** Environment Variables */
dotenv.config();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
/** Database Connection */

mongoose.connect(MONGO_URI).then(()=>{console.log("Connected to MongoDB")})
.catch((err)=>{console.log("Unable to connect to MongoDB",err)});


/************************** Middleware  Start ******************/
// app.use(express.json());        // then use raw data in postman
app.use(express.urlencoded({ extended: false }));
/************************** Middleware  End ******************/
/************************** Routes  Start ******************/
app.use("/api/users", userRoutes);
app.use("/auth",authRoutes);
app.use("/srv001",isLoggedIn,srv001Routes);
/************************** Routes  End ******************/

/************************** Server Start ******************/
app.listen(PORT,()=>{console.log(`Server Started on port ${PORT}`)});
/************************** Server End ******************/  

app.get('/',(req,res)=>{
    return res.end("<html><h1> We will back soon !!!! </h1></html>");
});

app.get("/admin",isLoggedIn,(req,res)=>{
    return res.status(200).json({'message':"Success"});
});
app.get("/dash",isLoggedIn,isAuthorize("admin"),(req,res)=>{
    return res.status(200).json({'message':"Success"});
});
app.listen(8000,()=>{console.log("Server Started")});