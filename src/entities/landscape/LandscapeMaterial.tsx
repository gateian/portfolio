import { shaderMaterial } from "@react-three/drei";
import { MaterialNode } from "@react-three/fiber";
import { ShaderMaterial } from "three";

type LandscapeMaterialType = ShaderMaterial & {
  key: string;
  colors: Float32Array;
};

export const LANDSCAPE_GRID_WIDTH = 50;
export const LANDSCAPE_GRID_DEPTH = 50;

const LandscapeMaterial: typeof ShaderMaterial & { key: string } =
  shaderMaterial(
    { colors: new Float32Array() },
    // vertex shader
    /*glsl*/ `
    #define INSTANCE_COUNT ${LANDSCAPE_GRID_WIDTH * LANDSCAPE_GRID_DEPTH}

  varying vec2 vUv;
  varying vec3 vInstanceColor;
  uniform float time;
  uniform vec3 colors[INSTANCE_COUNT];
  
	void main() {

    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
      vInstanceColor = colors[gl_InstanceID]; // Pass the color to the fragment shader
    #endif
    
    // DISPLACEMENT
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );
    
    float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
    //mvPosition.z += displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`,
    // fragment shader
    /*glsl*/ `
  varying vec2 vUv;
  varying vec3 vInstanceColor;

  void main() {
  	vec3 baseColor = vInstanceColor;
    //float clarity = ( vUv.y * 0.5 ) + 0.5;
    //gl_FragColor = vec4( baseColor * clarity, 1 );
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
