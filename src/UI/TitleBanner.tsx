import styled from "@emotion/styled";

const TitleBannerWrapper = styled.div({
  fontSize: "4rem",
  fontWeight: 100,
  margin: 0,
  textAlign: "center",
  fontFamily: '"Zuume", sans-serif',
  textTransform: "uppercase",
  backgroundColor: "rgba(0, 0, 0, 0)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  marginTop: "40px",
});

const NamePlate = styled.div({
  fontSize: "8rem",
  border: "4px solid white",
  lineHeight: 1,
  padding: "0.5rem 2rem 0rem 2rem",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  textShadow: "0px 0px 6px rgba(0,0,0,0.8)",

});

const SubTitle = styled.div({
  fontSize: "2rem",
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontStyle: "normal",
  textShadow: "0px 0px 6px rgba(0,0,0,1.0)",
});

const TitleBanner = () => {
  return (
    <TitleBannerWrapper>
      <NamePlate>Ian Hamblin</NamePlate>
      <SubTitle>3D Graphics Specialist</SubTitle>
    </TitleBannerWrapper>
  );
};

export default TitleBanner;
