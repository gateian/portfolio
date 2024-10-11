import styled from "@emotion/styled";

interface PageWrapperProps {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  modelView?: boolean;
}

export const PageWrapper = styled.div<PageWrapperProps>`
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${({ backgroundColor }) => backgroundColor || "white"};
  color: ${({ color }) => color || "black"};
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${({ borderRadius }) => borderRadius || "20px"};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  font-family: "Kanit", sans-serif;
  font-weight: 200;
  margin-top: ${({ modelView }) => (modelView ? "85vh" : "50px")};
  min-height: 10vh;

  & h1 {
    font-weight: 100;
    text-align: center;
    text-transform: uppercase;
    font-size: 2rem;
  }

  & p {
    font-size: 1rem;
    font-weight: 100;
    max-width: 800px;
    border: 1px solid white;
  }
`;
