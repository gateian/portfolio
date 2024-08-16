import { shaderMaterial } from "@react-three/drei";
import { MaterialNode } from "@react-three/fiber";
import { ShaderMaterial } from "three";
import * as THREE from "three";

type LandscapeMaterialType = ShaderMaterial & {
  key: string;
  heightmap: THREE.DataTexture;
};

export const LANDSCAPE_GRID_WIDTH = 50;
export const LANDSCAPE_GRID_DEPTH = 50;

const LandscapeMaterial: typeof ShaderMaterial & { key: string } =
  shaderMaterial(
    {
      heightMap: new THREE.DataTexture(
        new Uint8Array(0),
        0,
        0,
        THREE.RedFormat,
        THREE.UnsignedByteType
      ),
    },
    // vertex shader
    /*glsl*/ `
    #define INSTANCE_COUNT ${LANDSCAPE_GRID_WIDTH * LANDSCAPE_GRID_DEPTH}

  varying vec2 vUv;
  varying vec2 instanceUv;
  uniform float time;
  uniform sampler2D heightMap;
  
	void main() {

    // Calculate grid position based on instance ID
    int gridWidth = int(${LANDSCAPE_GRID_WIDTH});
    int gridDepth = int(${LANDSCAPE_GRID_DEPTH});

    int row = gl_InstanceID / gridWidth;    // Calculate row (z-coordinate)
    int col = gl_InstanceID % gridWidth;    // Calculate column (x-coordinate)

    // Normalizing to get UV coordinates within the grid
    float u = float(col) / float(gridWidth);
    float v = float(row) / float(gridDepth);

    instanceUv = vec2(u, v);
    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif
    
    float localY = clamp(0.0, 1.0, mvPosition.y);
    mvPosition.y = mix(0.0, texture2D(heightMap, instanceUv).r * 25.0, localY);
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`,
    // fragment shader
    /*glsl*/ `
  varying vec2 vUv;
  varying vec2 instanceUv;
  uniform sampler2D heightMap;
  
  void main() {
  	float baseColor = texture2D(heightMap, instanceUv).r;
    gl_FragColor = vec4( baseColor, baseColor, baseColor, 1 );
  }
`
  );

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      landscapeMaterial: MaterialNode<
        LandscapeMaterialType,
        typeof LandscapeMaterial
      >;
    }
  }
}

export { LandscapeMaterial };
