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
    if (!visible) {
      return undefined; // Explicit return for the else case
    }

    const timer = setTimeout(() => {
      onHide();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  return <ToastContainer visible={visible}>{message}</ToastContainer>;
};

export default ToastNotification;
