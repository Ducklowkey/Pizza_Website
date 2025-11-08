import messageModel from "../models/messageModel.js";

// Add new message from ChatWidget
const addMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        const newMessage = new messageModel({
            name: name || "Anonymous",
            email: email || "",
            phone: phone || "",
            message: message,
        });
        
        await newMessage.save();
        res.json({ success: true, message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error sending message" });
    }
}

// List all messages for Admin
const listMessages = async (req, res) => {
    try {
        const { folder, search } = req.query;
        let query = {};
        
        // Filter by folder
        if (folder === "starred") {
            query.starred = true;
        } else if (folder === "important") {
            query.label = "Work";
        } else if (folder === "spam") {
            query.label = "Spam";
        } else if (folder === "bin") {
            // For bin, we can add a deleted field or filter by read status
            query.read = true;
        } else if (folder === "inbox") {
            query.read = false;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        
        const messages = await messageModel.find(query).sort({ date: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching messages" });
    }
}

// Update message read status
const updateReadStatus = async (req, res) => {
    try {
        const { messageId, read } = req.body;
        await messageModel.findByIdAndUpdate(messageId, { read: read });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
}

// Update message starred status
const updateStarredStatus = async (req, res) => {
    try {
        const { messageId, starred } = req.body;
        await messageModel.findByIdAndUpdate(messageId, { starred: starred });
        res.json({ success: true, message: "Starred status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating starred status" });
    }
}

// Update message label
const updateMessageLabel = async (req, res) => {
    try {
        const { messageId, label } = req.body;
        await messageModel.findByIdAndUpdate(messageId, { label: label });
        res.json({ success: true, message: "Label updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating label" });
    }
}

// Delete message (move to bin)
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        await messageModel.findByIdAndUpdate(messageId, { read: true, label: "Bin" });
        res.json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting message" });
    }
}

// Delete multiple messages (batch delete)
const deleteMultipleMessages = async (req, res) => {
    try {
        const { messageIds } = req.body;
        
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.json({ success: false, message: "No message IDs provided" });
        }
        
        await messageModel.updateMany(
            { _id: { $in: messageIds } },
            { read: true, label: "Bin" }
        );
        
        res.json({ 
            success: true, 
            message: `${messageIds.length} message(s) deleted`,
            deletedCount: messageIds.length
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting messages" });
    }
}

// Get message counts for folders
const getMessageCounts = async (req, res) => {
    try {
        const inboxCount = await messageModel.countDocuments({ read: false });
        const starredCount = await messageModel.countDocuments({ starred: true });
        const sentCount = await messageModel.countDocuments({ replied: true });
        const draftCount = await messageModel.countDocuments({ label: "Draft" });
        const spamCount = await messageModel.countDocuments({ label: "Spam" });
        const importantCount = await messageModel.countDocuments({ label: "Work" });
        const binCount = await messageModel.countDocuments({ label: "Bin" });
        
        res.json({
            success: true,
            data: {
                inbox: inboxCount,
                starred: starredCount,
                sent: sentCount,
                draft: draftCount,
                spam: spamCount,
                important: importantCount,
                bin: binCount
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching counts" });
    }
}

// Get count of unanswered messages
const getUnansweredCount = async (req, res) => {
    try {
        const unansweredCount = await messageModel.countDocuments({ replied: false });
        res.json({
            success: true,
            count: unansweredCount
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching unanswered count" });
    }
}

// Get single message with replies
const getMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await messageModel.findById(messageId);
        
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }
        
        // Mark as read when viewing
        if (!message.read) {
            await messageModel.findByIdAndUpdate(messageId, { read: true });
        }
        
        res.json({ success: true, data: message });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching message" });
    }
}

// Add reply to message (from Admin)
const addReply = async (req, res) => {
    try {
        const { messageId, message: replyMessage } = req.body;
        
        const message = await messageModel.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }
        
        // Add reply
        message.replies.push({
            message: replyMessage,
            sender: "Admin",
            date: new Date()
        });
        
        // Mark as replied
        message.replied = true;
        message.read = true;
        
        await message.save();
        
        res.json({ success: true, message: "Reply sent successfully", data: message });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error sending reply" });
    }
}

// Get user's messages with replies (for frontend)
const getUserMessages = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }
        
        const messages = await messageModel.find({ email: email }).sort({ date: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching messages" });
    }
}

// Get all messages from a specific user (for admin chat view)
const getUserConversation = async (req, res) => {
    try {
        const { email, name } = req.query;
        
        let query = {};
        if (email) {
            query.email = email;
        } else if (name) {
            query.name = name;
        } else {
            return res.json({ success: false, message: "Email or name is required" });
        }
        
        const messages = await messageModel.find(query).sort({ date: 1 }); // Sort by date ascending for conversation view
        res.json({ success: true, data: messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching conversation" });
    }
}

export { 
    addMessage, 
    listMessages, 
    updateReadStatus, 
    updateStarredStatus, 
    updateMessageLabel, 
    deleteMessage,
    deleteMultipleMessages,
    getMessageCounts,
    getMessage,
    addReply,
    getUserMessages,
    getUserConversation,
    getUnansweredCount
};

