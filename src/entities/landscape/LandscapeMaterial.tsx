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
  varying float instanceID;
  varying vec2 vUvTopLeft;
  varying vec2 vUvBottomRight;
  varying float vLocalY;
  uniform float time;
  uniform sampler2D heightMap;
  
	void main() {

    // Calculate grid position based on instance ID
    int gridWidth = int(${LANDSCAPE_GRID_WIDTH});
    int gridDepth = int(${LANDSCAPE_GRID_DEPTH});

    // Calculate row (z-coordinate) and column (x-coordinate) in the grid
    int row = gl_InstanceID / gridWidth;
    int col = gl_InstanceID % gridWidth;

    vec3 localPos = position; 

    // Normalize to get local UVs within the cube's unit space
    // Assume the cube is from (-0.5, -0.5, -0.5) to (0.5, 0.5, 0.5)
    float localU = (localPos.z + 0.5);
    float localV = (localPos.x + 0.5);

    // Calculate global UVs by combining instance position and local UVs
    float u = (localU + float(col)) / float(gridWidth);
    float v = (localV + float(row)) / float(gridDepth);

    // Set the UV coordinates for this vertex
    instanceUv = vec2(u, v);

    // Determine the adjacent UVs for the top face of the cube
    float left = float(col) / float(gridWidth);
    float right = float(col + 1) / float(gridWidth);
    float top = float(row) / float(gridDepth);
    float bottom = float(row + 1) / float(gridDepth);

    vUvTopLeft = vec2(left, top);
    vUvBottomRight = vec2(right, bottom);

    // Sample the heightmap at these UVs
    float heightTL = texture2D(heightMap, vec2(left, top)).r;
    float heightTR = texture2D(heightMap, vec2(right, top)).r;
    float heightBL = texture2D(heightMap, vec2(left, bottom)).r;
    float heightBR = texture2D(heightMap, vec2(right, bottom)).r;

    // Compute min and max heights
    float minHeight = min(min(heightTL, heightTR), min(heightBL, heightBR));
    float maxHeight = max(max(heightTL, heightTR), max(heightBL, heightBR));

    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif

    // Determine the local y position of the vertex
    float localY = position.y + 0.5;
    vLocalY = localY; 

    // Apply the max height to top vertices and min height to bottom vertices
    float finalHeight = mix(minHeight, maxHeight, localY);
    
    mvPosition.y = finalHeight * 10.0;

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`,
    // fragment shader
    /*glsl*/ `
  varying vec2 vUv;
  varying vec2 instanceUv;
  varying float instanceID;
  varying vec2 vUvTopLeft;
  varying vec2 vUvBottomRight;
  varying float vLocalY;
  uniform sampler2D heightMap;
  
  void main() {

  	vec3 baseColor = vec3(0.792, 0.2, 0.91) * (vLocalY * 1.0) * (texture2D(heightMap, instanceUv).r + 0.3) * 1.2;
    gl_FragColor = vec4( baseColor, 1 );
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
