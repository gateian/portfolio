import styled from "@emotion/styled";

const CVWrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.div`
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.4);
`;

const Row = styled(Section)`
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: center;
`;

const Column = styled(Section)`
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: top;
  justify-content: top;
`;

const Title = styled.h2`
  color: white;
`;

const SubTitle = styled.h3`
  color: white;
`;

const CV = () => {
  return (
    <CVWrapper>
      <Row>
        <Column>
          <Title>Technical Skills</Title>
          <SubTitle>Web</SubTitle>
        </Column>
        <Column>
          <Title>About Me</Title>
        </Column>
      </Row>
      <Section>
        <Title>Employment History</Title>
      </Section>
      <Section>
        <Column>
          <Title>Education</Title>
        </Column>
        <Column>
          <Title>Interests and Achievements</Title>
        </Column>
      </Section>
    </CVWrapper>
  );
};

export default CV;
