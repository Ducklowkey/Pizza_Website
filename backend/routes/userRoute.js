import express from 'express';
import { loginUser,registerUser, getAllUsers, getUserData, addCustomer } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/list",getAllUsers);
userRouter.post("/userdata",getUserData);
userRouter.post("/add",addCustomer);

export default userRouter;