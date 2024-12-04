import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const initialQuestions = [

    { id: 1, question: "Someone else has helped me get started." },
    { id: 2, question: "It's fun to try new technology that is not yet available to everyone, such as being a participant in beta programs to test unfinished technology." },
    { id: 3, question: "I enjoy finding the lesser-known features and capabilities of the devices and software I use." },
    { id: 4, question: "When a decision needs to be made, it is important to me to gather relevant details before deciding, in order to be sure of the direction we are heading." },
    { id: 5, question: "I avoid activities that are dangerous or risky" }
];


const options = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const QuestionnaireModal = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleOptionSelect = (option) => {
        setAnswers((prev) => ({
            ...prev,
            [initialQuestions[currentQuestion].id]: option,
        }));

        if (currentQuestion < initialQuestions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion === initialQuestions.length - 1) {
            onComplete(answers);
        } else {
            setCurrentQuestion((prev) => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            {/* Increased box size */}
            <div className="bg-gray-800 rounded-xl max-w-3xl w-full p-8 space-y-8">
                <h2 className="text-xl font-semibold text-gray-100">
                    Customize Your AI Assistant
                </h2>

                <div className="space-y-6">
                    <p className="text-gray-300 whitespace-pre-line">{initialQuestions[currentQuestion].question}</p>

                    {/* Horizontal options with labels */}
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">Disagree</span>
                        <div className="flex gap-4 justify-center w-full">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${answers[initialQuestions[currentQuestion].id] === option
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <span className="text-gray-300">Agree</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="text-gray-400 text-sm">
                        Question {currentQuestion + 1} of {initialQuestions.length}
                    </div>
                    {answers[initialQuestions[currentQuestion].id] && (
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        >
                            {currentQuestion === initialQuestions.length - 1
                                ? "Start Chat"
                                : "Next"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};