import { Vector3 } from "three";

export enum CameraModes {
  Static = "STATIC",
  Orbit = "ORBIT",
  MotionPath = "MOTION_PATH",
}

export interface OrbitCameraSettingsProps {
  mode: CameraModes;
  autoRotate?: boolean;
  enableRotate?: boolean;
  screenSpacePanning?: boolean;
  maxDistance?: number;
  minDistance?: number;
  initialPosition?: Vector3;
  target?: Vector3;
}
