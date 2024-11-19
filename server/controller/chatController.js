import { Chat, Message } from '../models/ChatModel.js';
import connectDB from '../config/db.js';
import dotenv from "dotenv";
dotenv.config();


console.log(process.env.MONGO_URI);
connectDB();

async function createChat(privateID) {
    try {
        const chat = new Chat({ privateID });
        await chat.save();
        console.log("Chat created:", chat);
        return chat;
    } catch (error) {
        console.error("Error creating chat:", error);
    }
}


async function addMessageToChat(privateID, content, sentBy, replyTo = null) {
    try {
        const chat = await Chat.findOne({ privateID });
        if (!chat) throw new Error("Chat not found");

        // Create a new Message document
        const newMessage = new Message({
            content,
            sentBy,
            replyTo
        });

        // Save the message to generate an ObjectId for `replyTo` if needed
        await newMessage.save();

        // Add the message to the chat's messages array by its ID
        chat.messages.push(newMessage);
        await chat.save();

        console.log("Message added to chat:", newMessage);
        return newMessage;
    } catch (error) {
        console.error("Error adding message:", error);
    }
}

// Function to get recent messages with pagination
async function getRecentMessages(privateID, limit, lastMessageTimestamp = null) {
    try {
        const chat = await Chat.findOne({ privateID });
        if (!chat) throw new Error("Chat not found");

        const recentMessages = await chat.getRecentMessages(limit, lastMessageTimestamp);
        console.log("Recent messages:", recentMessages);
        return recentMessages;
    } catch (error) {
        console.error("Error retrieving recent messages:", error);
    }
}


// Usage
//createChat("uniquePrivateID1234");

//addMessageToChat("uniquePrivateID1234", "Hello, how can I help you?", "bot");
//addMessageToChat("uniquePrivateID1234", "I need assistance with my account", "user");

// Usage
getRecentMessages("uniquePrivateID1234", 5);
