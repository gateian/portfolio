import { createContext, useState, ReactNode } from 'react';
import { Vector3 } from 'three';
import { isDebugMode } from '../utils/generalUtils';

type DebugState = {
  cameraPosition: Vector3 | undefined;
  setCameraPosition: React.Dispatch<React.SetStateAction<Vector3 | undefined>>;
};

const DebugStateContext = createContext<DebugState | undefined>(undefined);

export function DebugStateProvider({ children }: { children: ReactNode }) {
  const [cameraPosition, setCameraPosition] = useState<Vector3>();

  if (!isDebugMode) {
    return null;
  }

  return (
    <DebugStateContext.Provider
      value={{
        cameraPosition,
        setCameraPosition,
      }}
    >
      {children}
    </DebugStateContext.Provider>
  );
}

export default DebugStateContext;
