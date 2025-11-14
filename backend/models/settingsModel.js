import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    siteName: { type: String, default: "Pizza Admin" },
    copyright: { type: String, default: "All rights Reserved@Pizza" },
    seoTitle: { type: String, default: "Pizza Admin Dashboard" },
    seoDescription: { type: String, default: "Pizza Admin Dashboard" },
    seoKeywords: { type: String, default: "Pizza" },
    adminName: { type: String, default: "Daniel" },
    profileImage: { type: String, default: "" }
}, { timestamps: true });

const settingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);
export default settingsModel;

