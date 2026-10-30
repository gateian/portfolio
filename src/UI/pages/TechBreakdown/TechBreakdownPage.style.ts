import styled from '@emotion/styled';
import { MEDIA_WIDTH_LARGE } from '../../Theme';

const ACCENT = 'rgba(140, 220, 255, 1)';
const ACCENT_SOFT = 'rgba(140, 220, 255, 0.35)';
const LINE = 'rgba(255, 255, 255, 0.22)';
const MUTED = 'rgba(255, 255, 255, 0.62)';
const NARROW = `(max-width: ${MEDIA_WIDTH_LARGE})`;

const heading = {
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  lineHeight: 1,
  margin: 0,
};

/* Page shell ------------------------------------------------------------- */

export const Page = styled.main({
  position: 'fixed',
  inset: 0,
  zIndex: 5,
  overflowY: 'auto',
  overflowX: 'hidden',
  pointerEvents: 'auto',
  backgroundColor: '#000',
  color: '#fff',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  fontSize: '1rem',
  lineHeight: 1.6,
  userSelect: 'text',
  '&:focus': { outline: 'none' },
  WebkitUserSelect: 'text',
  scrollBehavior: 'smooth',
  '@media (prefers-reduced-motion: reduce)': {
    scrollBehavior: 'auto',
  },
});

export const TopBar = styled.nav({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem clamp(1rem, 4vw, 2.5rem)',
  // Room for the fixed site menu toggle, which sits inside this bar.
  paddingRight: '4.75rem',
  backgroundColor: 'rgba(0, 0, 0, 0.72)',
  '@media (max-width: 600px)': { paddingRight: '4rem' },
  backdropFilter: 'blur(6px)',
  borderBottom: `1px solid ${LINE}`,
});

export const TopBarLabel = styled.span({
  ...heading,
  fontSize: '1.1rem',
  color: MUTED,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // Phones: the back button and menu toggle need the room.
  '@media (max-width: 480px)': { display: 'none' },
});

export const OutlineButton = styled.button({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexShrink: 0,
  minHeight: '2.5rem',
  padding: '0.4rem 1rem',
  border: '1px solid rgba(255, 255, 255, 0.75)',
  background: 'rgba(255, 255, 255, 0.04)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '1rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  transition: 'background-color 0.2s ease',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
  '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' },
});

export const Inner = styled.div({
  width: '100%',
  maxWidth: '72rem',
  margin: '0 auto',
  padding: '0 clamp(1rem, 4vw, 2.5rem)',
  boxSizing: 'border-box',
});

/* Hero ------------------------------------------------------------------- */

export const Hero = styled.header({
  position: 'relative',
  width: '100%',
  height: 'min(72vh, 46rem)',
  minHeight: '22rem',
  overflow: 'hidden',
  borderBottom: `1px solid ${LINE}`,
});

const heroMedia = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#000',
} as const;

export const HeroVideo = styled.video(heroMedia);

export const HeroImage = styled.img(heroMedia);

export const HeroShade = styled.div({
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0) 70%)',
});

export const HeroText = styled.div({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  paddingBottom: 'clamp(1.25rem, 5vh, 3rem)',
});

export const Kicker = styled.div({
  ...heading,
  fontSize: '1rem',
  letterSpacing: '0.14em',
  color: ACCENT,
  marginBottom: '0.5rem',
});

export const HeroTitle = styled.h1({
  ...heading,
  fontSize: 'clamp(2.6rem, 8vw, 5.5rem)',
  textShadow: '0 0 12px rgba(0,0,0,0.8)',
});

export const HeroSummary = styled.p({
  margin: '0.9rem 0 0',
  maxWidth: '44rem',
  fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
  color: 'rgba(255, 255, 255, 0.9)',
  textShadow: '0 0 8px rgba(0,0,0,0.9)',
});

export const LinkRow = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  marginTop: '1rem',
});

export const TextLink = styled.a({
  color: '#fff',
  textDecorationColor: ACCENT_SOFT,
  textUnderlineOffset: '0.2em',
  '&:hover': { textDecorationColor: ACCENT },
  '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' },
});

/* Sections --------------------------------------------------------------- */

export const Section = styled.section({
  padding: 'clamp(2.5rem, 7vh, 4.5rem) 0',
  borderBottom: `1px solid ${LINE}`,
  scrollMarginTop: '3.5rem',
  // Focused programmatically after a diagram jump; no ring needed.
  '&:focus': { outline: 'none' },
});

export const SectionTitle = styled.h2({
  ...heading,
  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
  marginBottom: '0.4rem',
});

export const SectionIntro = styled.p({
  margin: '0 0 1.75rem',
  maxWidth: '46rem',
  color: MUTED,
});

/* Pipeline diagram ------------------------------------------------------- */

export const Diagram = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  [`@media ${NARROW}`]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export const Lane = styled.div<{ grow?: number }>(({ grow = 1 }) => ({
  flex: `${grow} 1 0`,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
}));

export const LaneRow = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  gap: '0.4rem',
  [`@media ${NARROW}`]: {
    flexDirection: 'column',
  },
});

