import CustomShaderMaterial from "three-custom-shader-material";

import { forwardRef } from "react";
import * as THREE from "three";

const DelatinTerrainMaterial = forwardRef<any>((_props, ref) => {
  return (
    <CustomShaderMaterial
      ref={ref}
      baseMaterial={THREE.MeshPhysicalMaterial}
      vertexShader={`

  uniform sampler2D heightMap;
  varying vec2 vUv;
  
	void main() {

    vUv = vec2(position.x, position.z);

    float height = texture2D(heightMap, vUv).r * 5.0;
    csm_Position = vec3(position.x, height, position.z);

	}`}
      fragmentShader={`
  uniform sampler2D heightMap;
  uniform sampler2D albedoMap;
  varying vec2 vUv;

  void main() {

    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec3 baseColor = texture2D(albedoMap, uv).rgb;// * (texture2D(heightMap, vUv).r + 0.3) * 1.2;
    csm_FragColor = vec4( baseColor * 0.5, 1.0 );
  }
`}
      uniforms={{
        heightMap: {
          value: new THREE.DataTexture(
            new Uint8Array(0),
            0,
            0,
            THREE.RedFormat,
            THREE.UnsignedByteType
          ),
        },
        albedoMap: { value: new THREE.Texture() },
      }}
    />
  );
});

export { DelatinTerrainMaterial };
