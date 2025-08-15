import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './EnhancedAuthContext';
import { subscribeToAIInteractionPrompts, unsubscribeFromAIInteractionPrompts } from '../services/realtimeService';
import { appLog } from '../components/LogViewer';

interface AIPromptContextType {
  latestPrompt: string | null;
  clearPrompt: () => void;
}

const AIPromptContext = createContext<AIPromptContextType | undefined>(undefined);

export const AIPromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isVerified } = useAuth();
  const [latestPrompt, setLatestPrompt] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isAuthenticated && isVerified && user?.id) {
      appLog('AIPromptContext', `Attempting to subscribe to AI prompts for user ${user.id}`, 'info');
      subscribeToAIInteractionPrompts(user.id, (promptPayload) => {
        appLog('AIPromptContext', 'Received AI prompt payload:', 'info', promptPayload);
        setLatestPrompt(promptPayload.content);
      });
    } else {
      appLog('AIPromptContext', 'User not authenticated or verified, unsubscribing from AI prompts.', 'info');
      unsubscribeFromAIInteractionPrompts();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      unsubscribeFromAIInteractionPrompts();
    };
  }, [isAuthenticated, isVerified, user?.id]);

  const clearPrompt = () => {
    setLatestPrompt(null);
  };

  return (
    <AIPromptContext.Provider value={{ latestPrompt, clearPrompt }}>
      {children}
    </AIPromptContext.Provider>
  );
};

export const useAIPrompt = () => {
  const context = useContext(AIPromptContext);
  if (context === undefined) {
    throw new Error('useAIPrompt must be used within an AIPromptProvider');
  }
  return context;
};
