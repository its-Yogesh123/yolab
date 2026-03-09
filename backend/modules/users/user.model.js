import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    authProvider: {
        type:String,
        enum: ["local", "auth0"],
        required: true,

    },
    auth0Id:{
        type : String,
        unique: true,
        sparse: true 
    },
    password: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
