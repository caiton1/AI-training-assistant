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
    // Convert questionnaire answers to personality string
    const personality = this.processQuestionnaireResponses(questionnaireAnswers);
    
    try {
      const response = await apiClient.post('/create', {
        privateID,
        personality
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
  },



  // TODO: better implementation, what to decide when answer is 5?
  // TODO: balence controll and independant variable
  // Process questionnaire answers into personality string
  processQuestionnaireResponses(answers) {
    const personalityMapping = 
      [
        {
          abi: "You are interacting with a user with low confidence in handling unfamiliar computing tasks, often blaming themselves for technological problems. Provide responses that can help the user to increase their self-efficacy.",
          tim: "You are interacting with a highly confident user in his technological abilities. Provide responses that support the user in improving their technological abilities."
        },
        {
          abi: "You are interacting with a user who is motivated to use technology to accomplish what they can. Provide responses with a clear outcome.",
          tim: "You are interacting with a user who perceives technology as not just a tool but a source of fun and excitement and actively seeks out the latest software to ensure he has access to all the latest features. Provide responses that support the user in having fun discovering new technology features."
        },
        {
          abi: "You are interacting with a user that adopts a comprehensive information processing style, preferring to gather information comprehensively before attempting to solve problems, which involves consuming a lot of information once before acting on an activity. Provide responses with a step-by-step guide.",
          tim: "You are interacting with a user who enjoys tinkering with software to construct his own understanding of how it works internally. Provide direct and short responses to allow the user to understand the problem independently and explore on their own."
        },
        {
          abi: "You are interacting with a user who adopts a comprehensive information processing style, preferring to gather information comprehensively before attempting to solve problems, which involves consuming a lot of information once before acting on an activity. Provide responses with a step-by-step.",
          tim: "You are interacting with a user who processes information selectively, acting upon the first promising information, then possibly"
        },
        {
          abi: "You are interacting with a user who tends to be risk-averse when using unfamiliar technologies that may require additional learning time. The student prefers tasks with familiar features due to their outcome and time consumption predictability. Provide responses to inform the user that the action is reversible or about the consequences of each suggested action.",
          tim: "You are interacting with a user who, when using technology, is willing to take risks to discover more about technology. Provide responses that support the user in taking risks and discovering more about technology."
        }
      ];

    let traits = [];
    
    // 1 - self-efficacy: closer to Tim
    if (Number(answers[0]) >= 5) {
      traits.push(personalityMapping[0].tim);
    } else {
      traits.push(personalityMapping[0].abi);
    }

    // 2 - Motivation: closer to Tim
    if (Number(answers[1]) >= 5) {
      traits.push(personalityMapping[1].tim);
    } else {
      traits.push(personalityMapping[1].abi);
    }
    
    // 3 - Learning process: closer to Tim
    if (Number(answers[2]) >= 5) {
      traits.push(personalityMapping[2].tim);
    } else {
      traits.push(personalityMapping[2].abi);
    }

    // 4 - Information Process: closer to Abi
    if (Number(answers[3]) >= 5) {
      traits.push(personalityMapping[3].abi);
    } else {
      traits.push(personalityMapping[3].tim);
    }

     // 5 - Risk tolerant: closer to Abi
     if (Number(answers[4]) >= 5) {
      traits.push(personalityMapping[4].abi);
    } else {
      traits.push(personalityMapping[4].tim);
    }

    // cannot support markdown or special formatting yet
    traits.push("You can only use ASCII text and new lines, do not use markdown formatting.  Your directive is to ONLY talk or teach GitHub and nothing else, otherwise politely decline the question.");

    return traits.join(' ');
  }
};