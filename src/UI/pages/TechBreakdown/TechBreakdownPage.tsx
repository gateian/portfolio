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
import type {
  BreakdownFact,
  BreakdownMedia,
  PipelineNode,
  TechBreakdown,
} from '../../../data/techBreakdowns/types';
import {
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
  HeroVideo,
  ImageFrame,
  Inner,
  Kicker,
  Lane,
  LaneLabel,
  LaneRow,
  LinkRow,
  NodeButton,
  NodeLabel,
  NodeTool,
  OutlineButton,
  Outputs,
  Page,
  PageFooter,
  Para,
  PlaceholderFrame,
  PlaceholderIcon,
  PlaceholderLabel,
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

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

function PipelineDiagram({
  nodes,
  onSelect,
}: {
  nodes: PipelineNode[];
  onSelect: (stageId: string) => void;
}) {
  const lanes: { id: PipelineNode['lane']; label: string }[] = [
    { id: 'web', label: 'Web · zippy.town' },
    { id: 'android', label: 'Android · live wallpaper' },
  ];

  const renderRow = (laneNodes: PipelineNode[]) => (
    <LaneRow>
      {laneNodes.map((node, i) => (
        <Fragment key={node.id}>
          {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
          <NodeButton
            type="button"
            lane={node.lane}
            onClick={() => onSelect(node.stageId)}
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
          <LaneLabel>Source · Blender + build machine</LaneLabel>
          {renderRow(nodes.filter((n) => n.lane === 'source'))}
        </Lane>
        <ForkArrow aria-hidden>⇉</ForkArrow>
        <Outputs>
          {lanes.map((lane) => (
            <Lane key={lane.id}>
              <LaneLabel>{lane.label}</LaneLabel>
              {renderRow(nodes.filter((n) => n.lane === lane.id))}
            </Lane>
          ))}
        </Outputs>
      </Diagram>
      <DiagramNote>
        Select a step to jump to it. Both outputs read the same GLBs and
        lightmaps, and share one tone-mapping shader.
      </DiagramNote>
    </>
  );
}

function Breakdown({ data }: { data: TechBreakdown }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef<HTMLElement>(null);
  const reducedMotion = useMemo(prefersReducedMotion, []);

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
  const backToReel = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const scrollToStage = (stageId: string) => {
    const target = document.getElementById(stageId);
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
    <Page ref={pageRef} tabIndex={-1} aria-labelledby="breakdown-title">
      <TopBar aria-label="Breakdown">
        <OutlineButton type="button" onClick={backToReel}>
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
            {data.links?.length ? (
              <LinkRow>
                {data.links.map((link) => (
                  <TextLink
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label} ↗
                  </TextLink>
                ))}
              </LinkRow>
            ) : null}
          </Inner>
        </HeroText>
      </Hero>

      <Inner>
        <Section aria-labelledby="pipeline-title">
          <SectionTitle id="pipeline-title">The pipeline</SectionTitle>
          <SectionIntro>
            Everything starts in one Blender scene. A build machine turns it
            into compressed assets, which feed two very different renderers.
          </SectionIntro>
          <PipelineDiagram nodes={data.pipeline} onSelect={scrollToStage} />
        </Section>

        {data.stages.map((stage, index) => (
          <Section
            key={stage.id}
            id={stage.id}
            tabIndex={-1}
            aria-labelledby={`${stage.id}-title`}
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

                <BlockLabel>What it does</BlockLabel>
                {stage.whatItDoes.map((paragraph) => (
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

        <Section id="budgets" aria-labelledby="budgets-title">
          <SectionTitle id="budgets-title">Constraints & budgets</SectionTitle>
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

        <Section id="closing" aria-labelledby="closing-title">
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

        <PageFooter>
          <OutlineButton type="button" onClick={backToReel}>
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

  return <Breakdown data={data} />;
}

export default TechBreakdownPage;
