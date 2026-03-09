import express from "express";
import { getUsers, createUser, updatePassword, deleteUser } from "./user.controller.js";

const router = express.Router();

// router.get('/', getUsers);
router.post('/', createUser);
router.put('/', updatePassword);
router.delete('/', deleteUser);

export default router;