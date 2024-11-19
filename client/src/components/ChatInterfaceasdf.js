import React, { useState, useEffect } from 'react';
import { Send, Reply, X, ArrowRight } from 'lucide-react';

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
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(true);
    const [userPreferences, setUserPreferences] = useState(null);

    const handleQuestionnaireComplete = async (answers) => {
        setShowQuestionnaire(false);
        setUserPreferences(answers);

        // Here you would typically make an API call to set up the AI behavior
        try {
            setIsLoading(true);
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
            // Here you'll make your API call with userPreferences
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

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Chat header */}
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
                            {message.replyTo && (
                                <div className="w-full px-4 py-2 mb-2 bg-gray-800 border-l-4 border-blue-600 rounded text-gray-400 text-sm">
                                    Replying to: {message.replyTo.content}
                                </div>
                            )}

                            <div
                                className={`rounded-lg p-4 ${message.role === 'user'
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