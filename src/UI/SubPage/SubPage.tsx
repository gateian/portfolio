import { useEffect } from "react";
import { useAppState } from "../../hooks/useAppState";
import { PageWrapper } from "./SubPage.style";
import {
  GlbModelProps,
  GlbModelSettings,
  GlbOnLoadedData,
} from "../../entities/glbModel/glbModelPrimitive";
import { OrbitCameraSettingsProps } from "../../components/CameraMode/CameraMode.types";
import { Material } from "three";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
  expand?: boolean;
  glbModelSettings?: GlbModelSettings;
  onGlbLoadedData?: (data: GlbOnLoadedData) => void;
  onMaterialReady?: (material: Material) => void;
  cameraSettings?: OrbitCameraSettingsProps;
  gltfMaterialsProcessed?: boolean;
}

const SubPage = (props: SubPageProps) => {
  const {
    subPageDialogId,
    setSubPageDialogId,
    mapMarkers,
    setGlbModels,
    setCameraSettings,
  } = useAppState();

  useEffect(() => {
    return () => {
      // Clear map markers when the component is unmounted
      mapMarkers.forEach((marker) => {
        marker.onClick = undefined;
      });
      setSubPageDialogId(-1);
    };
  }, [mapMarkers, setSubPageDialogId]);

  useEffect(() => {
    setGlbModels(((prevModels: Map<string, GlbModelProps>) => {
      const model = prevModels.get(location.pathname);

      const updatedModel: GlbModelProps = {
        glbModel: model?.glbModel,
        materials: model?.materials,
        loading: model?.loading ?? false,
        onGlbLoadedData: props.onGlbLoadedData,
        onMaterialReady: props.onMaterialReady,
        ...props.glbModelSettings,
      };

      const newModels = new Map(prevModels);
      newModels.set(location.pathname, updatedModel);
      return newModels;
    }) as unknown as Map<string, GlbModelProps>);
  }, [
    setGlbModels,
    props.glbModelSettings,
    props.onGlbLoadedData,
    props.onMaterialReady,
  ]);

  useEffect(() => {
    if (props.cameraSettings) {
      setCameraSettings(props.cameraSettings);
    }
  }, [props.cameraSettings, setCameraSettings]);

  return (
    <>
      <PageWrapper modelView={props.modelView} expanded={props.expand}>
        <h1>{props.title}</h1>
        <div>{props.children}</div>
      </PageWrapper>
      {subPageDialogId >= 0 && mapMarkers[subPageDialogId]?.dialogContent
        ? mapMarkers[subPageDialogId].dialogContent
        : null}
    </>
  );
};

export default SubPage;
