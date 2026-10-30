import { Fragment, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import StateContext from '../../../StateContext';
import { techBreakdowns } from '../../../data/techBreakdowns';
import { videoCropStyle } from '../../../data/videoCrop';
import { useBreakdownAnalytics } from './useBreakdownAnalytics';
import type {
  BreakdownFact,
  BreakdownMedia,
  PipelineNode,
  TechBreakdown,
} from '../../../data/techBreakdowns/types';
import {
  AppCta,
  Arrow,
  BlockLabel,
  BudgetCard,
  BudgetGrid,
  BudgetTable,
  BudgetTitle,
  Caption,
  Chip,
  Chips,
  Diagram,
  DiagramNote,
  Fact,
  FactGrid,
  FactSource,
  Figure,
  ForkArrow,
  Hero,
  HeroShade,
  HeroSummary,
  HeroText,
  HeroTitle,
  HeroImage,
  HeroLinks,
  HeroVideo,
  ImageFrame,
  Inner,
  Kicker,
  Lane,
  LaneLabel,
  LaneRow,
  LegalNote,
  NodeButton,
  NodeLabel,
  type NodeTone,
  NodeTool,
  OutlineButton,
  Outputs,
  Page,
  PageFooter,
  Para,
  PlaceholderFrame,
  PlaceholderIcon,
  PlaceholderLabel,
  PlayBadgeLink,
  Point,
  PointList,
  ResultPara,
  Section,
  SectionIntro,
  SectionTitle,
  StageGrid,
  StageNumber,
  StageTitle,
  TextLink,
  TodoNote,
  TodoTag,
  TodoValue,
  TopBar,
  TopBarLabel,
} from './TechBreakdownPage.style';

/** Unverified detail, kept visible but quiet so it gets filled in later. */
function Todo({ children }: { children: string }) {
  return (
    <TodoNote>
      <TodoTag>TODO(Ian)</TodoTag>
      {children}
    </TodoNote>
  );
}

function FactValue({ fact }: { fact: BreakdownFact }) {
  if (fact.value) {
    return <>{fact.value}</>;
  }
  return <TodoValue aria-label="Not yet filled in">—</TodoValue>;
}

function MediaSlot({ media }: { media: BreakdownMedia }) {
  return (
    <Figure>
      {media.src ? (
        <ImageFrame>
          <img src={media.src} alt={media.alt} loading="lazy" />
        </ImageFrame>
      ) : (
        <PlaceholderFrame role="img" aria-label={media.alt}>
          <PlaceholderIcon aria-hidden>▢</PlaceholderIcon>
          <PlaceholderLabel>Screenshot to come</PlaceholderLabel>
        </PlaceholderFrame>
      )}
      <Caption>{media.caption}</Caption>
    </Figure>
  );
}

const PLAY_BADGE_SRC = '/badges/google-play-badge.png';

/**
 * Google Play listing URL. The `referrer` is passed through to the Play
 * Console's install attribution, so installs from this page show up there.
 */
function playStoreHref(packageName: string, placement: string) {
  const referrer = new URLSearchParams({
    utm_source: 'ianhamblin.xyz',
    utm_medium: 'tech_breakdown',
    utm_content: placement,
  }).toString();
  return `https://play.google.com/store/apps/details?${new URLSearchParams({
    id: packageName,
    referrer,
  }).toString()}`;
}

function PlayBadge({
  packageName,
  placement,
  onClick,
}: {
  packageName: string;
  placement: 'hero' | 'footer';
  onClick: (href: string) => void;
}) {
  const href = playStoreHref(packageName, placement);
  return (
    <PlayBadgeLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(href)}
    >
      <img
        src={PLAY_BADGE_SRC}
        alt="Get it on Google Play"
        width={646}
        height={250}
      />
    </PlayBadgeLink>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/** Border and fill per lane: white for the source, then warm, then cool. */
const LANE_TONES: NodeTone[] = ['warm', 'cool'];

function PipelineDiagram({
  pipeline,
  onSelect,
}: {
  pipeline: TechBreakdown['pipeline'];
  onSelect: (node: PipelineNode) => void;
}) {
  const renderRow = (laneId: string, tone: NodeTone) => (
    <LaneRow>
      {pipeline.nodes
        .filter((node) => node.lane === laneId)
        .map((node, i) => (
          <Fragment key={node.id}>
            {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
            <NodeButton
              type="button"
              tone={tone}
              onClick={() => onSelect(node)}
            >
              <NodeLabel>{node.label}</NodeLabel>
              <NodeTool>{node.tool}</NodeTool>
            </NodeButton>
          </Fragment>
        ))}
    </LaneRow>
  );

  return (
    <>
      <Diagram role="group" aria-label="Pipeline overview">
        <Lane grow={1.4}>
          <LaneLabel>{pipeline.source.label}</LaneLabel>
          {renderRow(pipeline.source.id, 'source')}
        </Lane>
        <ForkArrow aria-hidden>⇉</ForkArrow>
        <Outputs>
          {pipeline.outputs.map((lane, i) => (
            <Lane key={lane.id}>
              <LaneLabel>{lane.label}</LaneLabel>
              {renderRow(lane.id, LANE_TONES[i % LANE_TONES.length])}
            </Lane>
          ))}
        </Outputs>
      </Diagram>
      <DiagramNote>Select a step to jump to it. {pipeline.note}</DiagramNote>
    </>
  );
}

function Breakdown({ data }: { data: TechBreakdown }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef<HTMLElement>(null);
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const trackBreakdown = useBreakdownAnalytics(data.slug, pageRef, location);

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.project}: ${data.title} | Ian Hamblin`;
    return () => {
      document.title = previous;
    };
  }, [data]);

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 });
    pageRef.current?.focus({ preventScroll: true });
  }, [data.slug]);

  // Arrived from the reel: go back so the reel resumes where it was.
  // Deep-linked straight here: there is nothing to go back to, so go home.
  const backToReel = (placement: 'top_bar' | 'footer') => {
    const hasHistory = location.key !== 'default';
    trackBreakdown('back_to_reel_clicked', {
      placement,
      destination: hasHistory ? 'previous_page' : 'home',
    });
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const trackPlayStore = (placement: 'hero' | 'footer') => (href: string) =>
    trackBreakdown('play_store_clicked', {
      placement,
      package_name: data.playStore?.packageName,
      url: href,
    });

  const scrollToStage = (node: PipelineNode) => {
    trackBreakdown('tech_breakdown_pipeline_step_clicked', {
      step_id: node.id,
      step_label: node.label,
      step_tool: node.tool,
      lane: node.lane,
      stage_id: node.stageId,
    });
    const target = document.getElementById(node.stageId);
    if (!target) {
      return;
    }
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    target.focus({ preventScroll: true });
  };

  return (
    <Page
      ref={pageRef}
      tabIndex={-1}
      aria-labelledby="breakdown-title"
      data-ph-scroll-root
    >
      <TopBar aria-label="Breakdown">
        <OutlineButton type="button" onClick={() => backToReel('top_bar')}>
          <span aria-hidden>←</span> Back to reel
        </OutlineButton>
        <TopBarLabel>Technical breakdown</TopBarLabel>
      </TopBar>

      <Hero>
        {data.hero.video ? (
          <HeroVideo
            src={data.hero.video}
            poster={data.hero.poster}
            style={videoCropStyle(data.hero.crop)}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={data.hero.alt}
          />
        ) : data.hero.poster ? (
          <HeroImage
            src={data.hero.poster}
            alt={data.hero.alt}
            style={videoCropStyle(data.hero.crop)}
          />
        ) : null}
        <HeroShade />
        <HeroText>
          <Inner>
            <Kicker>{data.project} · Technical breakdown</Kicker>
            <HeroTitle id="breakdown-title">{data.title}</HeroTitle>
            <HeroSummary>{data.summary}</HeroSummary>
            {data.links?.length || data.playStore ? (
              <HeroLinks>
                {data.playStore ? (
                  <PlayBadge
                    packageName={data.playStore.packageName}
                    placement="hero"
                    onClick={trackPlayStore('hero')}
                  />
                ) : null}
                {data.links?.map((link) => (
                  <TextLink
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackBreakdown('external_link_clicked', {
                        url: link.href,
                        label: link.label,
                        placement: 'hero',
                      })
                    }
                  >
                    {link.label} ↗
                  </TextLink>
                ))}
              </HeroLinks>
            ) : null}
          </Inner>
        </HeroText>
      </Hero>

      <Inner>
        <Section
          aria-labelledby="pipeline-title"
          data-track-section="pipeline"
          data-track-title="The pipeline"
        >
          <SectionTitle id="pipeline-title">The pipeline</SectionTitle>
          <SectionIntro>{data.pipeline.intro}</SectionIntro>
          <PipelineDiagram pipeline={data.pipeline} onSelect={scrollToStage} />
        </Section>

        {data.stages.map((stage, index) => (
          <Section
            key={stage.id}
            id={stage.id}
            tabIndex={-1}
            aria-labelledby={`${stage.id}-title`}
            data-track-section={stage.id}
            data-track-title={stage.title}
          >
            <StageGrid flip={index % 2 === 1}>
              <div>
                <StageNumber>
                  Stage {String(index + 1).padStart(2, '0')}
                </StageNumber>
                <StageTitle id={`${stage.id}-title`}>{stage.title}</StageTitle>
                <Chips aria-label="Tools">
                  {stage.tools.map((tool) => (
                    <Chip key={tool}>{tool}</Chip>
                  ))}
                </Chips>

                <BlockLabel>Problem</BlockLabel>
                <Para>{stage.problem}</Para>

                <BlockLabel>Solution</BlockLabel>
                {stage.solution.map((paragraph) => (
                  <Para key={paragraph.slice(0, 32)}>{paragraph}</Para>
                ))}

                <BlockLabel>Result</BlockLabel>
                <ResultPara>{stage.result}</ResultPara>

                {stage.facts?.length ? (
                  <FactGrid>
                    {stage.facts.map((fact) => (
                      <Fact key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>
                          <FactValue fact={fact} />
                          {fact.source ? (
                            <FactSource>{fact.source}</FactSource>
                          ) : null}
                        </dd>
                      </Fact>
                    ))}
                  </FactGrid>
                ) : null}
                {stage.facts
                  ?.filter((fact) => fact.todo)
                  .map((fact) => (
                    <Todo key={fact.label}>{fact.todo!}</Todo>
                  ))}
                {stage.todos?.map((todo) => (
                  <Todo key={todo}>{todo}</Todo>
                ))}
              </div>
              <MediaSlot media={stage.media} />
            </StageGrid>
          </Section>
        ))}

        <Section
          id="budgets"
          aria-labelledby="budgets-title"
          data-track-section="budgets"
          data-track-title={data.budgets.title}
        >
          <SectionTitle id="budgets-title">{data.budgets.title}</SectionTitle>
          <SectionIntro>{data.budgets.intro}</SectionIntro>
          <BudgetGrid>
            {data.budgets.groups.map((group) => (
              <BudgetCard key={group.title}>
                <BudgetTitle>{group.title}</BudgetTitle>
                <BudgetTable>
                  <tbody>
                    {group.facts.map((fact) => (
                      <tr key={fact.label}>
                        <th scope="row">{fact.label}</th>
                        <td>
                          <FactValue fact={fact} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </BudgetTable>
                {group.facts
                  .filter((fact) => fact.todo)
                  .map((fact) => (
                    <Todo key={fact.label}>{fact.todo!}</Todo>
                  ))}
              </BudgetCard>
            ))}
          </BudgetGrid>
        </Section>

        {data.closing ? (
          <Section
            id="closing"
            aria-labelledby="closing-title"
            data-track-section="closing"
            data-track-title={data.closing.title}
          >
            <SectionTitle id="closing-title">{data.closing.title}</SectionTitle>
            {data.closing.intro ? (
              <SectionIntro>{data.closing.intro}</SectionIntro>
            ) : null}
            <PointList>
              {data.closing.points.map((point) => (
                <Point key={point.title}>
                  <h3>{point.title}</h3>
                  <p>{point.body}</p>
                </Point>
              ))}
            </PointList>
            {data.closing.todos?.map((todo) => (
              <Todo key={todo}>{todo}</Todo>
            ))}
          </Section>
        ) : null}

        {data.playStore ? (
          <Section
            id="get-the-app"
            aria-labelledby="get-the-app-title"
            data-track-section="get-the-app"
            data-track-title={data.playStore.title}
          >
            <SectionTitle id="get-the-app-title">
              {data.playStore.title}
            </SectionTitle>
            <AppCta>
              <p>{data.playStore.body}</p>
              <PlayBadge
                packageName={data.playStore.packageName}
                placement="footer"
                onClick={trackPlayStore('footer')}
              />
            </AppCta>
            <LegalNote>
              Google Play and the Google Play logo are trademarks of Google LLC.
            </LegalNote>
          </Section>
        ) : null}

        <PageFooter>
          <OutlineButton type="button" onClick={() => backToReel('footer')}>
            <span aria-hidden>←</span> Back to reel
          </OutlineButton>
          <span>Ian Hamblin · {data.project}</span>
        </PageFooter>
      </Inner>
    </Page>
  );
}

function TechBreakdownPage() {
  const { slug } = useParams();
  const { setIsFullPage } = useContext(StateContext);
  const data = slug ? techBreakdowns[slug] : undefined;

  useEffect(() => {
    setIsFullPage(true);
    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  if (!data) {
    return <Navigate to="/" replace />;
  }

  // Keyed so each breakdown gets its own view (and analytics view id).
  return <Breakdown key={data.slug} data={data} />;
}

export default TechBreakdownPage;
