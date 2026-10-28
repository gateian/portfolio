import styled from '@emotion/styled';
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StateContext from '../../StateContext';
import { track } from '../../analytics';
import { GITHUB_URL, LINKEDIN_URL } from '../../data/site';
import { useContactDialog } from '../Contact/ContactDialog';
import {
  Backdrop,
  Bars,
  Item,
  ItemButton,
  ItemKicker,
  ItemLabel,
  ItemLinkStyle,
  ItemList,
  MenuButton,
  Panel,
  PanelFooter,
  PanelLabel,
  SubList,
  subLinkStyle,
  VisuallyHidden,
} from './SiteMenu.style';

const ItemLink = styled(Link)(ItemLinkStyle);
const SubLink = styled(Link)(subLinkStyle);

/**
 * The CV most relevant to Technical Artist roles leads; the other variants
 * sit underneath as a submenu.
 */
const CV_PRIMARY = { to: '/cvgraphics', label: 'Graphics / Technical Art' };
const CV_VARIANTS = [
  { to: '/cvart', label: 'Art & Creative Dev' },
  { to: '/cv3d', label: 'Front-end 3D' },
  { to: '/cvweb', label: 'Web' },
  { to: '/cv', label: 'Full CV' },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Site-wide hamburger menu: a fixed top-right toggle and a slide-in panel.
 * A modal dialog while open: focus is trapped inside (toggle + panel), Esc
 * closes it and returns focus to the toggle, and the arrow keys move between
 * items.
 */
function SiteMenu() {
  const [open, setOpen] = useState(false);
  const { isUIVisible, isFullPage } = useContext(StateContext);
  const location = useLocation();
  const { openContact, contactDialog } = useContactDialog();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      toggleRef.current?.focus();
    }
  }, []);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    setOpen(true);
    track('menu_opened', { path: location.pathname });
  };

  // Close when the route changes (link clicks, back/forward).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Move focus into the panel once it is visible.
  useEffect(() => {
    if (!open) {
      return;
    }
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus({ preventScroll: true });
  }, [open]);

  const focusables = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    ).filter((el) => el.offsetParent !== null || el === toggleRef.current);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    const items = focusables();
    if (items.length === 0) {
      return;
    }
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => {
      event.preventDefault();
      items[(i + items.length) % items.length].focus();
    };
    switch (event.key) {
      case 'Tab':
        if (event.shiftKey && index <= 0) {
          focusAt(items.length - 1);
        } else if (!event.shiftKey && index === items.length - 1) {
          focusAt(0);
        }
        break;
      case 'ArrowDown':
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        focusAt(index - 1);
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(items.length - 1);
        break;
      default:
    }
  };

  const itemClicked = (item: string, destination: string) => {
    // Also covers re-selecting the current page, where the route doesn't change.
    setOpen(false);
    track('menu_item_clicked', {
      item,
      destination,
      from_path: location.pathname,
    });
  };

  const current = (path: string) =>
    location.pathname === path ? ('page' as const) : undefined;

  // On the reel, fade the toggle with the rest of the UI when the visitor
  // hides it to watch the video; full pages always show it.
  const faded = !isUIVisible && !isFullPage && !open;

  return (
    <>
      <div ref={rootRef} onKeyDown={onKeyDown}>
        <MenuButton
          ref={toggleRef}
          type="button"
          isOpen={open}
          isFaded={faded}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          tabIndex={faded ? -1 : 0}
          onClick={toggle}
        >
          <Bars isOpen={open} aria-hidden="true">
            <span />
            <span />
            <span />
          </Bars>
        </MenuButton>
        <Backdrop isOpen={open} onClick={() => close(false)} aria-hidden />
        <Panel
          ref={panelRef}
          id={panelId}
          isOpen={open}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <PanelLabel aria-hidden="true">Menu</PanelLabel>
          <nav aria-label="Site">
            <ItemList>
              <Item>
                <ItemLink
                  to="/"
                  aria-current={current('/')}
                  onClick={() => itemClicked('reel', '/')}
                >
                  <ItemKicker>Showreel</ItemKicker>
                  <ItemLabel className="label">Reel</ItemLabel>
                </ItemLink>
              </Item>
              <Item>
                <ItemLink
                  to="/tech/zippy-town"
                  aria-current={current('/tech/zippy-town')}
                  onClick={() =>
                    itemClicked('tech_breakdown_zippy_town', '/tech/zippy-town')
                  }
                >
                  <ItemKicker>Technical breakdown</ItemKicker>
                  <ItemLabel className="label">Zippy Town</ItemLabel>
                </ItemLink>
              </Item>
              <Item>
                <ItemLink
                  to={CV_PRIMARY.to}
                  aria-current={current(CV_PRIMARY.to)}
                  onClick={() => itemClicked('cv', CV_PRIMARY.to)}
                >
                  <ItemKicker>{CV_PRIMARY.label}</ItemKicker>
                  <ItemLabel className="label">CV</ItemLabel>
                </ItemLink>
                <SubList aria-label="Other CV versions">
                  {CV_VARIANTS.map((cv) => (
                    <li key={cv.to}>
                      <SubLink
                        to={cv.to}
                        aria-current={current(cv.to)}
                        onClick={() => itemClicked('cv_variant', cv.to)}
                      >
                        {cv.label}
                      </SubLink>
                    </li>
                  ))}
                </SubList>
              </Item>
              <Item>
                <ItemLink
                  to="/about"
                  aria-current={current('/about')}
                  onClick={() => itemClicked('about', '/about')}
                >
                  <ItemKicker>Bio, skills, links</ItemKicker>
                  <ItemLabel className="label">About</ItemLabel>
                </ItemLink>
              </Item>
              <Item>
                <ItemButton
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => {
                    itemClicked('contact', 'email_modal');
                    close(false);
                    openContact();
                  }}
                >
                  <ItemKicker>Email</ItemKicker>
                  <ItemLabel className="label">Contact</ItemLabel>
                </ItemButton>
              </Item>
            </ItemList>
          </nav>
          <PanelFooter>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => itemClicked('github', GITHUB_URL)}
            >
              GitHub<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => itemClicked('linkedin', LINKEDIN_URL)}
            >
              LinkedIn<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
            </a>
          </PanelFooter>
        </Panel>
      </div>
      {contactDialog}
    </>
  );
}

export default SiteMenu;
