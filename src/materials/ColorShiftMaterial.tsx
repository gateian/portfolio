import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

export const ColorShiftMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.2, 0.0, 0.1) },

  // vertex shader
  //*glsl*/ `
  //       varying vec2 vUv;
  //       void main() {
  //         vUv = uv;
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       }
  //     `,
  //   // fragment shader
  //   /*glsl*/ `
  //       uniform float time;
  //       uniform vec3 color;
  //       varying vec2 vUv;
  //       void main() {
  //         // gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + 6.0) + color, 1.0);
  //         gl_FragColor = vec4(color, 1.0);
  //       }
  //     `
  // vertex shader
  /*glsl*/ `
  attribute vec3 instancePosition;
  attribute vec4 instanceQuaternion;
  varying vec2 vUv;
  
  vec3 applyQuaternionToVector(vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
  }

  void main() {
    vUv = uv;
    vec3 transformed = applyQuaternionToVector(instanceQuaternion, position) + instancePosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`,
  // fragment shader
  /*glsl*/ `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
`
);
