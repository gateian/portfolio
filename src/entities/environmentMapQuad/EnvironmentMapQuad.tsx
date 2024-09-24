import React, { useMemo } from "react";
import * as THREE from "three";

interface EnvironmentMapQuadProps {
  envMap: THREE.Texture | THREE.CubeTexture | null;
}

const EnvironmentMapQuad: React.FC<EnvironmentMapQuadProps> = ({ envMap }) => {
  const material = useMemo(() => {
    if (!envMap) return null;

    console.log("Environment map loaded");
    if (envMap instanceof THREE.Texture) {
      return new THREE.ShaderMaterial({
        uniforms: { envMap: { value: envMap } },
        vertexShader: `
          varying vec3 vWorldDirection;
          vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
            return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
          }
          void main() {
            vWorldDirection = transformDirection( position, modelMatrix );
            #include <begin_vertex>
            #include <project_vertex>
          }
        `,
        fragmentShader: `
          uniform samplerCube envMap;
          varying vec3 vWorldDirection;
          void main() {
            vec3 color = textureCube( envMap, vWorldDirection ).rgb;
            gl_FragColor = vec4( color, 1.0 );
          }
        `,
        side: THREE.DoubleSide,
      });
    } else {
      return new THREE.MeshBasicMaterial({
        map: envMap,
        side: THREE.DoubleSide,
      });
    }
  }, [envMap]);

  if (!material) return null;

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} />
    </mesh>
  );
};

export default EnvironmentMapQuad;
