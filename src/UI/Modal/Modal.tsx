import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ModalOverlay,
  ModalContent,
  EmailContainer,
  EmailText,
  CopyButton,
} from './Modal.style';

interface EmailModalProps {
  email: string;
  onClose: () => void;
  onCopy: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ email, onClose, onCopy }) => {
  // Close on any route change: links, the site menu, browser back/forward.
  const { pathname, search, hash } = useLocation();
  const openedAt = useRef(`${pathname}${search}${hash}`);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (`${pathname}${search}${hash}` !== openedAt.current) {
      onCloseRef.current();
    }
  }, [pathname, search, hash]);

  // Esc closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleClick = async () => {
    await onCopy();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <EmailContainer>
          <EmailText>{email}</EmailText>
          <CopyButton onClick={handleClick}>Copy</CopyButton>
        </EmailContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EmailModal;
