import express from 'express';
const { Configuration, OpenAIApi } = require('openai');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // Assuming Message schema is defined here

const app = express();
app.use(express.json());

// OpenAI API configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Personality configurations
const personalities = {
    visual: "You are a patient and illustrative tutor who explains concepts using visuals and metaphors.",
    auditory: "You are a friendly conversational teacher who explains concepts in a clear and spoken format.",
    kinesthetic: "You are a hands-on mentor who gives step-by-step guidance with actionable instructions.",
};

// Endpoint for chatbot response
app.post('/chat', async (req, res) => {
    const { userMessage, learningStyle } = req.body;

    // Choose personality based on user's learning style
    const personality = personalities[learningStyle] || personalities.visual;

    try {
        // Compose the prompt
        const prompt = `${personality}\nUser: ${userMessage}\nBot:`;

        // OpenAI API call
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
        });

        const botMessage = response.data.choices[0].message.content;

        // Save conversation to MongoDB
        const message = new Message({
            userMessage,
            botMessage,
            learningStyle,
            timestamp: new Date(),
        });
        await message.save();

        // Send response back to the client
        res.json({ botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000, () => console.log('Server running on port 3000')))
    .catch(error => console.error('MongoDB connection error:', error));


    