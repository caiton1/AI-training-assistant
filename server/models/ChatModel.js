import mongoose from "mongoose";

// Message Schema to store individual messages within a chat
const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sentBy: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Chat Schema to associate a privateID with messages in a conversation
const chatSchema = new mongoose.Schema({
  privateID: {
    type: String,
    unique: true,
    required: true
  },
  personality: {
    type: [String],
  },
  traits: {
    type: [String]
  },
  control: {
    type: Boolean,
  },
  messages: [messageSchema]
});

// Static method to check if a privateID exists for authentication
chatSchema.statics.privateIDExists = async function (privateID) {
  const chat = await this.findOne({ privateID });
  return !!chat; // Returns true if chat exists, false otherwise
};

// Refined method to retrieve recent messages with pagination for older messages
chatSchema.methods.getRecentMessages = async function (limit, lastMessageTimestamp = null) {
  // Define the query conditions
  const query = { privateID: this.privateID };
  
  // If a lastMessageTimestamp is provided, add a condition to get older messages
  if (lastMessageTimestamp) {
    query['messages.timestamp'] = { $lt: lastMessageTimestamp };
  }

  // Find the chat and sort messages chronologically
  const chat = await this.model('Chat')
    .findOne(query)
    .select({
      messages: { 
        $slice: [
          // If no timestamp, get the last 'limit' messages
          // Otherwise, get the first 'limit' messages older than the timestamp
          lastMessageTimestamp ? 0 : -limit, 
          limit 
        ]
      }
    })
    .exec();

  // Transform messages to match OpenAI format
  const transformedMessages = chat ? chat.messages.sort((a, b) => a.timestamp - b.timestamp).map(message => ({
    content: message.content,
    role: message.sentBy === 'bot' ? 'assistant' : 'user',
    timestamp: message.timestamp
  })) : [];

  return transformedMessages;
};



// Compile the models
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

export { Chat, Message };
