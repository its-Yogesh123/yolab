import bcrypt from "bcrypt";
import User from "./user.model.js";
export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword ,authProvider: "local"});
        return res.status(201).json({ newUser });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updatePassword = async (req, res) => {
    try {
        console.log("Update Password Request");
        const {email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}



export const deleteUser = async (req, res) => {
    return res.status(200).json({ message: "Service Unavailable" });
};


