import styled from '@emotion/styled';

export const FooterContainer = styled.footer({
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  padding: '0.5rem 0',
  marginTop: '3rem',
  position: 'absolute',
  bottom: 0,
  zIndex: 100,
  pointerEvents: 'auto',
});

export const FooterContent = styled.div({
  maxWidth: '72rem',
  margin: '0 auto',
  padding: '0 1rem',
});

export const FlexContainer = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.875rem',
  color: 'white', // "#4b5563",
});

export const Copyright = styled.p({
  marginRight: '1.5rem',
});

export const AttributionSection = styled.div({
  display: 'flex',
  alignItems: 'center',
  marginRight: '1.5rem',
  '& span:first-of-type': {
    marginRight: '0.5rem',
  },
});

export const AttributionText = styled.span({
  color: '#ddd',
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
});

export const ContactButton = styled.button({
  color: 'white',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  textDecoration: 'underline',
  fontSize: '0.875rem',
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
