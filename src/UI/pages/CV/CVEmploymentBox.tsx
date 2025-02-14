import { Column, Row, SubList, TitleBanner } from './CV.styles';
import { EmploymentHistoryItem } from './CVInterfaces';

function CVEmploymentBox(props: { employment: EmploymentHistoryItem }) {
  return (
    <>
      <Row>
        <Column>
          <TitleBanner>
            <div>
              {props.employment.company} - {props.employment.role}
            </div>
            <div>{props.employment.dates}</div>
          </TitleBanner>
        </Column>
        {/* <Column>
          <Role>{props.employment.role}</Role>
        </Column> */}
      </Row>
      <SubList>
        {props.employment.description.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </SubList>
    </>
  );
}

export default CVEmploymentBox;
