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
        type: String,
        enum: ["local", "googleOAuth"],
        required: true,
    },
    // Google OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true   // allows multiple nulls
    },
    img: {
        type: String,
        default: ""
    },
    // Local auth fields
    password: {
        type: String,
        select: false  // never returned unless explicitly asked
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