export const Outputs = styled.div({
  flex: '2 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  paddingLeft: '0.75rem',
  borderLeft: `1px solid ${LINE}`,
  [`@media ${NARROW}`]: {
    paddingLeft: 0,
    borderLeft: 'none',
  },
});

export const LaneLabel = styled.div({
  ...heading,
  fontSize: '0.85rem',
  letterSpacing: '0.14em',
  color: MUTED,
  [`@media ${NARROW}`]: { marginTop: '0.75rem' },
});

export type NodeTone = 'source' | 'warm' | 'cool';

export const NodeButton = styled.button<{ tone: NodeTone }>(({ tone }) => ({
  position: 'relative',
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.15rem',
  width: '100%',
  minHeight: '4.2rem',
  padding: '0.6rem 0.8rem',
  boxSizing: 'border-box',
  textAlign: 'left',
  cursor: 'pointer',
  color: '#fff',
  border: `1px solid ${
    tone === 'source'
      ? 'rgba(255,255,255,0.75)'
      : tone === 'warm'
        ? 'rgba(255, 200, 120, 0.8)'
        : 'rgba(140, 220, 255, 0.85)'
  }`,
  backgroundColor:
    tone === 'source'
      ? 'rgba(255,255,255,0.05)'
      : tone === 'warm'
        ? 'rgba(255, 200, 120, 0.07)'
        : 'rgba(140, 220, 255, 0.07)',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: 'translateY(-1px)',
  },
  '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' },
}));

export const NodeLabel = styled.span({
  ...heading,
  fontSize: '1.3rem',
});

export const NodeTool = styled.span({
  fontSize: '0.78rem',
  color: MUTED,
  lineHeight: 1.3,
});

export const Arrow = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: MUTED,
  fontSize: '1.2rem',
  flexShrink: 0,
  [`@media ${NARROW}`]: {
    transform: 'rotate(90deg)',
    height: '1rem',
  },
});

export const ForkArrow = styled.span({
  flexShrink: 0,
  color: MUTED,
  fontSize: '1.4rem',
  [`@media ${NARROW}`]: {
    alignSelf: 'center',
    transform: 'rotate(90deg)',
  },
});

export const DiagramNote = styled.p({
  margin: '1rem 0 0',
  fontSize: '0.85rem',
  color: MUTED,
});

/* Stages ----------------------------------------------------------------- */

export const StageGrid = styled.div<{ flip: boolean }>(({ flip }) => ({
  display: 'grid',
  gridTemplateColumns: flip
    ? 'minmax(0, 0.9fr) minmax(0, 1.1fr)'
    : 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
  gap: 'clamp(1.5rem, 4vw, 3rem)',
  alignItems: 'start',
  '& > :first-of-type': { order: flip ? 2 : 1 },
  '& > :last-of-type': { order: flip ? 1 : 2 },
  [`@media ${NARROW}`]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    '& > :first-of-type': { order: 1 },
    '& > :last-of-type': { order: 2 },
  },
}));

export const StageNumber = styled.div({
  ...heading,
  fontSize: '1rem',
  letterSpacing: '0.14em',
  color: ACCENT,
  marginBottom: '0.35rem',
});

export const StageTitle = styled.h3({
  ...heading,
  fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
  marginBottom: '0.75rem',
});

export const Chips = styled.ul({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
  listStyle: 'none',
  padding: 0,
  margin: '0 0 1.25rem',
});

export const Chip = styled.li({
  fontSize: '0.75rem',
  letterSpacing: '0.04em',
  padding: '0.1rem 0.55rem',
  border: `1px solid ${LINE}`,
  color: 'rgba(255,255,255,0.8)',
});

export const BlockLabel = styled.h4({
  ...heading,
  fontSize: '1rem',
  letterSpacing: '0.12em',
  color: MUTED,
  margin: '1.1rem 0 0.25rem',
});

export const Para = styled.p({
  margin: '0 0 0.6rem',
  color: 'rgba(255,255,255,0.88)',
});

export const ResultPara = styled.p({
  margin: 0,
  paddingLeft: '0.9rem',
  borderLeft: `2px solid ${ACCENT}`,
  color: '#fff',
  fontWeight: 300,
});

export const FactGrid = styled.dl({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))',
  gap: '0.6rem',
  margin: '1.25rem 0 0',
});

export const Fact = styled.div({
  padding: '0.55rem 0.75rem',
  border: `1px solid ${LINE}`,
  backgroundColor: 'rgba(255,255,255,0.03)',
  '& dt': {
    fontSize: '0.72rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: MUTED,
    lineHeight: 1.3,
  },
  '& dd': {
    margin: '0.15rem 0 0',
    fontFamily: '"Zuume", sans-serif',
    fontWeight: 300,
    fontSize: '1.35rem',
    lineHeight: 1.1,
  },
});

export const FactSource = styled.span({
  display: 'block',
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  fontSize: '0.7rem',
  color: MUTED,
  marginTop: '0.15rem',
});

/* Media frames ----------------------------------------------------------- */

