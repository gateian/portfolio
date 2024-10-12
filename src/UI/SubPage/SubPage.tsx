import { useEffect, useState } from "react";
import { useAppState } from "../../hooks/useAppState";
import { ExpandMoreButton, PageWrapper } from "./SubPage.style";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  objectIndex?: number;
  modelView?: boolean;
  disableExpand?: boolean;
}

const SubPage = (props: SubPageProps) => {
  const { setSelectedObject } = useAppState();
  const [expanded, setExpanded] = useState(props.disableExpand ?? false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (props.objectIndex != null) {
      setSelectedObject(props.objectIndex ?? 0);
    }
  }, [setSelectedObject, props.objectIndex]);

  return (
    <PageWrapper modelView={props.modelView} expanded={expanded}>
      <h1>{props.title}</h1>
      <div>{props.children}</div>
      {!props.disableExpand ? (
        <ExpandMoreButton onClick={handleExpandClick} expanded={expanded}>
          <ExpandMoreIcon />
        </ExpandMoreButton>
      ) : null}
    </PageWrapper>
  );
};

export default SubPage;
