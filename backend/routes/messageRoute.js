import express from 'express';
import { 
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
} from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post("/add", addMessage);
messageRouter.get("/list", listMessages);
messageRouter.get("/user/list", getUserMessages);
messageRouter.get("/counts", getMessageCounts);
messageRouter.get("/unanswered/count", getUnansweredCount);
messageRouter.post("/updateread", updateReadStatus);
messageRouter.post("/updatestarred", updateStarredStatus);
messageRouter.post("/updatelabel", updateMessageLabel);
messageRouter.post("/delete", deleteMessage);
messageRouter.post("/delete/multiple", deleteMultipleMessages);
messageRouter.post("/reply", addReply);
messageRouter.get("/user/conversation", getUserConversation);
messageRouter.get("/:messageId", getMessage); // This should be last to avoid conflicts

export default messageRouter;

