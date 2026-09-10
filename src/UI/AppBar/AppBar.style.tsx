import styled from '@emotion/styled';
import {
  MEDIA_WIDTH_LARGE,
  MEDIA_WIDTH_MEDIUM,
  MEDIA_BOTTOM_SIDE_BY_SIDE,
} from '../Theme';

interface AppBarWrapperProps {
  isVisible: boolean;
}

export const AppBarWrapper = styled.div<AppBarWrapperProps>((props) => ({
  padding: '0.1rem',
  zIndex: 100,
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  color: 'white',
  opacity: props.isVisible ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
  // Match ProjectCluster so both sit on the same centered axis in the
  // stacked layout. minWidth: 0 stops icon content from forcing the bar
  // wider than maxWidth and overflowing to the right.
  boxSizing: 'border-box',
  width: 'min(34rem, calc(100% - 2rem))',
  minWidth: 0,
  alignSelf: 'center',
  flexShrink: 0,
  // Mobile: two equal rows of four (7 skill icons + Connect). Grid keeps
  // each cell the same width so labels stay readable instead of crushing
  // into a single cramped row.
  [`@media (max-width: ${MEDIA_WIDTH_MEDIUM})`]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    columnGap: '0.15rem',
    rowGap: '0.15rem',
    padding: '0.4rem',
  },
  // Side-by-side with ProjectCluster: only when short *and* wide enough.
  [`@media ${MEDIA_BOTTOM_SIDE_BY_SIDE}`]: {
    flex: '1 1 0',
    width: 'auto',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    '& > *': {
      justifyContent: 'center',
    },
  },
}));

const AppBarItemBase = styled.div({
  flexGrow: 1,
  fontSize: '0.8rem',
  fontFamily: 'Zuume',
  fontWeight: 300,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem 0.5rem',
  textTransform: 'uppercase',
  cursor: 'pointer',
  textAlign: 'center',
  minWidth: 0,

  '& svg': {
    width: '30px',
    height: '30px',
    marginBottom: '0.1rem',
  },
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    '& span': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    },
  },
});

interface AppBarButtonWrapperProps {
  selected?: boolean;
}

export const AppBarButtonWrapper = styled(
  AppBarItemBase
)<AppBarButtonWrapperProps>((props) => ({
  color: props.selected ? 'white' : '#111',
  backgroundColor: '#ddd',
  pointerEvents: props.selected ? 'none' : 'auto',
  '&:hover': {
    color: '#ddd',
    backgroundColor: '#111',
  },
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    fontSize: '0.7rem',
    padding: '0.5rem',
    '& svg': {
      width: '22px',
      height: '22px',
    },
  },
}));

export const AppBarIconWrapper = styled(AppBarItemBase)({
  color: 'white',
  backgroundColor: 'transparent',
  pointerEvents: 'none',
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    padding: '0.3rem 0.5rem',
    '& svg': {
      width: '29px',
      height: '29px',
    },
  },
});
