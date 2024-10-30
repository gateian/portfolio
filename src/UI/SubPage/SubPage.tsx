import { useEffect } from "react";
import { useAppState } from "../../hooks/useAppState";
import { PageWrapper } from "./SubPage.style";
import {
  GlbModelProps,
  GlbModelSettings,
} from "../../entities/glbModel/glbModelPrimitive";
import { Group } from "three";
import { OrbitCameraSettingsProps } from "../../components/CameraMode/CameraMode.types";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
  expand?: boolean;
  glbModelSettings?: GlbModelSettings;
  cameraSettings?: OrbitCameraSettingsProps;
}

const SubPage = (props: SubPageProps) => {
  const {
    subPageDialogId,
    setSubPageDialogId,
    mapMarkers,
    glbModels,
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
    const model = glbModels.get(location.pathname);

    const updatedModel: GlbModelProps = {
      glbModel: model?.glbModel ?? new Group(),
      materials: model?.materials ?? {},
      ...props.glbModelSettings,
    };

    setGlbModels(new Map(glbModels).set(location.pathname, updatedModel));
  }, [setGlbModels, location.pathname]);

  useEffect(() => {
    if (props.cameraSettings) {
      setCameraSettings(props.cameraSettings);
    }
  }, [setCameraSettings]);

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
