import settingsModel from "../models/settingsModel.js";
import fs from 'fs';

// Get settings
const getSettings = async (req, res) => {
    try {
        let settings = await settingsModel.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new settingsModel();
            await settings.save();
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching settings" });
    }
}

// Update settings
const updateSettings = async (req, res) => {
    try {
        let settings = await settingsModel.findOne();
        
        if (!settings) {
            settings = new settingsModel();
        }

        // Update text fields
        if (req.body.siteName) settings.siteName = req.body.siteName;
        if (req.body.copyright) settings.copyright = req.body.copyright;
        if (req.body.seoTitle) settings.seoTitle = req.body.seoTitle;
        if (req.body.seoDescription) settings.seoDescription = req.body.seoDescription;
        if (req.body.seoKeywords) settings.seoKeywords = req.body.seoKeywords;
        if (req.body.adminName) settings.adminName = req.body.adminName;

        // Handle logo/profile image upload
        if (req.file) {
            // Delete old image if exists
            if (settings.profileImage) {
                fs.unlink(`uploads/${settings.profileImage}`, () => { });
            }
            settings.profileImage = req.file.filename;
        }

        await settings.save();
        res.json({ success: true, message: "Settings updated successfully", data: settings });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating settings" });
    }
}

export { getSettings, updateSettings }

