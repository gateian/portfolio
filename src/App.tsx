import styled from '@emotion/styled';
import './App.css';
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StateContext, { StateProvider } from './StateContext';
import { Overlay, HeroBanner, HeroBannerSideColumn } from './StyledComponents';
import ContentArea from './UI/ContentArea';
import TitleBanner from './UI/TitleBanner';
import { DebugStateProvider } from './debug/DebugStateContext';
import { isDebugMode } from './utils/generalUtils';
import Debug2D from './debug/Debug2D';
import MediaSlideshow from './components/MediaSlideshow';
import AppBar from './UI/AppBar/AppBar';
import Footer from './UI/Footer/Footer';

interface AppWrapperProps {
  visible: boolean;
}

const AppWrapper = styled('div')<AppWrapperProps>(({ visible }) => ({
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  WebkitUserSelect: 'none' /* Safari */,
  msUserSelect: 'none' /* IE 10 and IE 11 */,
  userSelect: 'none' /* Standard syntax */,
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.5s ease-in',
  backgroundColor: '#222',
}));

interface MediaItemsProps {
  type: 'video' | 'image';
  src: string;
}

const mediaItems: MediaItemsProps[] = [
  {
    type: 'video',
    src: '/videos/raptor_short_web.mp4',
  },
  {
    type: 'video',
    src: '/videos/mountain.mp4',
  },
  {
    type: 'image',
    src: '/images/ShrineRender2.webp',
  },
  {
    type: 'video',
    src: '/videos/tower.mp4',
  },
  {
    type: 'image',
    src: '/images/harrier.webp',
  },
  {
    type: 'video',
    src: '/videos/carvis.mp4',
  },
];

function AppContent() {
  const isDebug = isDebugMode();

  const [isVisible, setIsVisible] = useState(false);
  const { isUIVisible } = useContext(StateContext);

  useEffect(() => {
    const handleLoaderRemoved = () => {
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    };

    window.addEventListener('initialLoaderRemoved', handleLoaderRemoved);

    if (!document.getElementById('initial-loader')) {
      handleLoaderRemoved();
    }

    return () => {
      window.removeEventListener('initialLoaderRemoved', handleLoaderRemoved);
    };
  }, []);

  return (
    <AppWrapper visible={isVisible}>
      <MediaSlideshow items={mediaItems} />
      <Overlay>
        <HeroBanner isVisible={isUIVisible}>
          <HeroBannerSideColumn />
          <TitleBanner />
          <HeroBannerSideColumn />
        </HeroBanner>
        <Routes>
          <Route path="/" element={<ContentArea />} />
          <Route path="/cv" element={<ContentArea />} />
          <Route path="/cvart" element={<ContentArea />} />
        </Routes>
        <AppBar />
        <Footer />
      </Overlay>
      {isDebug ? <Debug2D /> : null}
    </AppWrapper>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StateProvider>
        <DebugStateProvider>
          <AppContent />
        </DebugStateProvider>
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
