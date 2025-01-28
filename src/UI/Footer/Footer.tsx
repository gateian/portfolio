import { useState } from "react";
import {
  FooterContainer,
  FooterContent,
  FlexContainer,
  Copyright,
  AttributionSection,
  AttributionText,
  SocialContainer,
  ContactButton,
  EmailText,
  SocialLink,
} from "./Footer.style";
import ToastNotification from "../Toast/ToastNotifcation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showEmail, setShowEmail] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleContactClick = () => {
    setShowEmail(!showEmail);
  };

  const email = "ihamblin@gmail.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setShowToast(true);
    } catch (err) {
      console.error("Failed to copy email:", err);
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
              React • Emotion • Typescript • Icons by{" "}
              <a target="_blank" href="https://icons8.com">
                Icons8
              </a>
            </AttributionText>
          </AttributionSection>

          <SocialContainer>
            <ContactButton onClick={handleContactClick}>
              Contact Me
            </ContactButton>
            {showEmail && (
              <>
                <EmailText onClick={handleCopyEmail}>{email}</EmailText>
                <ToastNotification
                  message="Email copied to clipboard!"
                  visible={showToast}
                  onHide={() => setShowToast(false)}
                />
              </>
            )}
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
    </FooterContainer>
  );
};

export default Footer;
