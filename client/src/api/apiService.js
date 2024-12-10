// services/apiService.js
import axios from 'axios';

// Configure base URL for the backend server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/chat';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const chatService = {
  // Verify if privateID exists and get chat history
  async verifyPrivateID(privateID) {
    try {
      const response = await apiClient.get('/history', {
        params: { 
          privateID,
          limit: 50  // Get last 50 messages by default
        }
      });
  
      const needsPersonality = response.data.personality ? false : true;

      return {
        exists: response.data.status === 'success',
        messages: response.data.messages?.map(msg => ({
          id: msg._id,
          role: msg.sentBy === 'bot' ? 'assistant' : 'user',
          content: msg.content
        })) || [],
        needsQuestionnaire: needsPersonality
      };
    } catch (error) {
      // If we get a 400, the ID doesn't exist
      if (error.response?.status === 400) {
        return {
          exists: false,
          needsQuestionnaire: true
        };
      }
      throw new Error('Error verifying private ID: ' + error.message);
    }
  },

  // Create new chat with personality from questionnaire
  async createNewChat(privateID, questionnaireAnswers) {
    console.log(questionnaireAnswers)
    try {
      const response = await apiClient.post('/create', {
        privateID,
        questionnaireAnswers
      });

      return {
        success: response.data.status === 'success',
        chatSession: response.data.chatSession
      };
    } catch (error) {
      throw new Error('Error creating chat: ' + error.message);
    }
  },

  // Send a message and get AI response
  async sendMessage(privateID, message) {
    try {
      const response = await apiClient.post('/', {
        privateID,
        userMessage: message
      });

      return {
        success: response.data.status === 'success',
        message: response.data.message
      };
    } catch (error) {
      throw new Error('Error sending message: ' + error.message);
    }
  }
};