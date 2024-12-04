import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { AuthScreen } from './AuthScreen';
import { chatService } from '../api/apiService';
import { QuestionnaireModal } from './QuestionnaireModel';

const ChatInterface = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [privateId, setPrivateId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);

    // AUTH
    const handleAuthentication = async (id, userData) => {
      setPrivateId(id);
      setIsAuthenticated(true);


      try {
          // Use chatService to verify the privateID and fetch chat history
          const chatHistoryResponse = await chatService.verifyPrivateID(id);
  

          if (chatHistoryResponse.messages && chatHistoryResponse.messages.length > 0) {
              setMessages(chatHistoryResponse.messages);
          }
          // Check if user preferences already exist to avoid re-showing questionnaire
          if (userData.personality) {
              setUserPreferences(userData.personality);
              setShowQuestionnaire(false);
          } else if (chatHistoryResponse.needsQuestionnaire) {
              setShowQuestionnaire(true);
          } else {
              // If no preferences and no questionnaire flag, still show questionnaire
              setShowQuestionnaire(false);
          }
      } catch (error) {
          console.error('Error fetching chat history:', error);
          // Optional: Add error handling UI
          setShowQuestionnaire(true);
      }
  };

    // PERSONALITY
    const handleQuestionnaireComplete = async (answers) => {
        setShowQuestionnaire(false);
        setUserPreferences(answers);

        try {
          setIsLoading(true);
          const response = await chatService.createNewChat(privateId, answers);
          // TODO: find way to associate user

          if (response.success) {
            setMessages([{
              id: Date.now(),
              role: 'assistant',
              content: 'Hello! I\'ve been configured according to your preferences. How can I help you today?'
            }]);
          } else {
            throw new Error('Failed to create chat session');
          }
        } catch (error) {
          console.error('Error configuring AI:', error);
          // You might want to add error handling UI here
        } finally {
          setIsLoading(false);
        }
      };

      // USER CHAT 
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
      
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: inputValue
        };
      
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
      
        try {
          const response = await chatService.sendMessage(privateId, userMessage.content);
          
          if (response.success) {
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant',
              content: response.message
            };
            setMessages(prev => [...prev, assistantMessage]);
          } else {
            throw new Error('Failed to get response');
          }
        } catch (error) {
          console.error('Chat error:', error);
          // Add error message to chat
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your message. Please try again.'
          }]);
        } finally {
          setIsLoading(false);
        }
      };

    if (!isAuthenticated) {
        return <AuthScreen onAuthenticate={handleAuthentication} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <h1 className="text-xl font-semibold text-center text-gray-100">AI GitHub Assistant</h1>
            </div>
            
            {showQuestionnaire && (
                <QuestionnaireModal onComplete={handleQuestionnaireComplete} />
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                        <div
                            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}
                        >

                            <div
                                className={`rounded-lg p-4 ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-gray-100'
                                        : 'bg-gray-800 border border-gray-700 text-gray-100'
                                } w-full`}
                            >
                                {message.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 bg-gray-800 p-4">

                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-blue-600 text-gray-100 rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;