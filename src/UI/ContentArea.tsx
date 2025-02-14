import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import CVMain from './pages/CV/CVMain';
import HomePage from './pages/home/homePage';
import CVArtMain from './pages/CV/CVArtMain';
import CVWebMain from './pages/CV/CVWebMain';

const ContentWrapper = styled.div({
  width: '100vw',
  position: 'relative',
  display: 'flex',
  flexBasis: '100vh',
  flexDirection: 'row',
  alignItems: 'center',
});

interface ContentAreaProps {
  children?: ReactNode;
}

const ContentArea: React.FC<ContentAreaProps> = () => {
  const location = useLocation();

  return (
    <ContentWrapper>
      {/* <CentreSpace> */}
      {(() => {
        let content;
        switch (location.pathname) {
          case '/cv':
            content = <CVMain />;
            break;
          case '/cvart':
            content = <CVArtMain />;
            break;
          case '/cvweb':
            content = <CVWebMain />;
            break;
          case '/':
          default:
            content = <HomePage />;
            break;
        }

        return content;
      })()}
    </ContentWrapper>
  );
};

export default ContentArea;
