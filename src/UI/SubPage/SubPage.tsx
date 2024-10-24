import { useEffect } from "react";
import { useAppState } from "../../hooks/useAppState";
import { PageWrapper } from "./SubPage.style";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
  expand?: boolean;
}

const SubPage = (props: SubPageProps) => {
  const { subPageDialogId, setSubPageDialogId, mapMarkers } = useAppState();

  useEffect(() => {
    return () => {
      // Clear map markers when the component is unmounted
      mapMarkers.forEach((marker) => {
        marker.onClick = undefined;
      });
      setSubPageDialogId(-1);
    };
  }, [mapMarkers, setSubPageDialogId]);

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