export const Figure = styled.figure({
  margin: 0,
});

export const ImageFrame = styled.div({
  display: 'flex',
  justifyContent: 'center',
  border: `1px solid ${LINE}`,
  backgroundColor: 'rgba(255,255,255,0.03)',
  '& img': {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '34rem',
    objectFit: 'contain',
  },
});

export const PlaceholderFrame = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.4rem',
  aspectRatio: '16 / 10',
  border: '1px dashed rgba(255,255,255,0.35)',
  background:
    'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 12px, rgba(255,255,255,0) 12px 24px)',
  color: MUTED,
  textAlign: 'center',
  padding: '1rem',
  boxSizing: 'border-box',
});

export const PlaceholderIcon = styled.span({
  fontSize: '1.6rem',
  lineHeight: 1,
  opacity: 0.6,
});

export const PlaceholderLabel = styled.span({
  ...heading,
  fontSize: '0.95rem',
  letterSpacing: '0.14em',
});

export const Caption = styled.figcaption({
  marginTop: '0.5rem',
  fontSize: '0.8rem',
  color: MUTED,
  lineHeight: 1.45,
});

/* TODO(Ian) notes: present but quiet ------------------------------------- */

export const TodoNote = styled.p({
  margin: '0.6rem 0 0',
  padding: '0.2rem 0 0.2rem 0.6rem',
  borderLeft: '1px dashed rgba(255, 200, 120, 0.55)',
  fontSize: '0.75rem',
  lineHeight: 1.4,
  color: 'rgba(255, 220, 170, 0.7)',
});

export const TodoTag = styled.span({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '0.68rem',
  marginRight: '0.4rem',
  opacity: 0.85,
});

export const TodoValue = styled.span({
  color: 'rgba(255,255,255,0.35)',
});

/* Budgets ---------------------------------------------------------------- */

export const BudgetGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
  gap: '1rem',
});

export const BudgetCard = styled.div({
  border: `1px solid ${LINE}`,
  padding: '1rem 1.1rem',
  backgroundColor: 'rgba(255,255,255,0.03)',
});

export const BudgetTitle = styled.h3({
  ...heading,
  fontSize: '1.5rem',
  marginBottom: '0.5rem',
});

export const BudgetTable = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.88rem',
  '& th, & td': {
    textAlign: 'left',
    verticalAlign: 'top',
    padding: '0.4rem 0',
    borderTop: `1px solid ${LINE}`,
  },
  '& th': {
    fontWeight: 200,
    color: MUTED,
    paddingRight: '0.75rem',
    width: '48%',
  },
  '& td': {
    fontWeight: 300,
  },
});

/* Closing ---------------------------------------------------------------- */

export const PointList = styled.ol({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
  gap: '1rem',
  counterReset: 'point',
});

export const Point = styled.li({
  counterIncrement: 'point',
  padding: '1rem 1.1rem',
  borderTop: `2px solid ${ACCENT_SOFT}`,
  backgroundColor: 'rgba(255,255,255,0.03)',
  '&::before': {
    content: 'counter(point, decimal-leading-zero)',
    display: 'block',
    fontFamily: '"Zuume", sans-serif',
    color: ACCENT,
    letterSpacing: '0.12em',
    marginBottom: '0.25rem',
  },
  '& h3': {
    ...heading,
    fontSize: '1.45rem',
    marginBottom: '0.4rem',
  },
  '& p': {
    margin: 0,
    fontSize: '0.92rem',
    color: 'rgba(255,255,255,0.85)',
  },
});

export const PageFooter = styled.footer({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '2rem 0 3rem',
  color: MUTED,
  fontSize: '0.85rem',
});

/* Google Play ------------------------------------------------------------ */

export const HeroLinks = styled(LinkRow)({
  alignItems: 'center',
  gap: '1.25rem',
  marginTop: '1.25rem',
});

/**
 * Google's badge artwork, unmodified. The PNG includes Google's required
 * clear space around the badge, so the negative margin lines the visible
 * badge up with the text column.
 */
export const PlayBadgeLink = styled.a({
  display: 'inline-block',
  lineHeight: 0,
  margin: '-0.55rem -0.6rem',
  borderRadius: '0.6rem',
  transition: 'transform 0.2s ease, filter 0.2s ease',
  '& img': {
    display: 'block',
    height: '3.75rem',
    width: 'auto',
  },
  '&:hover': { filter: 'brightness(1.12)' },
  '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '-4px' },
  '@media (prefers-reduced-motion: no-preference)': {
    '&:hover': { transform: 'translateY(-1px)' },
  },
});

export const AppCta = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.25rem 2rem',
  padding: '1.5rem 1.5rem 1.5rem 1.75rem',
  borderLeft: `2px solid ${ACCENT}`,
  backgroundColor: 'rgba(140, 220, 255, 0.05)',
  '& p': {
    margin: 0,
    maxWidth: '38rem',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export const LegalNote = styled.p({
  margin: '0.75rem 0 0',
  fontSize: '0.7rem',
  color: 'rgba(255, 255, 255, 0.4)',
});
