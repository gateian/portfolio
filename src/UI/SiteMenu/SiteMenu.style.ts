import styled from '@emotion/styled';

const LINE = 'rgba(255, 255, 255, 0.22)';
const MUTED = 'rgba(255, 255, 255, 0.62)';
const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const DURATION = '0.32s';
const REDUCED = '@media (prefers-reduced-motion: reduce)';

const heading = {
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  lineHeight: 1,
};

/**
 * Top-right corner, clear of the centred title banner, the bottom-right
 * fullscreen toggle and the footer. Sized and placed to sit centred inside
 * the 4rem TopBar on full pages (which reserves room for it).
 */
export const MenuButton = styled.button<{ isFaded?: boolean; isOpen: boolean }>(
  ({ isFaded, isOpen }) => ({
    position: 'fixed',
    top: '0.625rem',
    right: '1.25rem',
    zIndex: 1100,
    width: '2.75rem',
    height: '2.75rem',
    padding: 0,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    background: isOpen ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.42)',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 0 8px rgba(0, 0, 0, 0.35)',
    opacity: isFaded ? 0 : 1,
    pointerEvents: isFaded ? 'none' : 'auto',
    transition: `opacity 0.3s ease, background-color 0.2s ease`,
    // Override the global Vite button:hover border colour.
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
      borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' },
    '&:focus:not(:focus-visible)': { outline: 'none' },
    '@media (max-width: 600px)': { right: '0.75rem' },
  })
);

/** Three hairlines that fold into an X. */
export const Bars = styled.span<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'relative',
  display: 'block',
  width: '1.25rem',
  height: '0.75rem',
  '& > span': {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '1px',
    background: '#fff',
    transition: `transform ${DURATION} ${EASE}, opacity 0.2s ease, top ${DURATION} ${EASE}`,
    [REDUCED]: { transition: 'none' },
  },
  '& > span:nth-of-type(1)': {
    top: isOpen ? '50%' : 0,
    transform: isOpen ? 'rotate(45deg)' : 'none',
  },
  '& > span:nth-of-type(2)': {
    top: '50%',
    opacity: isOpen ? 0 : 1,
  },
  '& > span:nth-of-type(3)': {
    top: isOpen ? '50%' : '100%',
    transform: isOpen ? 'rotate(-45deg)' : 'none',
  },
}));

export const Backdrop = styled.div<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 1040,
  background: 'rgba(0, 0, 0, 0.45)',
  opacity: isOpen ? 1 : 0,
  pointerEvents: isOpen ? 'auto' : 'none',
  transition: `opacity ${DURATION} ease`,
  [REDUCED]: { transition: 'none' },
}));

export const Panel = styled.div<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 1050,
  width: 'min(24rem, 100vw)',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  padding: '4.5rem 1.75rem 1.5rem',
  overflowY: 'auto',
  color: '#fff',
  background: 'rgba(0, 0, 0, 0.86)',
  backdropFilter: 'blur(10px)',
  borderLeft: `1px solid ${LINE}`,
  fontFamily: '"Kanit", sans-serif',
  fontWeight: 200,
  pointerEvents: 'auto',
  // visibility keeps the closed panel out of the tab order and the
  // accessibility tree; delayed on close so the slide-out can finish.
  visibility: isOpen ? 'visible' : 'hidden',
  opacity: isOpen ? 1 : 0,
  transform: isOpen ? 'none' : 'translateX(2.5rem)',
  transition: isOpen
    ? `transform ${DURATION} ${EASE}, opacity ${DURATION} ease, visibility 0s`
    : `transform ${DURATION} ${EASE}, opacity ${DURATION} ease, visibility 0s linear ${DURATION}`,
  [REDUCED]: { transition: 'none', transform: 'none' },
  '@media (max-width: 600px)': {
    padding: '4.25rem 1.25rem 1.25rem',
    borderLeft: 'none',
  },
}));

export const PanelLabel = styled.div({
  ...heading,
  fontSize: '0.95rem',
  letterSpacing: '0.18em',
  color: MUTED,
  paddingBottom: '0.75rem',
  borderBottom: `1px solid ${LINE}`,
});

export const ItemList = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const Item = styled.li({
  borderBottom: `1px solid ${LINE}`,
});

const itemLink = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '0.85rem 0.25rem 0.7rem',
  color: '#fff',
  textDecoration: 'none',
  textAlign: 'left' as const,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, padding-left 0.2s ease',
  '&:hover, &:focus-visible': {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingLeft: '0.6rem',
  },
  '&:focus-visible': { outline: '1px solid #fff', outlineOffset: '-1px' },
  '&:focus:not(:focus-visible)': { outline: 'none' },
  borderRadius: 0,
  font: 'inherit',
  '&[aria-current="page"] .label::after': {
    content: '""',
    display: 'inline-block',
    width: '0.4rem',
    height: '0.4rem',
    marginLeft: '0.6rem',
    verticalAlign: '0.35em',
    borderRadius: '50%',
    background: '#fff',
  },
  [REDUCED]: { transition: 'none' },
};

export const ItemLinkStyle = itemLink;

export const ItemButton = styled.button(itemLink);

export const ItemKicker = styled.span({
  display: 'block',
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: MUTED,
  marginBottom: '0.3rem',
});

export const ItemLabel = styled.span({
  ...heading,
  display: 'block',
  fontSize: '2rem',
});

export const SubList = styled.ul({
  listStyle: 'none',
  margin: '-0.2rem 0 0.75rem',
  padding: '0 0 0 0.25rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
});

export const subLinkStyle = {
  display: 'inline-block',
  padding: '0.2rem 0.6rem',
  fontSize: '0.78rem',
  letterSpacing: '0.04em',
  color: 'rgba(255, 255, 255, 0.85)',
  textDecoration: 'none',
  border: `1px solid ${LINE}`,
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover, &:focus-visible': {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  '&:focus-visible': { outline: '1px solid #fff', outlineOffset: '1px' },
  '&[aria-current="page"]': { borderColor: '#fff' },
};

export const PanelFooter = styled.div({
  marginTop: 'auto',
  paddingTop: '1.5rem',
  display: 'flex',
  gap: '1.25rem',
  fontSize: '0.85rem',
  color: MUTED,
  '& a': {
    color: MUTED,
    textDecoration: 'none',
    letterSpacing: '0.06em',
  },
  '& a:hover, & a:focus-visible': { color: '#fff' },
});

export const VisuallyHidden = styled.span({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});
