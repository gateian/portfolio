import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import type { MediaItem } from '../data/mediaItems';

interface ProjectInfoPanelProps {
  item: MediaItem;
  isVisible: boolean;
  isDisabled?: boolean;
}

const PanelAnchor = styled.div<{ isVisible: boolean; isDisabled?: boolean }>(
  ({ isVisible, isDisabled }) => ({
    display: isDisabled ? 'none' : 'flex',
    position: 'fixed',
    left: '50%',
    bottom: '12rem',
    transform: 'translateX(-50%)',
    zIndex: 50,
    width: 'min(34rem, calc(100vw - 2rem))',
    pointerEvents: 'auto',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    '@media (max-width: 650px)': {
      bottom: '14rem',
    },
  })
);

const PanelShell = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  border: '1px solid rgba(255, 255, 255, 0.75)',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  backdropFilter: 'blur(2px)',
  boxShadow: '0 0 12px rgba(0, 0, 0, 0.45)',
  overflow: 'hidden',
});

const Content = styled.div<{ fading: boolean }>(({ fading }) => ({
  flex: 1,
  minWidth: 0,
  padding: '0.85rem 1.1rem',
  opacity: fading ? 0 : 1,
  transform: fading ? 'translateY(6px)' : 'translateY(0)',
  transition: 'opacity 0.45s ease, transform 0.45s ease',
}));

const Title = styled.div({
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 200,
  fontSize: '1.55rem',
  lineHeight: 1.05,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#fff',
  textShadow: '0px 0px 6px rgba(0,0,0,0.85)',
  marginBottom: '0.35rem',
});

const Description = styled.p({
  margin: 0,
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '0.95rem',
  lineHeight: 1.25,
  letterSpacing: '0.02em',
  color: 'rgba(255, 255, 255, 0.88)',
  textShadow: '0px 0px 6px rgba(0,0,0,0.85)',
});

const LinkButton = styled.a<{ fading: boolean }>(({ fading }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.2rem',
  flexShrink: 0,
  width: '4.75rem',
  borderLeft: '1px solid rgba(255, 255, 255, 0.55)',
  color: '#fff',
  textDecoration: 'none',
  fontFamily: '"Zuume", sans-serif',
  fontWeight: 300,
  fontSize: '0.85rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  opacity: fading ? 0 : 1,
  transition: 'opacity 0.45s ease, background-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
}));

const Arrow = styled.span({
  fontSize: '1.25rem',
  lineHeight: 1,
});

const FADE_MS = 420;

function ProjectInfoPanel({
  item,
  isVisible,
  isDisabled,
}: ProjectInfoPanelProps) {
  const [displayedItem, setDisplayedItem] = useState(item);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (item.src === displayedItem.src) {
      return undefined;
    }

    setFading(true);
    const timeoutId = window.setTimeout(() => {
      setDisplayedItem(item);
      setFading(false);
    }, FADE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [item, displayedItem.src]);

  return (
    <PanelAnchor isVisible={isVisible} isDisabled={isDisabled}>
      <PanelShell>
        <Content fading={fading}>
          <Title>{displayedItem.title}</Title>
          <Description>{displayedItem.description}</Description>
        </Content>
        {displayedItem.url ? (
          <LinkButton
            fading={fading}
            href={displayedItem.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${displayedItem.title}`}
          >
            <Arrow aria-hidden>→</Arrow>
            View
          </LinkButton>
        ) : null}
      </PanelShell>
    </PanelAnchor>
  );
}

export default ProjectInfoPanel;
