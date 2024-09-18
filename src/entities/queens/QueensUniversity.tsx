import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Color, Mesh, MeshStandardMaterial } from "three";

const QueensUniversity = () => {
  const { scene, materials } = useGLTF("./3d/QueensUniversity.glb");

  useEffect(() => {
    if (scene) {
      scene.children.forEach((group) => {
        group.traverse((child) => {
          if (child instanceof Mesh) {
            const material = child.material as MeshStandardMaterial;

            material.lightMap = material.emissiveMap;
            material.emissive = new Color(0x000000);
            material.lightMapIntensity = 20;
            material.metalness = 0.1;
            material.needsUpdate = true;
          }
        });
      });
    }
  }, [materials, scene]);

  return (
    <primitive
      object={scene}
      position={[0, 0, -40]}
      rotation={[0, Math.PI * 0.5, 0]}
      scale={[1, 1, 1]}
    />
  );
};

export default QueensUniversity;
