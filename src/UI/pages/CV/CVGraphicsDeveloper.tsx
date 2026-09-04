import { useContext, useEffect } from 'react';
import {
  Column,
  ColumnLeft,
  ColumnRight,
  ContactDetails,
  CVWrapper,
  EduDate,
  List,
  Section,
  SkillsBox,
  SkillsCategory,
  SkillsItem,
  SubRow,
  SuperSubTitle,
  SuperTitle,
  Tab,
  Title,
} from './CV.styles';
import CVEmploymentBox from './CVEmploymentBox';
import { EmploymentHistoryItem } from './CVInterfaces';
import SubPage from '../../SubPage/SubPage';
import StateContext from '../../../StateContext';
import PrintCV from '../../PrintCV/PrintCV';

function CVGraphicsDeveloper() {
  const { setIsFullPage } = useContext(StateContext);

  useEffect(() => {
    setIsFullPage(true);

    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  interface Skill {
    skill: string;
    years: number;
  }

  interface SkillCategory {
    title: string;
    skills: Skill[];
  }

  const skillsData: SkillCategory[] = [
    {
      title: 'GRAPHICS & RENDERING',
      skills: [
        { skill: 'Unity SRP (URP/HDRP)', years: 5 },
        { skill: 'ShaderLab / HLSL', years: 6 },
        { skill: 'Shader Graph', years: 3 },
        { skill: 'Three.js', years: 9 },
        { skill: 'WebGL', years: 8 },
        { skill: 'Shaders (GLSL)', years: 6 },
        { skill: 'React Three Fiber', years: 4 },
        { skill: 'GPU Instancing / Batching / LOD', years: 5 },
      ],
    },
    {
      title: 'LANGUAGES & FRAMEWORKS',
      skills: [
        { skill: 'TypeScript', years: 9 },
        { skill: 'JavaScript', years: 21 },
        { skill: 'C# (Unity)', years: 7 },
        { skill: 'React', years: 5 },
        { skill: 'Node.js', years: 6 },
      ],
    },
    {
      title: '3D DCC & ENGINES',
      skills: [
        { skill: 'Blender', years: 6 },
        { skill: '3ds Max', years: 16 },
        { skill: 'Unity', years: 7 },
        { skill: 'Unreal Engine', years: 5 },
        { skill: 'Substance Painter', years: 4 },
      ],
    },
    {
      title: 'TOOLS & DEVOPS',
      skills: [
        { skill: 'Git', years: 11 },
        { skill: 'CI/CD', years: 9 },
        { skill: 'Docker', years: 6 },
        { skill: 'AWS', years: 9 },
      ],
    },
  ];

  const employmentHistory: EmploymentHistoryItem[] = [
    {
      company: 'Insight UK',
      role: 'Creative Developer (Contract)',
      dates: 'December 2025 - March 2026',
      description: [
        'Built a high fidelity digital dashboard in Unreal Engine and Three.js, rendering complex business data as movie quality realtime visuals.',
        'Developed AI driven storytelling to guide viewers through complex datasets.',
        'Modelled and sourced the 3D assets, and authored the look and lighting of the scenes.',
        'Delivered to a fixed deadline for a high stakes client presentation.',
      ],
    },
    {
      company: '3DEO',
      role: 'Lead Visual Engineer',
      dates: '2016 - 2024',
      description: [
        'Built a browser-based realtime 3D terrain visualizer (TypeScript + Three.js + WebGL).',
        'Designed colour-mapping and shader pipelines to analyse bathymetry datasets at scale.',
        'Reduced volumetric calc times from ~30s to 0.1s with GPU accelerated techniques.',
        'Implemented temporal data blending and elevation deltas using custom GLSL shaders.',
        'Delivered a realtime 3D flythrough showcased at COP26; integrated video and interactions.',
        'Worked across AWS (EC2, S3) and web stack to ship performant visual tools.',
      ],
    },
    {
      company: 'Freelance',
      role: 'Graphics Engineer / 3D Generalist',
      dates: '2011 - 2016 & 2024 - Present',
      description: [
        'Unity C# graphics: authored shaders (ShaderLab/HLSL), configured URP/HDRP, and tuned lighting/post-processing.',
        'Developed Three.js based editors and realtime viewers; implemented tiling and material workflows.',
        'Created Python + Blender add-ons for streamlined asset export/import pipelines.',
        'Built VR driving simulator and multiple AR experiences (Unity + Web); integrated live sensor/geo data.',
        'Implemented WebRTC pipeline from browser to Blender for high-quality realtime rendering.',
        'Produced marketing CG renders (e.g., M‑Sport Raptor Dakar); modelled complex assets.',
      ],
    },
    {
      company: 'Caspian Learning',
      role: 'Artist / Developer',
      dates: '2005 - 2015',
      description: [
        'Shipped education/training titles; authored environments, characters, and animation.',
        'Collaborated on rigging and tooling to improve runtime performance and iteration speed.',
        'Introduced lightmapping workflows; built custom 3ds Max material editor for pipeline wins.',
      ],
    },
  ];

  const education = [
    {
      date: '2004',
      description: 'BA Hons in Creative Visualisation, University of Teesside',
    },
    {
      date: '1999',
      description:
        'A Levels: Maths, Physics, Technology — St John Fisher Sixth Form',
    },
  ];

  const highlights = [
    'Unity graphics pipeline: URP/HDRP setup, lighting, post-processing, render queues.',
    'Shader authoring: ShaderLab/HLSL (Unity) and GLSL (WebGL); surface/fragment shaders.',
    'Performance: tuned large scenes with LOD, GPU instancing, batching, and frustum culling.',
    'UX: built technical analysis tools (cross-sections, delta views) for domain experts.',
    'Pipelines: Blender/3ds Max tools; automated ingest and material workflows.',
  ];

  return (
    <SubPage title="CV / Resume — Graphics Developer" expand>
      <CVWrapper>
        <Section>
          <ColumnLeft>
            <SuperTitle>Ian Hamblin</SuperTitle>
            <SuperSubTitle>
              Graphics / Rendering Engineer (WebGL + Unity)
            </SuperSubTitle>

            <ContactDetails>
              <div>
                <b>Email:</b> ihamblin@gmail.com
              </div>
              <div>
                <b>Phone:</b> 07882449285
              </div>
              <div>
                <b>LinkedIn:</b> linkedin.com/in/ihamblin
              </div>
              <div>
                <b>Portfolio:</b> https://ianhamblin.xyz
              </div>
            </ContactDetails>

            {skillsData.map((category) => (
              <SkillsBox key={category.title}>
                <Tab indent={0}>
                  {'const '}
                  <SkillsCategory>{category.title}</SkillsCategory>
                  {' = ['}
                </Tab>
                {category.skills.map((skill) => (
                  <Tab indent={1}>
                    {`{ skill: '`}
                    <SkillsItem>{skill.skill}</SkillsItem>
                    {`', years: ${skill.years} },`}
                  </Tab>
                ))}
                ]
              </SkillsBox>
            ))}

            <Column type="dark">
              <Title type="dark">Education</Title>
              {education.map((edu) => (
                <SubRow key={edu.date}>
                  <EduDate>{edu.date}</EduDate>
                  <div>{edu.description}</div>
                </SubRow>
              ))}
            </Column>

            <Column type="dark">
              <Title type="dark">Highlights</Title>
              <List>
                {highlights.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </List>
            </Column>
          </ColumnLeft>

          <ColumnRight>
            <Column>
              <Title>About Me</Title>
              <p>
                Graphics-focused engineer blending 3D art foundations with
                modern WebGL/Three.js and Unity rendering. Experienced shipping
                realtime visualisation tools and data-driven rendering for large
                geospatial and simulation datasets.
              </p>
              <p>
                Comfortable across shader authoring (ShaderLab/HLSL, GLSL),
                Unity SRP (URP/HDRP), performance tuning, and building clean UI
                for technical users. Enjoys collaborating with artists and
                engineers to deliver visually impressive, performant, and
                maintainable experiences.
              </p>
            </Column>

            <Column>
              <Title>Employment History</Title>
              {employmentHistory.map((employment) => (
                <CVEmploymentBox
                  key={employment.company}
                  employment={employment}
                />
              ))}
            </Column>
          </ColumnRight>
        </Section>
      </CVWrapper>
      <PrintCV file="Ian_Hamblin_CV_Graphics.pdf" />
    </SubPage>
  );
}

export default CVGraphicsDeveloper;
