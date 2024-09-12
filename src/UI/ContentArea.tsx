import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import styled from "@emotion/styled";
import React, { ReactNode } from "react";

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
  return (
    <ContentWrapper>
      <ArrowLeft />
      <CentreSpace>{children}</CentreSpace>
      <ArrowRight />
    </ContentWrapper>
  );
};

export default ContentArea;
