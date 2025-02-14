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
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  fontSize: '0.75rem',
  height: '100%',
});

export const Section = styled.div({
  width: '100%',
  padding: '0',
  boxSizing: 'border-box',
  display: 'flex',
});

export const SectionDark = styled.div({
  backgroundColor: '#333333',
  color: 'white',
  padding: '1rem',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
  marginBottom: '1rem',
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
  color: 'white',
});

export const EduDate = styled.div({
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 100,
});

interface ColumnProps {
  type?: 'dark' | 'light';
}

export const Column = styled.div<ColumnProps>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '1rem',
  flexGrow: 1,
  backgroundColor: props.type === 'dark' ? '#333333' : 'white',
  color: props.type === 'dark' ? 'white' : 'black',
}));

export const ColumnLeft = styled.div({
  backgroundColor: '#333333',
  color: 'white',
  width: '40%',
  paddingLeft: '1rem',
});

export const ColumnRight = styled.div({
  backgroundColor: 'white',
  color: 'black',
  width: '60%',
  padding: '1rem 0',
  '& p': {
    fontSize: '0.75rem',
  },
});

export const SuperTitle = styled.div({
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  fontSize: '2.5rem',
  margin: '1rem 1rem 0 1rem',
  textAlign: 'left',
  height: '50px',
});

export const SuperSubTitle = styled.h3({
  margin: '0 1rem',
  fontFamily: '"Zuume", sans-serif',
  fontSize: '1.2rem',
  fontWeight: 300,
  fontStyle: 'italic',
  position: 'relative',
  top: '-0.5rem',
});

interface TitleProps {
  type?: 'dark' | 'light';
}

export const Title = styled.h2<TitleProps>((props) => ({
  color: props.type == 'dark' ? 'white' : 'black',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontStyle: 'italic',
  marginTop: '20px',
  marginBottom: '0',
}));

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

export const SubList = styled.ul({
  listStyleType: 'square',
  padding: 0,
  margin: '2rem',
  '& li': {
    margin: 0,
  },
  marginTop: '0.5rem',
});

export const SkillsTitle = styled.div({
  color: 'white',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontStyle: 'italic',
  marginTop: '20px',
  marginLeft: '20px',
  fontSize: '1.5rem',
});

export const TitleBanner = styled.div({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: '#333',
  color: 'white',
  lineHeight: '2rem',
  justifyContent: 'space-between',
  padding: '5px 10px',
});

export const Role = styled.div({
  lineHeight: '2rem',
  padding: '5px 10px',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  fontSize: '1.5rem',
});

export const SkillsBox = styled.div({
  backgroundColor: '#333333',
  color: 'white',
  padding: '0.5rem 1rem',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
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
  border: '2px solid white',
  padding: '0.5rem',
  '& b': {
    fontWeight: 400,
  },
});

export const DownloadButton = styled.button({
  backgroundColor: '#333333',
  color: 'white',
  padding: '0.5rem',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 100,
  borderRadius: 0,
  border: 'none',
  cursor: 'pointer',
  marginBottom: '1rem',
  position: 'absolute',
  top: '0px',
  right: '20px',
  pointerEvents: 'auto',
  '&:hover': {
    backgroundColor: '#444444',
  },
});

export const Years = styled.span({
  fontSize: '0.5rem',
  fontWeight: 100,
});

interface TabProps {
  indent: number;
}

export const Tab = styled.div<TabProps>((props) => ({
  position: 'relative',
  left: props.indent * 10 + 'px',
}));

export const SkillsCategory = styled.span({
  fontWeight: 300,
  fontSize: '0.75rem',
});

export const SkillsItem = styled.span({
  fontWeight: 200,
  fontSize: '0.75rem',
  color: 'orange',
});
