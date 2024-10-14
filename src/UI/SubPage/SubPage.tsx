import { useAppState } from "../../hooks/useAppState";
import { PageWrapper } from "./SubPage.style";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
  disableExpand?: boolean;
}

const SubPage = (props: SubPageProps) => {
  const { subPageDialogId, mapMarkers } = useAppState();

  return (
    <>
      <PageWrapper modelView={props.modelView}>
        <h1>{props.title}</h1>
        <div>{props.children}</div>
      </PageWrapper>
      {subPageDialogId > 0
        ? mapMarkers[subPageDialogId - 1].dialogContent
        : null}
    </>
  );
};

export default SubPage;
