import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import styled from "@emotion/styled";
import React, { ReactNode, useCallback } from "react";
import { useAppState } from "../StateProvider";

const ContentWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CentreSpace = styled.div`
  flex-grow: 1;
  align-self: flex-end;
`;

const arrowStyle = `
    color: rgba(255, 255, 255, 0.4);
    font-size: 4rem;
    padding: 0 4rem;
    pointer-events: auto;
    transition: transform 0.2s ease;
  
    &:hover {
        transform: scale(1.3);
        cursor: pointer;
    }
    `;

const ArrowLeft = styled(FaArrowLeft)`
  ${arrowStyle}
`;

const ArrowRight = styled(FaArrowRight)`
  ${arrowStyle}
`;

interface ContentAreaProps {
  children?: ReactNode;
}

const ContentArea: React.FC<ContentAreaProps> = ({ children }) => {
  const { selectedObject, setSelectedObject, objectCount } = useAppState();

  const arrowClickHander = useCallback(
    (direction: "left" | "right") => {
      let newSelectedObject = 0;

      const operation = direction === "left" ? -1 : 1;

      newSelectedObject = selectedObject + operation;
      if (newSelectedObject < 0) {
        newSelectedObject = objectCount - 1;
      } else if (newSelectedObject >= objectCount) {
        newSelectedObject = 0;
      }

      setSelectedObject(newSelectedObject);
    },
    [selectedObject, setSelectedObject]
  );

  return (
    <ContentWrapper>
      <ArrowLeft onClick={() => arrowClickHander("left")} />
      <CentreSpace>{children}</CentreSpace>
      <ArrowRight onClick={() => arrowClickHander("right")} />
    </ContentWrapper>
  );
};

export default ContentArea;
