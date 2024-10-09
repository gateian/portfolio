import styled from "@emotion/styled";
import { Column, EmploymentHistoryItem, List, Row } from "./CV";

const TitleBanner = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #333;
  color: white;
  border-radius: 10px;
  line-height: 2rem;
  justify-content: space-between;
  padding: 5px 10px;
`;

const Role = styled.div`
  line-height: 2rem;
  padding: 5px 10px;
  font-family: "Kanit", sans-serif;
  font-weight: 200;
  font-size: 1.5rem;
`;

const SubList = styled(List)`
  margin-top: 2rem;
`;

const CVEmploymentBox = (props: { employment: EmploymentHistoryItem }) => {
  return (
    <>
      <Row>
        <Column>
          <TitleBanner>
            <div>{props.employment.company}</div>
            <div>{props.employment.dates}</div>
          </TitleBanner>
        </Column>
        <Column>
          <Role>{props.employment.role}</Role>
        </Column>
      </Row>
      <SubList>
        {props.employment.description.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </SubList>
    </>
  );
};

export default CVEmploymentBox;
