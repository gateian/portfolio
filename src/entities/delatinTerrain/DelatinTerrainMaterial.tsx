import { shaderMaterial } from "@react-three/drei";
import { MaterialNode } from "@react-three/fiber";
import { ShaderMaterial } from "three";
import * as THREE from "three";

type DelatinTerrainMaterialType = ShaderMaterial & {
  key: string;
  heightmap: THREE.DataTexture;
  albedoMap: THREE.Texture;
};

const DelatinTerrainMaterial: typeof ShaderMaterial & { key: string } =
  shaderMaterial(
    {
      heightMap: new THREE.DataTexture(
        new Uint8Array(0),
        0,
        0,
        THREE.RedFormat,
        THREE.UnsignedByteType
      ),
      albedoMap: new THREE.Texture(),
    },
    // vertex shader
    /*glsl*/ `

  uniform sampler2D heightMap;
  varying vec2 vUv;
  
	void main() {

    vec3 localPos = position; 
    vUv = vec2(localPos.x, localPos.z);
    vec4 mvPosition = vec4( position, 1.0 );
    mvPosition.y = texture2D(heightMap, vUv).r * 5.0;

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`,
    // fragment shader
    /*glsl*/ `
  uniform sampler2D heightMap;
  uniform sampler2D albedoMap;
  varying vec2 vUv;

  void main() {

    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  	// vec3 baseColor = vec3(0.792, 0.2, 0.91) * (texture2D(heightMap, vUv).r + 0.3) * 1.2;
    vec3 baseColor = texture2D(albedoMap, uv).rgb;// * (texture2D(heightMap, vUv).r + 0.3) * 1.2;
    gl_FragColor = vec4( baseColor, 1 );
  }
`
  );

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      delatinTerrainMaterial: MaterialNode<
        DelatinTerrainMaterialType,
        typeof DelatinTerrainMaterial
      >;
    }
  }
}

export { DelatinTerrainMaterial };
