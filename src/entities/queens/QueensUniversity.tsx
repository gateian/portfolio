import { useAppState } from "../../hooks/useAppState";
import GlbModelPrimitive from "../glbModel/glbModelPrimitive";
import { useLocation } from "react-router-dom";

const QueensUniversity = () => {
  const { environmentMap } = useAppState();
  const location = useLocation();

  // const modifyMaterial = useCallback(
  //   (material: MeshPhysicalMaterial) => {
  //     material.aoMap = material.emissiveMap;
  //     material.aoMapIntensity = 1;
  //     material.emissive = new Color(0x000000);
  //     material.envMap = environmentMap;
  //     material.envMapIntensity = 2;
  //     material.reflectivity = 1;
  //     material.color = new Color(0xffffff);
  //     material.metalness = 1;
  //     material.vertexColors = false;
  //     material.roughness = 0.8;
  //     material.needsUpdate = true;
  //   },
  //   [environmentMap]
  // );

  // const onLoadedHandler = (data: GlbOnLoadedData) => {
  //   Object.values(data.materials).forEach((material) => {
  //     if (material instanceof MeshPhysicalMaterial) {
  //       modifyMaterial(material);
  //     }

  //     data.glbModel.traverse((child) => {
  //       if (child.isObject3D) {
  //         child.castShadow = true;
  //         child.receiveShadow = true;
  //       }
  //     });
  //   });
  // };

  return (
    <>
      {environmentMap ? (
        <GlbModelPrimitive
          position={[0, 0, -40]}
          rotation={[0, Math.PI * 0.5, 0]}
          scale={[1, 1, 1]}
          castShadow
          receiveShadow
          visible={location.pathname == "/queens"}
        />
      ) : null}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" opacity={0.5} />
      </mesh>
    </>
  );
};

export default QueensUniversity;
