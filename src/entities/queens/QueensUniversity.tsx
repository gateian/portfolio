import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { Color, Mesh, MeshStandardMaterial } from "three";
import { useAppState } from "../../StateProvider";

const QueensUniversity = () => {
  const { scene, materials } = useGLTF("./3d/QueensUniversity.glb");
  const { environmentMap } = useAppState();

  useEffect(() => {
    if (scene && environmentMap) {
      scene.children.forEach((group) => {
        group.traverse((child) => {
          if (child instanceof Mesh) {
            const material = child.material as MeshStandardMaterial;

            material.lightMap = material.emissiveMap;
            material.emissive = new Color(0x000000);
            material.envMap = environmentMap;
            material.envMapIntensity = 1;
            material.color = new Color(0xcccccc);
            material.lightMapIntensity = 20;
            material.metalness = 0.7;
            material.needsUpdate = true;
            material.vertexColors = false;
            material.roughness = 0.3;
          }
        });
      });
    }
  }, [materials, scene, environmentMap]);

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
