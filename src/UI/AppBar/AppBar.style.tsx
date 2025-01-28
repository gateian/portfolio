import styled from '@emotion/styled';

interface AppBarButtonProps {
  isVisible: boolean;
}

export const AppBarWrapper = styled.div<AppBarButtonProps>((props) => ({
  padding: '1rem',
  zIndex: 100,
  pointerEvents: 'auto',
  position: 'absolute',
  bottom: '5rem',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  color: 'white',
  opacity: props.isVisible ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
  '@media (max-width: 650px)': {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  '> *:last-child': {
    '@media (max-width: 450px)': {
      display: 'none',
    },
  },
  '> *:not(:last-child)': {
    '@media (max-width: 400px)': {
      flex: '0 0 calc(20% - 1rem)',
      marginRight: '0.1rem',
      marginBottom: '0.1rem',
    },
  },
}));

interface AppBarButtonProps {
  selected?: boolean;
}

export const AppBarButtonWrapper = styled('div')<AppBarButtonProps>(
  (props) => ({
    flexGrow: 1,
    fontSize: '0.9rem',
    fontFamily: 'Zuume',
    fontWeight: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    textTransform: 'uppercase',
    cursor: 'pointer',
    color: props.selected ? 'white' : '#111',
    textAlign: 'center',
    backgroundColor: '#ddd',
    pointerEvents: props.selected ? 'none' : 'auto',
    '& svg': {
      width: '30px',
      height: '30px',
      marginBottom: '0.1rem',
    },
    '&:hover': {
      color: '#ddd',
      backgroundColor: '#111',
    },
  })
);

export const AppBarIconWrapper = styled('div')({
  flexGrow: 1,
  fontSize: '0.9rem',
  fontFamily: 'Zuume',
  fontWeight: 300,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0.5rem',
  textTransform: 'uppercase',
  cursor: 'pointer',
  color: 'white',
  textAlign: 'center',
  backgroundColor: 'transparent',
  pointerEvents: 'none',
  '& svg': {
    width: '30px',
    height: '30px',
    marginBottom: '0.1rem',
  },
});
