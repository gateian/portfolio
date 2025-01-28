import React, { useEffect } from 'react';
import { ToastContainer } from './Toast.styles';

interface ToastNotificationProps {
  message: string;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  duration = 2000,
  visible,
  onHide,
}) => {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onHide();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  // Force the component to always render, but control visibility with CSS
  return (
    <ToastContainer visible={visible} aria-live="polite">
      {message}
    </ToastContainer>
  );
};

export default ToastNotification;
