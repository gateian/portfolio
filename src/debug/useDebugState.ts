import { useContext } from "react";
import DebugStateContext from "./DebugStateContext";

export const useDebugState = () => {
  const context = useContext(DebugStateContext);
  if (!context) {
    throw new Error("useDebugState must be used within a DebugStateProvider");
  }
  return context;
};
