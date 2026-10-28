import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StateContext from '../../../StateContext';
import { track } from '../../../analytics';
import { GITHUB_URL, LINKEDIN_URL } from '../../../data/site';
import { useContactDialog } from '../../Contact/ContactDialog';
import {
  Chip,
  Chips,
  Inner,
  OutlineButton,
  Page,
  PageFooter,
  Section,
  SectionIntro,
  SectionTitle,
  TodoNote,
  TodoTag,
  TopBar,
  TopBarLabel,
} from '../TechBreakdown/TechBreakdownPage.style';
import {
  Intro,
  Lede,
  LinkCellA,
  LinkCellButton,
  LinkCellStyle,
  LinkGrid,
  Looking,
  Name,
  Photo,
  Prose,
  SkillGrid,
  SkillGroupTitle,
  Tagline,
} from './AboutPage.style';
import styled from '@emotion/styled';

const LinkCell = styled(Link)(LinkCellStyle);

/**
 * Drop a portrait at public/images/about/ian.jpg (4:5 crop, ~800×1000) and it
 * appears beside the intro. Until then the intro runs full width.
 */
const PHOTO_SRC = '/images/about/ian.jpg';

/**
 * Every claim here comes from the CVs or the Zippy Town breakdown in this
 * repo. Anything not stated there is a visible TODO(Ian) note.
 */
const SKILLS: { title: string; items: string[] }[] = [
  {
    title: 'Rendering & shaders',
    items: [
      'ShaderLab / HLSL',
      'GLSL',
      'Shader Graph',
      'Unity URP / HDRP',
      'Three.js / WebGL',
      'React Three Fiber',
      'GPU instancing, batching, LOD',
    ],
  },
  {
    title: 'DCC & engines',
    items: [
      'Blender',
      '3ds Max',
      'Unity',
      'Unreal Engine',
      'Substance Painter',
    ],
  },
  {
    title: 'Tools & pipelines',
    items: [
      'Python Blender add-ons',
      'Asset export / import pipelines',
      'Lightmap baking',
      'KTX2 / ASTC textures',
      'Git, CI/CD, Docker, AWS',
    ],
  },
  {
    title: 'Code',
    items: ['C# (Unity)', 'TypeScript / JavaScript', 'React', 'Node.js'],
  },
];

function Todo({ children }: { children: string }) {
  return (
    <TodoNote>
      <TodoTag>TODO(Ian)</TodoTag>
      {children}
    </TodoNote>
  );
}

/** True once the portrait has loaded; stays false if the file is missing. */
function usePhoto(src: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(img.naturalWidth > 0);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);
  return loaded;
}

