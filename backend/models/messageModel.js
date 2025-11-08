import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    message: { type: String, required: true },
    sender: { type: String, default: "Admin" }, // Admin or User
    date: { type: Date, default: () => Date.now() } // Use function to get current time
}, { _id: true });

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
    date: { type: Date, default: () => Date.now() }, // Use function to get current time
    label: { type: String, default: "Primary" }, // Primary, Work, Friends, Social
    starred: { type: Boolean, default: false },
    replies: { type: [replySchema], default: [] } // Array of replies
})

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);
export default messageModel;

