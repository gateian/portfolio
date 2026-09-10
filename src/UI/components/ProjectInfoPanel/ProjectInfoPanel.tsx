import { useEffect, useState, type ReactNode } from 'react';
import type { MediaItem } from '../../../data/mediaItems';
import {
  PanelAnchor,
  PanelShell,
  Content,
  Title,
  Description,
  LinkButton,
  Arrow,
} from './ProjectInfoPanel.style';

interface ProjectInfoPanelProps {
  item: MediaItem;
  isVisible: boolean;
  isDisabled?: boolean;
  /** Progress bar (or similar) that should travel with the panel. */
  children?: ReactNode;
}

const FADE_MS = 420;

function ProjectInfoPanel({
  item,
  isVisible,
  isDisabled,
  children,
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
      {children}
    </PanelAnchor>
  );
}

export default ProjectInfoPanel;
