import styled from '@emotion/styled';

const modalOverlayStyle = {
  position: 'fixed' as 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  padding: '2rem',
  border: '4px solid white',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column' as 'column',
  gap: '1rem',
  minWidth: '300px',
};

const emailContainerStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const emailTextStyle = {
  fontSize: '2.1rem',
  color: 'white',
};

const copyButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'white',
  color: 'black',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
};

export const ModalOverlay = styled.div(modalOverlayStyle);
export const ModalContent = styled.div(modalContentStyle);
export const EmailContainer = styled.div(emailContainerStyle);
export const EmailText = styled.span(emailTextStyle);
export const CopyButton = styled.button(copyButtonStyle);
