import styled from "@emotion/styled";

export const CVWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: white;
  color: black;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  font-family: "Kanit", sans-serif;
  font-weight: 200;
`;

export const Section = styled.div`
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
`;

export const SectionRight = styled(Section)`
  text-align: right;
`;

export const Row = styled(Section)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  padding: 0;
  margin: 0;
`;

export const SubRow = styled(Row)`
  margin: 0.5rem 0;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  flex-grow: 1;
`;

export const Title = styled.h2`
  color: black;
  font-family: "Kanit", sans-serif;
  font-weight: 200;
  margin: 20px 0;
`;

export const SubTitle = styled.h3`
  color: black;
  margin: 0;
  font-family: "Kanit", sans-serif;
`;

export const List = styled.ul`
  list-style-type: square;
  padding: 0;
  margin: 2rem;
  margin-top: 0;
  & li {
    margin: 0;
  }
`;

export const SkillsBox = styled.div`
  background-color: #333333;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  font-family: "Kanit", sans-serif;
  font-weight: 100;

  margin-bottom: 1rem;
  & h3 {
    color: white;
    text-transform: uppercase;
  }
`;

export const DownloadButton = styled.button`
  background-color: #333333;
  color: white;
  padding: 1rem;
  border-radius: 0px 0px 10px 10px;
  font-family: "Kanit", sans-serif;
  font-weight: 100;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
  position: absolute;
  top: 0;
  right: 50px;
  pointer-events: auto;
  &:hover {
    background-color: #444444;
  }
`;
