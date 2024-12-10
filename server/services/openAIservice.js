import { OpenAI } from 'openai';
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Sends a message to OpenAI ChatGPT with a specific personality context
 * @param {string} personality - The personality/system prompt for the AI
 * @param {string} userMessage - The message from the user
 * @param {Array} messageHistory - Optional previous messages for context
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} The AI's response
 */
async function sendMessage(
  personality,
  userMessage,
  messageHistory = [],
  options = {
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 2500 // more == more context window
  }
) {
  try {
    // Construct messages array with personality as system message
    const messages = [
      {
        role: "system",
        content: personality
      }
    ];

    // Add message history if provided
    if (messageHistory.length > 0) {
      messages.push(...messageHistory);
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: options.model,
      messages: messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to get chat response: ${error.message}`);
  }
}

export {sendMessage};