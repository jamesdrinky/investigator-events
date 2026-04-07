'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface IntroContextType {
  introComplete: boolean;
  markComplete: () => void;
}

const IntroContext = createContext<IntroContextType>({
  introComplete: true, // Default true so non-homepage pages work immediately
  markComplete: () => {},
});

export function IntroProvider({ children }: { children: ReactNode }) {
  // Start false — will be set true when intro finishes or is skipped
  const [introComplete, setIntroComplete] = useState(false);

  const markComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <IntroContext.Provider value={{ introComplete, markComplete }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
