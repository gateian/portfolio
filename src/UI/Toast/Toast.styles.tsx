import styled from '@emotion/styled';

interface ToastContainerProps {
  visible: boolean;
}

export const ToastContainer = styled('div')<ToastContainerProps>((props) => ({
  position: 'fixed',
  bottom: '4rem',
  right: '8%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  opacity: props.visible ? 1 : 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
  zIndex: 1000,
}));
