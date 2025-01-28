import styled from '@emotion/styled';

interface ToastContainerProps {
  visible: boolean;
}

export const ToastContainer = styled('div')<ToastContainerProps>((props) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#000',
  color: '#fff',
  padding: '1rem 2rem',
  borderRadius: '8px',
  zIndex: 9999,
  display: props.visible ? 'block' : 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
}));
