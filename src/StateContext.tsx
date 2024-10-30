import { createContext, useState, ReactNode } from "react";
import { Texture, Vector3 } from "three";
import { MapMarkerDefinition } from "./entities/mapMarker/MapMarker.types";
import {
  CameraModes,
  OrbitCameraSettingsProps,
} from "./components/CameraMode/CameraMode.types";
import { GlbModelProps } from "./entities/glbModel/glbModelPrimitive";

type AppState = {
  selectedObject: number;
  setSelectedObject: (value: number) => void;
  objectCount: number;
  setObjectCount: (value: number) => void;
  environmentMap: Texture | null;
  setEnvironmentMap: (value: Texture | null) => void;
  cameraTarget: Vector3;
  setCameraTarget: (value: Vector3) => void;
  subPageDialogId: number;
  setSubPageDialogId: (value: number) => void;
  mapMarkers: MapMarkerDefinition[];
  setMapMarkers: (value: MapMarkerDefinition[]) => void;
  cameraSettings: OrbitCameraSettingsProps;
  setCameraSettings: (value: OrbitCameraSettingsProps) => void;
  glbModels: Map<string, GlbModelProps>;
  setGlbModels: (value: Map<string, GlbModelProps>) => void;
};

const StateContext = createContext<AppState | undefined>(undefined);

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedObject, setSelectedObject] = useState<number>(0);
  const [objectCount, setObjectCount] = useState<number>(0);
  const [environmentMap, setEnvironmentMap] = useState<Texture | null>(null);
  const [cameraTarget, setCameraTarget] = useState<Vector3>(new Vector3());
  const [subPageDialogId, setSubPageDialogId] = useState<number>(-1);
  const [mapMarkers, setMapMarkers] = useState<MapMarkerDefinition[]>([]);
  const [cameraSettings, setCameraSettings] =
    useState<OrbitCameraSettingsProps>({
      mode: CameraModes.Orbit,
      enableRotate: true,
      screenSpacePanning: true,
      maxDistance: 700,
      minDistance: 50,
    });
  const [glbModels, setGlbModels] = useState<
    Map<string, GlbModelProps>
  >(new Map());

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
        subPageDialogId,
        setSubPageDialogId,
        mapMarkers,
        setMapMarkers,
        cameraSettings,
        setCameraSettings,
        glbModels,
        setGlbModels,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export default StateContext;
