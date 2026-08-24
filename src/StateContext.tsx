import { createContext, useState, ReactNode } from 'react';

type AppState = {
  isUIVisible: boolean;
  setIsUIVisible: (visible: boolean) => void;
  isFullPage: boolean;
  setIsFullPage: (value: boolean) => void;
};

const StateContext = createContext<AppState>({
  isUIVisible: true,
  setIsUIVisible: () => {},
  isFullPage: false,
  setIsFullPage: () => {},
});

export function StateProvider({ children }: { children: ReactNode }) {
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isFullPage, setIsFullPage] = useState(false);

  return (
    <StateContext.Provider
      value={{
        isUIVisible,
        setIsUIVisible,
        isFullPage,
        setIsFullPage,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export default StateContext;
