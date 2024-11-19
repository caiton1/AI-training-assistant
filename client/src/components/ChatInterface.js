import React, { useState } from 'react';
import { Send, Reply, X, ArrowRight, Key } from 'lucide-react';
import { Alert, AlertDescription } from './Alert';

// Keeping the original questions array
const initialQuestions = [
    {
        id: 1,
        question: "What's your primary goal for using this AI assistant?",
        options: [
            "Learning & Education",
            "Professional Work",
            "Creative Projects",
            "Personal Assistant",
            "Technical Help"
        ]
    },
    {
        id: 2,
        question: "What tone would you prefer the AI to use?",
        options: [
            "Professional & Formal",
            "Friendly & Casual",
            "Direct & Concise",
            "Detailed & Thorough",
            "Educational & Explanatory"
        ]
    },
    {
        id: 3,
        question: "Which areas are you most interested in?",
        options: [
            "Technology & Programming",
            "Business & Finance",
            "Arts & Creativity",
            "Science & Research",
            "General Knowledge"
        ],
        multiple: true
    }
];

// New Authentication Component

const AuthScreen = ({ onAuthenticate }) => {
    const [privateId, setPrivateId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isGeneratingId, setIsGeneratingId] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError('');

        try {
            // Replace this with your actual database verification
            const response = await verifyAndFetchUserData(privateId);
            onAuthenticate(privateId, response);
        } catch (error) {
            setAuthError('Error verifying Private ID. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateNewId = async () => {
        setIsGeneratingId(true);
        try {
            // Placeholder for the actual API call
            const newId = await generateNewPrivateId();
            setPrivateId(newId);
        } catch (error) {
            console.error('Error generating new Private ID:', error);
        } finally {
            setIsGeneratingId(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <h1 className="text-xl font-semibold text-center text-gray-100">AI GitHub Assistant</h1>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">
                    {authError && (
                        <Alert variant="destructive">
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="privateId" className="block text-sm font-medium text-gray-200">
                                Enter your Private ID
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="privateId"
                                    value={privateId}
                                    onChange={(e) => setPrivateId(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your private ID..."
                                    required
                                />
                                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !privateId.trim()}
                            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Continue'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <button
                        onClick={handleGenerateNewId}
                        disabled={isGeneratingId}
                        className="w-full mt-2 bg-green-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingId ? 'Generating...' : 'Generate New Private ID'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// Mock function to simulate backend API call to generate new private ID
const generateNewPrivateId = async () => {
    // Simulate network request delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`new-private-id-${Date.now()}`);
        }, 1000);
    });
};

// Mock function to verify and fetch user data - replace with actual implementation
const verifyAndFetchUserData = async (privateId) => {
    // Simulate API call - replace with actual database query
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                exists: true,
                preferences: null, // or existing preferences if found
                messages: [], // or existing messages if found
                needsQuestionnaire: true // or false if user has already completed it
            });
        }, 1000);
    });
};

// Rest of your existing components (QuestionnaireModal remains the same)
const QuestionnaireModal = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleOptionSelect = (option) => {
        if (initialQuestions[currentQuestion].multiple) {
            setSelectedOptions(prev =>
                prev.includes(option)
                    ? prev.filter(item => item !== option)
                    : [...prev, option]
            );
        } else {
            setAnswers(prev => ({
                ...prev,
                [initialQuestions[currentQuestion].id]: option
            }));
            if (currentQuestion < initialQuestions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedOptions([]);
            }
        }
    };

    const handleNext = () => {
        if (initialQuestions[currentQuestion].multiple) {
            setAnswers(prev => ({
                ...prev,
                [initialQuestions[currentQuestion].id]: selectedOptions
            }));
        }

        if (currentQuestion === initialQuestions.length - 1) {
            onComplete(answers);
        } else {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOptions([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-100">
                    Customize Your AI Assistant
                </h2>

                <div className="space-y-4">
                    <p className="text-gray-300">
                        {initialQuestions[currentQuestion].question}
                    </p>

                    <div className="space-y-2">
                        {initialQuestions[currentQuestion].options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${initialQuestions[currentQuestion].multiple
                                        ? selectedOptions.includes(option)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : answers[initialQuestions[currentQuestion].id] === option
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="text-gray-400 text-sm">
                        Question {currentQuestion + 1} of {initialQuestions.length}
                    </div>
                    {(initialQuestions[currentQuestion].multiple ||
                        answers[initialQuestions[currentQuestion].id]) && (
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                            >
                                {currentQuestion === initialQuestions.length - 1 ? 'Start Chat' : 'Next'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
};

const ChatInterface = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [privateId, setPrivateId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [userPreferences, setUserPreferences] = useState(null);

    const handleAuthentication = async (id, userData) => {
        setPrivateId(id);
        setIsAuthenticated(true);
        
        if (userData.messages) {
            setMessages(userData.messages);
        }
        
        if (userData.preferences) {
            setUserPreferences(userData.preferences);
            // Skip questionnaire if user already has preferences
            setShowQuestionnaire(false);
        } else {
            setShowQuestionnaire(true);
        }
    };

    const handleQuestionnaireComplete = async (answers) => {
        setShowQuestionnaire(false);
        setUserPreferences(answers);

        try {
            setIsLoading(true);
            // Here you would save the preferences to your database using privateId
            // Simulate API call
            setTimeout(() => {
                setMessages([
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: 'Hello! I\'ve been configured according to your preferences. How can I help you today?'
                    }
                ]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error configuring AI:', error);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            replyTo: replyTo
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setReplyTo(null);
        setIsLoading(true);

        try {
            // Here you'll make your API call with userPreferences and privateId
            setTimeout(() => {
                const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: 'This is a placeholder response. Replace this with your backend integration.'
                };
                setMessages(prev => [...prev, assistantMessage]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    const handleReply = (message) => {
        setReplyTo(message);
    };

    const cancelReply = () => {
        setReplyTo(null);
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

            {/* Rest of your existing chat interface JSX */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                        <div
                            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}
                        >
                            {message.replyTo && (
                                <div className="w-full px-4 py-2 mb-2 bg-gray-800 border-l-4 border-blue-600 rounded text-gray-400 text-sm">
                                    Replying to: {message.replyTo.content}
                                </div>
                            )}

                            <div
                                className={`rounded-lg p-4 ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-gray-100'
                                        : 'bg-gray-800 border border-gray-700 text-gray-100'
                                } w-full`}
                            >
                                {message.content}
                            </div>

                            {message.role === 'assistant' && (
                                <button
                                    onClick={() => handleReply(message)}
                                    className="mt-2 text-gray-400 hover:text-gray-300 text-sm flex items-center gap-1"
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            )}
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
                {replyTo && (
                    <div className="mb-2 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                            <Reply className="w-4 h-4" />
                            Replying to assistant message
                        </div>
                        <button
                            onClick={cancelReply}
                            className="text-gray-400 hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

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