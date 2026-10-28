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
  BottomChrome,
  ProjectCluster,
} from './StyledComponents';
import ContentArea from './UI/ContentArea';
import TitleBanner from './UI/TitleBanner';
import MediaSlideshow from './UI/components/MediaSlideshow';
import type { MediaSlideshowHandle } from './UI/components/MediaSlideshow';
import MediaProgressBar from './UI/components/MediaProgressBar/MediaProgressBar';
import ProjectInfoPanel from './UI/components/ProjectInfoPanel/ProjectInfoPanel';
import AppBar from './UI/AppBar/AppBar';
import Footer from './UI/Footer/Footer';
import { mediaItems } from './data/mediaItems';
import { dismissInitialLoader } from './utils/initialLoader';
import TechBreakdownPage from './UI/pages/TechBreakdown/TechBreakdownPage';

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
  // Pointer or keyboard focus is on the technical breakdown callout.
  const [calloutEngaged, setCalloutEngaged] = useState(false);

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
  const rotationPaused =
    !!activeMediaItem?.techBreakdown?.pauseRotation || calloutEngaged;

  return (
    <AppWrapper>
      {isFullPage == false ? (
        <MediaSlideshow
          ref={slideshowRef}
          items={mediaItems}
          onReady={dismissInitialLoader}
          onIndexChange={handleMediaIndexChange}
          paused={rotationPaused}
          // Remounts after a full page (e.g. back from /tech/...): resume on
          // the item the viewer left from rather than restarting the reel.
          initialIndex={mediaIndex}
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
          <Route path="/tech/:slug" element={<TechBreakdownPage />} />
        </Routes>
        <FooterArea isDisabled={isFullPage}>
          <BottomChrome>
            <ProjectCluster>
              {activeMediaItem ? (
                <ProjectInfoPanel
                  item={activeMediaItem}
                  isVisible={isUIVisible}
                  isDisabled={isFullPage}
                  onCalloutEngage={setCalloutEngaged}
                >
                  <MediaProgressBar
                    labels={mediaItems.map((item) => item.title)}
                    currentIndex={mediaIndex}
                    getProgress={readMediaProgress}
                    onSelect={handleMediaSelect}
                    isVisible={isUIVisible}
                    isDisabled={isFullPage}
                  />
                </ProjectInfoPanel>
              ) : null}
            </ProjectCluster>
            <AppBar />
          </BottomChrome>
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
