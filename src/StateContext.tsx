import { createContext, useState, ReactNode } from "react";
import { Texture, Vector3 } from "three";

type AppState = {
  selectedObject: number;
  setSelectedObject: (value: number) => void;
  objectCount: number;
  setObjectCount: (value: number) => void;
  environmentMap: Texture | null;
  setEnvironmentMap: (value: Texture | null) => void;
  cameraTarget: Vector3;
  setCameraTarget: (value: Vector3) => void;
};

const StateContext = createContext<AppState | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedObject, setSelectedObject] = useState<number>(0);
  const [objectCount, setObjectCount] = useState<number>(0);
  const [environmentMap, setEnvironmentMap] = useState<Texture | null>(null);
  const [cameraTarget, setCameraTarget] = useState<Vector3>(new Vector3());

  return (
    <StateContext.Provider
      value={{
        selectedObject,
        setSelectedObject,
        objectCount,
        setObjectCount,
        environmentMap,
        setEnvironmentMap,
        cameraTarget,
        setCameraTarget,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export default StateContext;
