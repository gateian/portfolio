import styled from "@emotion/styled";

const TitleBannerWrapper = styled.div({
  fontSize: "2rem",
  fontWeight: 100,
  margin: 0,
  textAlign: "center",
  fontFamily: '"Kanit", sans-serif',
  letterSpacing: "0.5em",
  textTransform: "uppercase",
  backgroundColor: "rgba(0, 0, 0, 0)",
  borderBottom: "0.5px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  justifyContent: "center",
});

const NamePlate = styled.div({
  fontSize: "4rem",
  lineHeight: 1.3,
});

const SubTitle = styled.div({
  fontSize: "0.6rem",
  fontFamily: '"Kulim Park", sans-serif',
  fontWeight: 500,
});

const TitleBanner = () => {
  return (
    <TitleBannerWrapper>
      <NamePlate>Ian Hamblin</NamePlate>
      <SubTitle>Web | 3D | Programmer</SubTitle>
    </TitleBannerWrapper>
  );
};

export default TitleBanner;
