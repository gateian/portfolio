import { useContext, useState } from 'react';
import StateContext from '../../StateContext';
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
  VisibilityButton,
} from './Footer.style';
import ToastNotification from '../Toast/ToastNotifcation';
import EmailModal from '../Modal/Modal';
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '../../data/site';
import { copyToClipboard } from '../../utils/clipboard';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { isUIVisible, setIsUIVisible } = useContext(StateContext);

  const handleContactClick = () => {
    setShowModal(true);
  };

  const email = CONTACT_EMAIL;

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
      <FooterContent isVisible={isUIVisible}>
        <FlexContainer>
          <Copyright>
            © {currentYear} Ian Hamblin. All rights reserved.
          </Copyright>

          <AttributionSection>
            <span>Built with:</span>
            <AttributionText>
              React • Typescript • Icons by{' '}
              <a target="_blank" href="https://icons8.com" rel="noreferrer">
                Icons8
              </a>
            </AttributionText>
          </AttributionSection>

          <SocialContainer>
            <ContactButton onClick={handleContactClick}>Contact</ContactButton>

            <SocialLink
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </SocialLink>
            <SocialLink
              href={LINKEDIN_URL}
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

      <VisibilityButton
        isVisible={isUIVisible}
        onClick={() => setIsUIVisible(!isUIVisible)}
      >
        <span />
      </VisibilityButton>
    </FooterContainer>
  );
}

export default Footer;
