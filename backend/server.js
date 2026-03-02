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
.catch((err)=>{console.log("Unable to connect to MongoDB",err)});


/************************** Middleware  Start ******************/
// app.use(express.json());        // then use raw data in postman
app.use(express.urlencoded({ extended: false }));

/************************** Middleware  End ******************/
/************************** Routes  Start ******************/
app.use("/api/users", userRoutes);
/************************** Routes  End ******************/

/************************** Server Start ******************/
app.listen(PORT,()=>{console.log(`Server Started on port ${PORT}`)});
/************************** Server End ******************/  

app.get('/',(req,res)=>{
    return res.end("<html><h1> We will back soon !!!! </h1></html>");
});
app.listen(8000,()=>{console.log("Server Started")});