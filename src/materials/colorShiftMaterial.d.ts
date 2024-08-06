import { ColorShiftMaterial } from "./ColorShiftMaterial";
import { Object3DNode } from "@react-three/fiber";

type ColorShiftMaterialType = typeof ColorShiftMaterial & {
  color: THREE.Color | string | number;
  time: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      colorShiftMaterial: Object3DNode<
        ColorShiftMaterialType,
        typeof ColorShiftMaterial,
        typeof ColorShiftMaterial
      >;
    }
  }
}
