import express from 'express';
var router = express.Router();
import { handleChat, createChatWithPersonality, getChatHistory } from '../controller/chatController.js';
import { rateLimit } from 'express-rate-limit';


// Create a rate limiter (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs:  24 * 60 * 60 * 1000, // 1 day <- 1 hour <- 1 min <- 1 sec
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.get('/history', async (req, res) => {
  const { privateID, limit = 50, lastMessageTimestamp, lastMessageId } = req.query;
  
  if (!privateID) {
    return res.status(400).json({
      status: 'error',
      error: 'Private ID is required'
    });
  }

  try {
    const messages = await getChatHistory(
      privateID,
      parseInt(limit), // Convert limit to an integer
      lastMessageTimestamp ? new Date(lastMessageTimestamp) : null, // Convert timestamp to Date if provided
      lastMessageId || null // Use the message ID if provided
    );
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// POST route to handle chat with a message
router.post('/', limiter, async function(req, res, next) {
  const { privateID, userMessage } = req.body; // Make sure the data is in the body of the request

  if (!privateID || !userMessage) {
    return res.status(400).json({ status: 'error', message: 'privateID and userMessage are required' });
  }

  const response = await handleChat(privateID, userMessage);
  res.send(response);
});

// POST route to create a new chat with a specific personality
router.post('/create', async function(req, res, next) {
  const { privateID, questionnaireAnswers } = req.body;  // Expecting the privateID and personality to be in the body


  if (!privateID || !questionnaireAnswers) {
    return res.status(400).json({ status: 'error', message: 'privateID and personality are required' });
  }

  const response = await createChatWithPersonality(privateID, questionnaireAnswers);
  res.send(response);
});

export default router;
