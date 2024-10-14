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
      position={[900, 1500, 1500]}
      intensity={2}
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-camera-far={5000}
      shadow-camera-left={-1000}
      shadow-camera-right={1000}
      shadow-camera-top={1000}
      shadow-camera-bottom={-1000}
      castShadow
    />
  );
};

export default DirectionalLightWithHelper;
