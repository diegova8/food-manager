import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const WELCOME_GUIDE_KEY = 'ceviche-welcome-guide-seen';

interface TutorialContextType {
  showTutorial: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if first-time visitor on mount
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(WELCOME_GUIDE_KEY);
    if (!hasSeenGuide) {
      setShowTutorial(true);
    }
  }, []);

  const openTutorial = () => {
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    localStorage.setItem(WELCOME_GUIDE_KEY, 'true');
    setShowTutorial(false);
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, openTutorial, closeTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
