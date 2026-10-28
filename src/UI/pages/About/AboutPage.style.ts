import styled from '@emotion/styled';
import { MEDIA_WIDTH_LARGE } from '../../Theme';

const LINE = 'rgba(255, 255, 255, 0.22)';
const MUTED = 'rgba(255, 255, 255, 0.62)';

const heading = {
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  lineHeight: 1,
  margin: 0,
};

export const Intro = styled.header<{ hasPhoto: boolean }>(({ hasPhoto }) => ({
  display: 'grid',
  gridTemplateColumns: hasPhoto ? 'minmax(12rem, 20rem) 1fr' : '1fr',
  gap: 'clamp(1.5rem, 4vw, 3.5rem)',
  alignItems: 'end',
  padding: 'clamp(2.5rem, 9vh, 6rem) 0 clamp(2rem, 6vh, 3.5rem)',
  borderBottom: `1px solid ${LINE}`,
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    gridTemplateColumns: '1fr',
    alignItems: 'start',
  },
}));

/** Thin-framed portrait; the frame only renders once the photo has loaded. */
export const Photo = styled.figure({
  margin: 0,
  border: '1px solid rgba(255, 255, 255, 0.75)',
  padding: '0.5rem',
  maxWidth: '20rem',
  '& img': {
    display: 'block',
    width: '100%',
    aspectRatio: '4 / 5',
    objectFit: 'cover',
    filter: 'grayscale(0.15)',
  },
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: { maxWidth: '14rem' },
});

export const Name = styled.h1({
  ...heading,
  fontSize: 'clamp(3.2rem, 10vw, 7rem)',
});

export const Tagline = styled.p({
  ...heading,
  fontWeight: 300,
  fontSize: 'clamp(1.2rem, 2.6vw, 1.75rem)',
  letterSpacing: '0.1em',
  color: MUTED,
  marginTop: '0.6rem',
});

export const Lede = styled.p({
  margin: '1.5rem 0 0',
  maxWidth: '42rem',
  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
  color: 'rgba(255, 255, 255, 0.92)',
});

export const Prose = styled.div({
  maxWidth: '46rem',
  marginTop: '1.5rem',
  '& a': {
    color: '#fff',
    textDecorationColor: 'rgba(140, 220, 255, 0.35)',
    textUnderlineOffset: '0.2em',
  },
  '& a:hover': { textDecorationColor: 'rgba(140, 220, 255, 1)' },
  '& p': { margin: '0 0 1.1rem' },
  '& strong': { fontWeight: 400, color: '#fff' },
});

export const SkillGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
  gap: '1.75rem 2rem',
});

export const SkillGroupTitle = styled.h3({
  ...heading,
  fontSize: '1.15rem',
  letterSpacing: '0.12em',
  color: MUTED,
  paddingBottom: '0.5rem',
  marginBottom: '0.75rem',
  borderBottom: `1px solid ${LINE}`,
});

export const LinkGrid = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(10.5rem, 1fr))',
  marginTop: '1.5rem',
  borderTop: `1px solid ${LINE}`,
  borderLeft: `1px solid ${LINE}`,
});

const linkCell = {
  display: 'block',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as const,
  padding: '1rem 1.1rem',
  color: '#fff',
  textDecoration: 'none',
  textAlign: 'left' as const,
  background: 'none',
  border: 'none',
  borderRight: `1px solid ${LINE}`,
  borderBottom: `1px solid ${LINE}`,
  cursor: 'pointer',
  font: 'inherit',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: LINE,
  },
  '&:focus-visible': { outline: '1px solid #fff', outlineOffset: '-1px' },
  '& .k': {
    display: 'block',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: MUTED,
  },
  '& .v': {
    ...heading,
    display: 'block',
    fontSize: '1.6rem',
    marginTop: '0.35rem',
  },
};

export const LinkCellStyle = linkCell;
export const LinkCellA = styled.a(linkCell);
export const LinkCellButton = styled.button(linkCell, {
  // Buttons centre their content vertically; match the anchor cells.
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 0,
  textAlign: 'left',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  font: 'inherit',
  margin: 0,
  '&:focus:not(:focus-visible)': { outline: 'none' },
});

export const Looking = styled.ul({
  margin: '1.5rem 0 0',
  padding: 0,
  listStyle: 'none',
  maxWidth: '46rem',
  '& li': {
    padding: '0.6rem 0 0.6rem 1.1rem',
    borderLeft: `1px solid ${LINE}`,
    marginBottom: '0.5rem',
  },
});
