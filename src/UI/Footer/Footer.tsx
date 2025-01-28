import { useState } from 'react';
import {
  FooterContainer,
  FooterContent,
  FlexContainer,
  Copyright,
  AttributionSection,
  AttributionText,
  SocialContainer,
  ContactButton,
  SocialLink,
} from './Footer.style';
import ToastNotification from '../Toast/ToastNotifcation';
import EmailModal from '../Modal/Modal';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleContactClick = () => {
    setShowModal(true);
  };

  const email = 'ihamblin@gmail.com';

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Clipboard API failed:', err);
      }
    }

    // Fallback for older browsers and mobile devices
    try {
      // Create temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Make it invisible
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Try to copy using the older command
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch (err) {
      console.error('Fallback clipboard method failed:', err);
      return false;
    }
  };

  const handleCopyEmail = async () => {
    const success = await copyToClipboard(email);
    if (success) {
      setShowToast(true);
    } else {
      alert(`Could not copy email. Please copy it manually: ${email}`);
    }
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FlexContainer>
          <Copyright>
            © {currentYear} Ian Hamblin. All rights reserved.
          </Copyright>

          <AttributionSection>
            <span>Built with:</span>
            <AttributionText>
              React • Emotion • Typescript • Icons by{' '}
              <a target="_blank" href="https://icons8.com" rel="noreferrer">
                Icons8
              </a>
            </AttributionText>
          </AttributionSection>

          <SocialContainer>
            <ContactButton onClick={handleContactClick}>
              Contact Me
            </ContactButton>

            <SocialLink
              href="https://github.com/gateian"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </SocialLink>
            <SocialLink
              href="https://linkedin.com/in/ihamblin"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </SocialLink>
          </SocialContainer>
        </FlexContainer>
      </FooterContent>

      {showModal && (
        <EmailModal
          email={email}
          onClose={() => setShowModal(false)}
          onCopy={handleCopyEmail}
        />
      )}

      <ToastNotification
        message="Email copied to clipboard!"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
    </FooterContainer>
  );
}

export default Footer;
