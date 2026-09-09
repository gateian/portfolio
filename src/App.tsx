import styled from '@emotion/styled';
import './App.css';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import StateContext, { StateProvider } from './StateContext';
import {
  Overlay,
  HeroBanner,
  HeroBannerSideColumn,
  FooterArea,
} from './StyledComponents';
import ContentArea from './UI/ContentArea';
import TitleBanner from './UI/TitleBanner';
import MediaSlideshow from './components/MediaSlideshow';
import type { MediaSlideshowHandle } from './components/MediaSlideshow';
import MediaProgressBar from './components/MediaProgressBar';
import ProjectInfoPanel from './components/ProjectInfoPanel';
import AppBar from './UI/AppBar/AppBar';
import Footer from './UI/Footer/Footer';
import { mediaItems } from './data/mediaItems';
import { dismissInitialLoader } from './utils/initialLoader';

const AppWrapper = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  WebkitUserSelect: 'none' /* Safari */,
  msUserSelect: 'none' /* IE 10 and IE 11 */,
  userSelect: 'none' /* Standard syntax */,
  backgroundColor: '#000',
});

function AppContent() {
  const { isUIVisible, isFullPage } = useContext(StateContext);
  const [mediaIndex, setMediaIndex] = useState(0);
  const slideshowRef = useRef<MediaSlideshowHandle>(null);

  const handleMediaIndexChange = useCallback((index: number) => {
    setMediaIndex(index);
  }, []);

  const handleMediaSelect = useCallback((index: number) => {
    slideshowRef.current?.select(index);
  }, []);

  const readMediaProgress = useCallback(
    () => slideshowRef.current?.getProgress() ?? 0,
    []
  );

  useEffect(() => {
    if (isFullPage) {
      dismissInitialLoader();
    }
  }, [isFullPage]);

  const activeMediaItem = mediaItems[mediaIndex] ?? mediaItems[0];

  return (
    <AppWrapper>
      {isFullPage == false ? (
        <MediaSlideshow
          ref={slideshowRef}
          items={mediaItems}
          onReady={dismissInitialLoader}
          onIndexChange={handleMediaIndexChange}
        />
      ) : null}
      <Overlay>
        <HeroBanner isVisible={isUIVisible} isDisabled={isFullPage}>
          <HeroBannerSideColumn />
          <TitleBanner />
          <HeroBannerSideColumn />
        </HeroBanner>
        <Routes>
          <Route path="/" element={<ContentArea />} />
          <Route path="/cv" element={<ContentArea />} />
          <Route path="/cvart" element={<ContentArea />} />
          <Route path="/cvweb" element={<ContentArea />} />
          <Route path="/cvgraphics" element={<ContentArea />} />
          <Route path="/cv3d" element={<ContentArea />} />
        </Routes>
        {activeMediaItem ? (
          <ProjectInfoPanel
            item={activeMediaItem}
            isVisible={isUIVisible}
            isDisabled={isFullPage}
          />
        ) : null}
        <MediaProgressBar
          labels={mediaItems.map((item) => item.title)}
          currentIndex={mediaIndex}
          getProgress={readMediaProgress}
          onSelect={handleMediaSelect}
          isVisible={isUIVisible}
          isDisabled={isFullPage}
        />
        <FooterArea isDisabled={isFullPage}>
          <AppBar />
          <Footer />
        </FooterArea>
      </Overlay>
    </AppWrapper>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StateProvider>
        <AppContent />
      </StateProvider>
    </BrowserRouter>
  );
}

export default App;
