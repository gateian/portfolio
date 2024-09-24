import { DirectionalLightHelper, DirectionalLight } from "three";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { isDebugMode } from "../../utils/generalUtils";

const DirectionalLightWithHelper = () => {
  const debug = isDebugMode();

  const lightRef = useRef<DirectionalLight>(null);
  const helperRef = useRef<DirectionalLightHelper>();
  const { scene } = useThree();

  useEffect(() => {
    if (debug && lightRef.current && !helperRef.current) {
      helperRef.current = new DirectionalLightHelper(lightRef.current, 5);
      scene.add(helperRef.current);
    }
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
      }
    };
  }, [scene, debug]);

  return (
    <directionalLight
      ref={lightRef}
      position={[-9, 15, 15]}
      intensity={2}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
  );
};

export default DirectionalLightWithHelper;
