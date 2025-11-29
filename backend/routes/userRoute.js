import express from 'express';
import { loginUser,registerUser, getAllUsers, getUserData, addCustomer, updateUserProfile } from '../controllers/userController.js';
import multer from 'multer';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);
userRouter.get("/list",getAllUsers);
userRouter.post("/userdata",getUserData);
userRouter.post("/add",addCustomer);
userRouter.post("/update", authMiddleware, upload.single('image'), updateUserProfile);

export default userRouter;