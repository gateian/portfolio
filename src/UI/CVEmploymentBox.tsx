import styled from "@emotion/styled";
import { Column, EmploymentHistoryItem, List, Row } from "./CV";

const TitleBanner = styled.div`
  display: flex;
  flex-direction: row;
  background-color: white;
  color: black;
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
          <div>{props.employment.role}</div>
        </Column>
      </Row>
      <List>
        {props.employment.description.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </List>
    </>
  );
};

export default CVEmploymentBox;
