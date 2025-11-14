import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import multer from 'multer';

const settingsRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage });

settingsRouter.get("/", getSettings);
settingsRouter.post("/update", upload.single('logo'), updateSettings);

export default settingsRouter;

