import styled from '@emotion/styled';

export const CVWrapper = styled.div({
  margin: 0,
  padding: 0,
  width: '100%',
  backgroundColor: 'white',
  overflow: 'auto',
  color: 'black',
  pointerEvents: 'all',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '20px',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  fontSize: '0.75rem',
  height: '100%',
});

export const Section = styled.div({
  width: '100%',
  padding: '0 30px',
  boxSizing: 'border-box',
});

export const SectionRight = styled(Section)({
  textAlign: 'right',
});

export const Row = styled(Section)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '2rem',
  padding: 0,
  margin: 0,
});

export const SubRow = styled(Row)({
  margin: '0.5rem 0',
});

export const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  flexGrow: 1,
});

export const SuperTitle = styled.div({
  color: 'black',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  fontSize: '3rem',
  margin: '0',
  textAlign: 'left',
  height: '50px',
});

export const SuperSubTitle = styled.h3({
  color: 'black',
  margin: 0,
  fontFamily: '"Zuume", sans-serif',
  fontSize: '1.54rem',
  fontWeight: 300,
  fontStyle: 'italic',
});

export const Title = styled.h2({
  color: 'black',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontStyle: 'italic',
  margin: '20px 0',
});

export const SubTitle = styled.h3({
  color: 'black',
  margin: 0,
  fontFamily: '"Zuume", sans-serif',
});

export const List = styled.ul({
  listStyleType: 'square',
  padding: 0,
  margin: '2rem',
  marginTop: 0,
  '& li': {
    margin: 0,
  },
});

export const SkillsBox = styled.div({
  backgroundColor: '#333333',
  color: 'white',
  padding: '1rem',
  borderRadius: '10px',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
  marginBottom: '1rem',
  minWidth: '40vw',
  '& h3': {
    color: 'white',
    textTransform: 'uppercase',
  },
});

export const EducationBox = styled.div({
  backgroundColor: '#333333',
  color: 'white',
  padding: '1rem',
  borderRadius: '10px',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
  marginBottom: '1rem',
  '& h3': {
    color: 'white',
    textTransform: 'uppercase',
  },
});

export const ContactDetails = styled.div({
  margin: '1rem',
  fontSize: '0.75rem',
  position: 'relative',
  left: '1rem',
  '& b': {
    fontWeight: 400,
  },
});

export const DownloadButton = styled.button({
  backgroundColor: '#333333',
  color: 'white',
  padding: '1rem',
  borderRadius: '0px 0px 10px 10px',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
  border: 'none',
  cursor: 'pointer',
  marginBottom: '1rem',
  position: 'absolute',
  top: '0px',
  right: '50px',
  pointerEvents: 'auto',
  '&:hover': {
    backgroundColor: '#444444',
  },
});
