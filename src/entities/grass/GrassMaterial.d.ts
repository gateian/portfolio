import { MaterialNode, MaterialProps } from "@react-three/fiber";
import { ShaderMaterial } from "three";

interface GrassMaterialProps extends MaterialProps {
  time?: number;
}

declare class GrassMaterial extends ShaderMaterial {
  constructor(parameters?: GrassMaterialProps);
  time: number;
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    grassMaterial: MaterialNode<GrassMaterial, typeof GrassMaterial>;
  }
}

export { GrassMaterial, GrassMaterialProps };
