import styled from '@emotion/styled';
import { MEDIA_WIDTH_LARGE, MEDIA_WIDTH_SMALL } from '../Theme';

export const FooterContainer = styled.footer({
  position: 'relative',
  width: '100%',
  padding: '0',
  margin: 0,
  zIndex: 100,
  pointerEvents: 'auto',
  flexShrink: 0,
});

interface FooterContentProps {
  isVisible: boolean;
}

export const FooterContent = styled.div<FooterContentProps>((props) => ({
  maxWidth: '72rem',
  margin: '0 auto',
  padding: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  opacity: props.isVisible ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out',
}));

export const FlexContainer = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '3.25rem',
  fontSize: '0.875rem',
  margin: '0rem 1rem',
  color: 'white',
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export const Copyright = styled.p({
  margin: 0,
  marginRight: '1.5rem',
});

export const AttributionSection = styled.div({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.7rem',
  marginRight: '1.5rem',
  '& span:first-of-type': {
    marginRight: '0.5rem',
  },
});

export const AttributionText = styled.span({
  color: '#ddd',
  [`@media (max-width: ${MEDIA_WIDTH_LARGE})`]: {
    marginRight: '1rem',
  },
  '& a': {
    color: '#fff',
    textDecoration: 'underline',
    '&:hover': {
      color: '#ddd',
    },
  },
});

export const SocialContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginRight: '3rem',

  // Was 1.75rem. At that size this row alone was 42px tall, which pushed the
  // stacked mobile footer up into AppBarWrapper. Desktop is untouched: above
  // 650px this inherits 0.875rem from FlexContainer.
  [`@media (max-width: ${MEDIA_WIDTH_SMALL})`]: {
    fontSize: '0.8rem',
  },
});

export const ContactButton = styled.button({
  color: 'white',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  textDecoration: 'underline',
  '&:hover': {
    color: '#ddd',
  },
});

export const EmailText = styled.div({
  color: '#ddd',
  cursor: 'pointer',

  '&:hover': {
    opacity: 0.8,
  },
});

export const SocialLink = styled.a({
  color: 'white',
  textDecoration: 'underline',
  '&:hover': {
    color: '#ddd',
  },
});

export const CopyNotification = styled.span({
  color: '#10b981',
  marginLeft: '0.5rem',
  opacity: 1,
  transition: 'opacity 0.3s ease',
});

interface VisibilityButtonProps {
  isVisible: boolean;
}

export const VisibilityButton = styled.button<VisibilityButtonProps>(
  (props) => ({
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    width: '24px',
    height: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    opacity: props.isVisible ? 1 : 0.2,
    animation: 'breathing 1s ease-in-out infinite',
    transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
    '@keyframes breathing': {
      '0%, 100%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.1)',
      },
    },
    '&:hover': {
      transform: 'scale(1.5)',
      animation: 'none', // Stop breathing animation when hovering
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
    '&:focus': {
      outline: 'none', // Also remove outline on focus
    },
    '&::before, &::after, &::before, &::after': {
      content: '""',
      position: 'absolute',
      width: '8px',
      height: '8px',
      borderColor: 'white',
      borderStyle: 'solid',
    },
    '&::before': {
      top: 0,
      left: 0,
      borderWidth: '2px 0 0 2px',
    },
    '&::after': {
      bottom: 0,
      right: 0,
      borderWidth: '0 2px 2px 0',
    },
    '& span::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '8px',
      height: '8px',
      borderWidth: '2px 2px 0 0',
      borderColor: 'white',
      borderStyle: 'solid',
    },
    '& span::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '8px',
      height: '8px',
      borderWidth: '0 0 2px 2px',
      borderColor: 'white',
      borderStyle: 'solid',
    },
  })
);
