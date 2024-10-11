import { useEffect } from "react";
import { useAppState } from "../../hooks/useAppState";
import { PageWrapper } from "./SubPage.style";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
}

const SubPage = (props: SubPageProps) => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    if (props.objectIndex != null) {
      setSelectedObject(props.objectIndex ?? 0);
    }
  }, [setSelectedObject, props.objectIndex]);

  return (
    <PageWrapper modelView={props.modelView}>
      <h1>{props.title}</h1>

      <div>{props.children}</div>
    </PageWrapper>
  );
};

export default SubPage;
