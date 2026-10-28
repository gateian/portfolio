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
  CalloutLink,
  CalloutKicker,
  CalloutLabel,
} from './ProjectInfoPanel.style';

interface ProjectInfoPanelProps {
  item: MediaItem;
  isVisible: boolean;
  isDisabled?: boolean;
  /** Progress bar (or similar) that should travel with the panel. */
  children?: ReactNode;
  /**
   * Hover / keyboard focus on the technical breakdown callout. Lets the
   * reel hold still while the viewer is about to click it.
   */
  onCalloutEngage?: (engaged: boolean) => void;
}

const FADE_MS = 420;

function ProjectInfoPanel({
  item,
  isVisible,
  isDisabled,
  children,
  onCalloutEngage,
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

  const breakdown = displayedItem.techBreakdown;

  // The callout unmounts when the item changes; don't leave the reel held.
  useEffect(() => {
    if (!breakdown) {
      onCalloutEngage?.(false);
    }
  }, [breakdown, onCalloutEngage]);

  return (
    <PanelAnchor isVisible={isVisible} isDisabled={isDisabled}>
      <PanelShell highlight={!!breakdown && !fading}>
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
      {breakdown ? (
        <CalloutLink
          to={breakdown.path}
          fading={fading}
          onMouseEnter={() => onCalloutEngage?.(true)}
          onMouseLeave={() => onCalloutEngage?.(false)}
          onFocus={() => onCalloutEngage?.(true)}
          onBlur={() => onCalloutEngage?.(false)}
        >
          <CalloutKicker aria-hidden>Read</CalloutKicker>
          <CalloutLabel>{breakdown.label}</CalloutLabel>
          <Arrow aria-hidden>→</Arrow>
        </CalloutLink>
      ) : null}
      {children}
    </PanelAnchor>
  );
}

export default ProjectInfoPanel;
