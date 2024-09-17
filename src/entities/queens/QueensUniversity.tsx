import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

const QueensUniversity = () => {
  const { scene, materials } = useGLTF("./3d/QueensUniversity.glb");

  useEffect(() => {
    // Assuming your material has an emissiveMap (from Blender lightmap)
    const material = materials["Material #15.001"] as any;

    console.log(materials);
    if (material && material.emissiveMap) {
      console.log("Setting lightMap");
      // Assign emissiveMap as the lightMap
      //material.lightMap = material.emissiveMap;
      material.emissiveMap = undefined;
      material.lightMapIntensity = 0.5; // Adjust if needed

      // Ensure the material updates
      material.needsUpdate = true;
    }
  }, [materials]);

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
