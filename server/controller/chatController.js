import { Chat, Message } from '../models/ChatModel.js';
import { sendMessage } from "../services/openAIservice.js";

export async function handleChat(privateID, userMessage, maxTokens = 150, model = "gpt-3.5-turbo") {
  try {
    // Validate privateID
    if (!privateID) {
      throw new Error('Private ID is required');
    }

    // Find the chat session based on the privateID
    let chatSession = await Chat.findOne({ privateID });

    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    // Create and save user message
    const userMessageDoc = new Message({
      content: userMessage,
      sentBy: 'user'
    });

    chatSession.messages.push(userMessageDoc);

    // Get OpenAI response
    const response = await sendMessage(`${chatSession.personality}`, userMessage);

    // Create and save bot message
    const botMessageDoc = new Message({
      content: response,
      sentBy: 'bot'
    });

    chatSession.messages.push(botMessageDoc);

    // Save the updated chat session
    await chatSession.save();

    return {
      status: 'success',
      message: response,
    };

  } catch (error) {
    console.error('Chat handling error:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}


export async function createChatWithPersonality(privateID, personality) {
  try {
    var control = false;
    // Validate privateID
    if (!privateID) {
      throw new Error('Private ID is required');
    }

    // Check if a chat session with the given privateID already exists
    let chatSession = await Chat.findOne({ privateID });

    if (chatSession) {
      throw new Error('Chat session with this Private ID already exists');
    }

    // Calculate the ratio of `control` being true or false
    const totalChats = await Chat.countDocuments({});
    const controlTrueCount = await Chat.countDocuments({ control: true });
    const controlFalseCount = totalChats - controlTrueCount;

    const controlTrueRatio = totalChats > 0 ? (controlTrueCount / totalChats).toFixed(2) : 0;

    // reset personality if ratio is under half
    if (controlTrueRatio < .5){
      console.log("creating control personality");
      personality = "You are a helpful and knowledgeable AI assistant. You respond to questions and instructions with accurate, concise, and relevant information. If clarification is needed, you ask questions to better understand the user's request. Maintain a polite and professional tone at all times. You can only respond in ASCII text with no markdown. Your directive is to ONLY talk or teach GitHub and nothing else, otherwise politely decline the question."
      control = true;
    }

    // Create a new chat session with the provided personality
    chatSession = new Chat({
      privateID,
      personality,
      control,
      messages: [] // Initialize an empty messages array
    });

    // Save the new chat session
    await chatSession.save();

    return {
      status: 'success',
      message: 'Chat created successfully',
      chatSession
    };

  } catch (error) {
    console.error('Error creating chat with personality:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}



/**
 * Retrieves chat history for a given privateID
 * @param {string} privateID - Unique identifier for the chat session
 * @param {number} [limit=50] - Maximum number of messages to retrieve
 * @param {Date} [lastMessageTimestamp=null] - Timestamp for pagination
 * @returns {Promise<Object>} Chat history or error
 */
/**
 * Retrieves chat history for a given privateID
 * @param {string} privateID - Unique identifier for the chat session
 * @param {number} [limit=50] - Maximum number of messages to retrieve
 * @param {Date} [lastMessageTimestamp=null] - Timestamp for pagination
 * @param {string} [lastMessageId=null] - Message ID for cursor-based pagination
 * @returns {Promise<Object>} Chat history or error
 */
export async function getChatHistory(privateID, limit = 50, lastMessageTimestamp = null) {
  try {
    const chatSession = await Chat.findOne({ privateID });
    if (!chatSession) {
      return {
        status: 'error',
        error: 'Chat session not found'
      };
    }

    const personality = chatSession.personality ? true : false;

    // Build the query for pagination
    let query = {};
    
    if (lastMessageTimestamp) {
      // Fetch messages created before the provided timestamp
      query.createdAt = { $lt: lastMessageTimestamp };
    }
    // Fetch the messages with pagination
    const messages = await chatSession.getRecentMessages(limit, lastMessageTimestamp)

    return {
      status: 'success',
      messages: messages,
      personality: personality
    };
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return {
      status: 'error',
      error: error.message,
      personality: false
    };
  }
}

