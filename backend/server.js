import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./modules/users/user.route.js";
const app = express();

/** Environment Variables */
dotenv.config();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
/** Database Connection */

mongoose.connect(MONGO_URI).then(()=>{console.log("Connected to MongoDB")})
.catch((err)=>{console.log("Unable to connect to MongoDB")});


/** Routes */
app.use("/api/users", userRoutes);


app.get('/',(req,res)=>{
    return res.end("<html><h1> We will back soon !!!! </h1></html>");
});
app.listen(8000,()=>{console.log("Server Started")});