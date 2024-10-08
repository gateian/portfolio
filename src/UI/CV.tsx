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

const List = styled.ul`
  list-style-type: square;
`;

const CV = () => {
  return (
    <CVWrapper>
      <Row>
        <Column>
          <Title>Technical Skills</Title>
          <SubTitle>Web</SubTitle>
          <List>
            <li>Typescript / React / Sass / Emotion / MUI / Apollo</li>
            <li>Three.js / React Three Fiber / Mapbox / Cesium</li>
            <li>AWS / Graphql / git / CI / CD / Docker / Nginx / apache</li>
          </List>
          <SubTitle>Apps and Games</SubTitle>
          <List>
            <li>AR / VR / Unity c# / Android Java / Kotlin / ios</li>
          </List>
          <SubTitle>3D</SubTitle>
          <List>
            <li>
              Modelling / Rendering / PBR Materials / Texturing / UV Unwrapping
            </li>
          </List>
          <Title>Software / Disciplines</Title>
          <Row>
            <Column>
              <List>
                <li>3ds Max</li>
                <li>Photoshop</li>
                <li>Blender</li>
              </List>
            </Column>
            <Column>2</Column>
          </Row>
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
