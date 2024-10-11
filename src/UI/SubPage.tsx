import { useEffect } from "react";
import { useAppState } from "../hooks/useAppState";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
}

const SubPage = (props: SubPageProps) => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    if (props.objectIndex != null) {
      setSelectedObject(props.objectIndex ?? 0);
    }
  }, [setSelectedObject, props.objectIndex]);

  return (
    <>
      <h1>{props.title}</h1>

      <div>{props.children}</div>
    </>
  );
};

export default SubPage;