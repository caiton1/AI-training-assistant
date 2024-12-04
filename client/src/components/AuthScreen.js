import { Alert, AlertDescription } from './Alert';
import { chatService } from '../api/apiService';
import React, { useState } from 'react';
import { ArrowRight, Key } from 'lucide-react';

const verifyAndFetchUserData = async (privateId) => {
    try {
      const userData = await chatService.verifyPrivateID(privateId);
      return userData;
    } catch (error) {
      throw new Error('Error verifying Private ID');
    }
  };

function generateRandomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomId += chars[randomIndex];
    }
    return randomId;
}

const generateNewPrivateId = async () => {
    return generateRandomId();
};

export const AuthScreen = ({ onAuthenticate }) => {
    const [privateId, setPrivateId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isGeneratingId, setIsGeneratingId] = useState(false);
    const [isNewId, setIsNewId] = useState(false); // Track if ID was just generated

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAuthError('');
        
        const response = await verifyAndFetchUserData(privateId);

        try {
            // Prevent new account creation without generating a new ID
            if (!isNewId && !response.exists) {
                setAuthError('Please generate a new Private ID to create an account.');
                setIsLoading(false);
                return;
            }
    
            // If this is a newly generated ID, skip verification and go straight to questionnaire
            if (isNewId) {
                onAuthenticate(privateId, {
                    exists: false,
                    messages: [],
                    needsQuestionnaire: true
                });
                return;
            }
    
            // Otherwise continue with existing ID
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
            const newId = await generateNewPrivateId();
            setPrivateId(newId);
            setIsNewId(true); // Mark this as a new ID
            setAuthError(''); // Clear any previous errors
        } catch (error) {
            console.error('Error generating new Private ID:', error);
            setAuthError('Error generating new Private ID. Please try again.');
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
                                {isNewId ? 'Your new Private ID' : 'Enter your Private ID'}
                            </label>
                            <div className="relative">
                            <input
                                type="text"
                                id="privateId"
                                value={privateId}
                                onChange={(e) => {
                                    if (!isNewId) { // Allow changes only if it's not a new ID
                                        setPrivateId(e.target.value);
                                    }
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your private ID..."
                                required
                                readOnly={isNewId} // Make input read-only if it's a new ID
                            />
                                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !privateId.trim()}
                            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : (isNewId ? 'Start Setup' : 'Continue')}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900 text-gray-400">or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateNewId}
                        disabled={isGeneratingId}
                        className="w-full mt-2 bg-green-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingId ? 'Generating...' : 'Generate New Private ID'}
                    </button>

                    {isNewId && (
                        <div className="text-sm text-gray-400 text-center">
                            ℹ️ Save this ID to access your chat history later
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
