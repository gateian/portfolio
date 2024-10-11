import styled from "@emotion/styled";

export const MenuWrapper = styled.div`
  padding: 1rem;
  z-index: 100;
  pointer-events: auto;
  position: relative;
`;

export const MenuIcon = styled.img`
  width: 50px;
  height: auto;
  cursor: pointer;
  fill: white;
`;

export const MenuPopout = styled.div`
  width: 200px;
  min-height: 50px;
  background-color: white;
  color: black;
  position: absolute;
  right: 0;
`;
