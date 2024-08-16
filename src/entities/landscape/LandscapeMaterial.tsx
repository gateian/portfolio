import { shaderMaterial } from "@react-three/drei";
import { MaterialNode } from "@react-three/fiber";
import { ShaderMaterial } from "three";
import * as THREE from "three";

type LandscapeMaterialType = ShaderMaterial & {
  key: string;
  heightmap: THREE.DataTexture;
};

export const LANDSCAPE_GRID_WIDTH = 100;
export const LANDSCAPE_GRID_DEPTH = 100;

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
  varying float vLocalY;
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

    // Determine the adjacent UVs for the top face of the cube
    vec2 uvTopLeft = vec2(u - 1.0 / float(gridWidth), v);
    vec2 uvTopRight = vec2(u + 1.0 / float(gridWidth), v);
    vec2 uvBottomLeft = vec2(u, v - 1.0 / float(gridDepth));
    vec2 uvBottomRight = vec2(u, v + 1.0 / float(gridDepth));

    // Sample the heightmap at these UVs
    float heightTL = texture2D(heightMap, uvTopLeft).r;
    float heightTR = texture2D(heightMap, uvTopRight).r;
    float heightBL = texture2D(heightMap, uvBottomLeft).r;
    float heightBR = texture2D(heightMap, uvBottomRight).r;

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
    float localY = (position.y + 1.0) * 0.5;
    vLocalY = localY; // Normalize localY to be between 0 and 1

    // Apply the max height to top vertices and min height to bottom vertices
    float finalHeight = mix(minHeight, maxHeight, localY);
    
    mvPosition.y = mix(0.0, finalHeight * 10.0, localY);

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`,
    // fragment shader
    /*glsl*/ `
  varying vec2 vUv;
  varying vec2 instanceUv;
  varying float vLocalY;
  uniform sampler2D heightMap;
  
  void main() {
  	vec3 baseColor = vec3(0.792, 0.2, 0.91) * (vLocalY * 2.0) * (texture2D(heightMap, instanceUv).r + 0.2);
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