function AboutPage() {
  const { setIsFullPage } = useContext(StateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const hasPhoto = usePhoto(PHOTO_SRC);
  const { openContact, contactDialog } = useContactDialog();

  useEffect(() => {
    setIsFullPage(true);
    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  useEffect(() => {
    const previous = document.title;
    document.title = 'About | Ian Hamblin';
    pageRef.current?.focus({ preventScroll: true });
    return () => {
      document.title = previous;
    };
  }, []);

  const linkClicked = (link: string) => () =>
    track('about_link_clicked', { link });

  const back = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Page ref={pageRef} tabIndex={-1} aria-labelledby="about-title">
      <TopBar aria-label="About">
        <OutlineButton type="button" onClick={back}>
          <span aria-hidden>←</span> Back
        </OutlineButton>
        <TopBarLabel>About</TopBarLabel>
      </TopBar>

      <Inner>
        <Intro hasPhoto={hasPhoto}>
          {hasPhoto && (
            <Photo>
              <img src={PHOTO_SRC} alt="Ian Hamblin" />
            </Photo>
          )}
          <div>
            <Name id="about-title">Ian Hamblin</Name>
            <Tagline>3D Graphics and Technical Art</Tagline>
            <Lede>
              A graphics-focused engineer with 3D art foundations: shaders,
              real-time rendering and the tools and pipelines that get art from
              the DCC onto the target hardware.
            </Lede>
          </div>
        </Intro>

        <Section aria-labelledby="about-bio">
          <SectionTitle id="about-bio">Background</SectionTitle>
          <Prose>
            <p>
              I started as an artist/developer at{' '}
              <strong>Caspian Learning</strong> (2005–2015), shipping education
              and training titles: authoring environments, characters and
              animation, introducing lightmapping workflows, and building a
              custom 3ds Max material editor.
            </p>
            <p>
              As <strong>Lead Visual Engineer at 3DEO</strong> (2016–2024) I
              built a browser-based real-time 3D terrain visualiser in
              TypeScript, Three.js and WebGL, designed the colour-mapping and
              shader pipelines for bathymetry data, cut volumetric calculations
              from around 30 s to 0.1 s with GPU techniques, and delivered a
              real-time flythrough shown at COP26.
            </p>
            <p>
              Freelance (2011–2016 and 2024 to now), I shipped{' '}
              <Link to="/tech/zippy-town" onClick={linkClicked('zippy_town')}>
                Zippy Town
              </Link>{' '}
              end to end, a Blender scene running as an Android live wallpaper
              and a three.js site; produced the photoreal hero render sequence
              for the M-Sport Ford Raptor T1+ Dakar site (Awwwards Site of the
              Day); and wrote Unity shaders, Python Blender add-ons and VR/AR
              work. Most recently I built a real-time data dashboard in Unreal
              Engine and Three.js for <strong>Insight UK</strong> (contract, Dec
              2025 – Mar 2026).
            </p>
            <p>
              BA (Hons) Creative Visualisation, University of Teesside, 2004.
            </p>
          </Prose>
        </Section>

        <Section aria-labelledby="about-skills">
          <SectionTitle id="about-skills">Skills &amp; tools</SectionTitle>
          <SectionIntro>
            From my CV; years for each are listed there.
          </SectionIntro>
          <SkillGrid>
            {SKILLS.map((group) => (
              <div key={group.title}>
                <SkillGroupTitle>{group.title}</SkillGroupTitle>
                <Chips>
                  {group.items.map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </Chips>
              </div>
            ))}
          </SkillGrid>
        </Section>

        <Section aria-labelledby="about-looking">
          <SectionTitle id="about-looking">
            What I&apos;m looking for
          </SectionTitle>
          <Looking>
            <li>
              Technical Artist and graphics roles where art and engineering
              meet: shaders, lighting, and tools that keep artists in their DCC.
            </li>
            <li>
              Teams working to a fixed memory and frame budget on real hardware,
              including console.
            </li>
          </Looking>
          <Todo>
            Confirm the roles you want, location / remote preference, and
            whether you're open to permanent, contract or both. This is drafted
            from the site tagline and the Zippy Town breakdown.
          </Todo>
        </Section>

        <Section aria-labelledby="about-links">
          <SectionTitle id="about-links">Links</SectionTitle>
          <LinkGrid>
            <li>
              <LinkCell to="/cvgraphics" onClick={linkClicked('cv')}>
                <span className="k">CV · Graphics / Technical Art</span>
                <span className="v">Read the CV</span>
              </LinkCell>
            </li>
            <li>
              <LinkCellA
                href="/cv/Ian_Hamblin_CV_Graphics.pdf"
                download
                onClick={linkClicked('cv_pdf')}
              >
                <span className="k">CV · PDF</span>
                <span className="v">Download</span>
              </LinkCellA>
            </li>
            <li>
              <LinkCellA
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={linkClicked('linkedin')}
              >
                <span className="k">LinkedIn</span>
                <span className="v">in/ihamblin</span>
              </LinkCellA>
            </li>
            <li>
              <LinkCellA
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={linkClicked('github')}
              >
                <span className="k">GitHub</span>
                <span className="v">gateian</span>
              </LinkCellA>
            </li>
            <li>
              <LinkCellButton
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  linkClicked('contact')();
                  openContact();
                }}
              >
                <span className="k">Email</span>
                <span className="v">Contact</span>
              </LinkCellButton>
            </li>
          </LinkGrid>
        </Section>

        <PageFooter>
          <span>Ian Hamblin · 3D Graphics and Technical Art</span>
        </PageFooter>
      </Inner>
      {contactDialog}
    </Page>
  );
}

export default AboutPage;
