import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  attribute vec3 offset;
  attribute vec4 orientation;
  attribute vec3 scale;

  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 applyQuaternionToVector( vec4 q, vec3 v ){
    return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
  }

  void main() {
    vec3 vPosition = position;
    
    // Apply scale
    vPosition *= scale;
    
    // Apply instance rotation
    vPosition = applyQuaternionToVector(orientation, vPosition);
    
    // Apply instance position offset
    vPosition = vPosition + offset;
    
    // Transform to world space
    vec4 worldPosition = modelMatrix * vec4(vPosition, 1.0);
    
    // Transform to clip space
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    
    // Pass normal to fragment shader
    vNormal = normalMatrix * normal;
    vPosition = worldPosition.xyz;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 light = vec3(0.5, 0.2, 1.0);
    light = normalize(light);
    
    float dProd = max(0.0, dot(vNormal, light));
    
    // gl_FragColor = vec4(color * dProd, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const InstancedMeshWithShader = ({ count = 1000 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shader = useMemo(() => {
    return {
      uniforms: {
        color: { value: new THREE.Color("purple") },
      },
      vertexShader,
      fragmentShader,
    };
  }, []);

  const [offsetArray, scaleArray, orientationArray] = useMemo(() => {
    const offsetArray = new Float32Array(count * 3);
    const scaleArray = new Float32Array(count * 3);
    const orientationArray = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      offsetArray[i * 3] = (Math.random() - 0.5) * 10;
      offsetArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
      offsetArray[i * 3 + 2] = (Math.random() - 0.5) * 10;

      scaleArray[i * 3] = Math.random() + 0.5;
      scaleArray[i * 3 + 1] = Math.random() + 0.5;
      scaleArray[i * 3 + 2] = Math.random() + 0.5;

      const quaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      );
      orientationArray[i * 4] = quaternion.x;
      orientationArray[i * 4 + 1] = quaternion.y;
      orientationArray[i * 4 + 2] = quaternion.z;
      orientationArray[i * 4 + 3] = quaternion.w;
    }

    return [offsetArray, scaleArray, orientationArray];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        offsetArray[i * 3],
        offsetArray[i * 3 + 1],
        offsetArray[i * 3 + 2]
      );
      dummy.scale.set(
        scaleArray[i * 3],
        scaleArray[i * 3 + 1],
        scaleArray[i * 3 + 2]
      );
      dummy.quaternion.set(
        orientationArray[i * 4],
        orientationArray[i * 4 + 1],
        orientationArray[i * 4 + 2],
        orientationArray[i * 4 + 3]
      );
      dummy.rotation.y = time * (0.1 + 0.5 * Math.random());
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-offset"
          args={[offsetArray, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-scale"
          args={[scaleArray, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-orientation"
          args={[orientationArray, 4]}
        />
      </boxGeometry>
      <shaderMaterial attach="material" args={[shader]} />
    </instancedMesh>
  );
};

// import React, { useRef, useMemo } from 'react'
// import { useFrame } from '@react-three/fiber'
// import * as THREE from 'three'

// // ... previous vertex and fragment shader code ...

// function InstancedMeshWithShader({ count = 1000 }) {
//   const mesh = useRef()
//   const dummy = useMemo(() => new THREE.Object3D(), [])

//   const shader = useMemo(() => {
//     return {
//       uniforms: {
//         color: { value: new THREE.Color('purple') }
//       },
//       vertexShader,
//       fragmentShader
//     }
//   }, [])

//   const [offsetArray, scaleArray, orientationArray] = useMemo(() => {
//     // ... previous array initialization code ...
//   }, [count])

//   // ... previous useFrame code ...

//   return (
//     <instancedMesh ref={mesh} args={[null, null, count]}>
//       <boxGeometry args={[1, 1, 1]}>
//         <instancedBufferAttribute
//           attach="attributes-offset"
//           args={[offsetArray, 3]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-scale"
//           args={[scaleArray, 3]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-orientation"
//           args={[orientationArray, 4]}
//         />
//       </boxGeometry>
//       <shaderMaterial attach="material" args={[shader]} />
//     </instancedMesh>
//   )
// }

// export default InstancedMeshWithShader
