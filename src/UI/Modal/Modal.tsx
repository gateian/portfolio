import React from 'react';
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
