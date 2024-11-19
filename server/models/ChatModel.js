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
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message', // references another Message if it's a reply
    default: null
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
  messages: [messageSchema]
});

// Static method to check if a privateID exists for authentication
chatSchema.statics.privateIDExists = async function (privateID) {
  const chat = await this.findOne({ privateID });
  return !!chat; // Returns true if chat exists, false otherwise
};

// Refined method to retrieve recent messages with pagination for older messages
chatSchema.methods.getRecentMessages = async function (limit, lastMessageTimestamp = null) {
  // Define the timestamp filter based on the optional `lastMessageTimestamp` parameter
  const filter = lastMessageTimestamp
    ? { privateID: this.privateID, 'messages.timestamp': { $lt: lastMessageTimestamp } }
    : { privateID: this.privateID };

  // Query and retrieve only the messages array based on the timestamp filter
  const chat = await this.model('Chat')
    .findOne(filter)
    .select({ messages: { $slice: -limit } })
    .exec();

  // Return the most recent messages within the array
  return chat ? chat.messages : [];
};




// Compile the models
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

export { Chat, Message };
