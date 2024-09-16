import { createContext, useContext, useState, ReactNode } from "react";

type AppState = {
  selectedObject: number;
  setSelectedObject: (value: number) => void;
};

const StateContext = createContext<AppState | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedObject, setSelectedObject] = useState<number>(0);

  return (
    <StateContext.Provider value={{ selectedObject, setSelectedObject }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
};
