import { useCallback, useContext, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Column,
  ColumnLeft,
  ColumnRight,
  ContactDetails,
  CVWrapper,
  DownloadButton,
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

function CV3DDesigner() {
  const cvWrapperRef = useRef<HTMLDivElement>(null);

  const { setIsFullPage } = useContext(StateContext);

  useEffect(() => {
    setIsFullPage(true);

    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  const handleDownload = useCallback(() => {
    const element = cvWrapperRef.current;

    if (element) {
      const opt = {
        margin: 1,
        filename: 'Ian_Hamblin_CV_3D_Designer.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '#employment-page-break',
        },
      } as const;

      html2pdf().set(opt).from(element).save();
    }
  }, []);

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
      title: 'FRONT-END & UI',
      skills: [
        { skill: 'HTML', years: 21 },
        { skill: 'CSS', years: 21 },
        { skill: 'JavaScript', years: 21 },
        { skill: 'TypeScript', years: 10 },
        { skill: 'React', years: 6 },
        { skill: 'Three.js', years: 8 },
        { skill: 'React Three Fiber', years: 4 },
        { skill: 'SASS', years: 7 },
        { skill: 'Emotion', years: 5 },
        { skill: 'MUI', years: 4 },
      ],
    },
    {
      title: '3D & VISUAL DESIGN',
      skills: [
        { skill: 'Three.js / WebGL', years: 8 },
        { skill: 'Blender', years: 6 },
        { skill: '3ds Max', years: 16 },
        { skill: 'Photoshop', years: 16 },
        { skill: 'Unreal Engine', years: 3 },
        { skill: 'Unity', years: 7 },
        { skill: 'Substance Painter', years: 4 },
      ],
    },
    {
      title: 'MAPPING & DATA VISUALISATION',
      skills: [
        { skill: 'Mapbox', years: 9 },
        { skill: 'Cesium', years: 2 },
      ],
    },
    {
      title: 'INTERACTIVE EXPERIENCES & PLATFORM',
      skills: [
        { skill: 'AR/VR', years: 9 },
        { skill: 'Unity C#', years: 7 },
        { skill: 'Android Java/Kotlin', years: 2 },
        { skill: 'iOS', years: 1 },
        { skill: 'AWS', years: 6 },
        { skill: 'Git', years: 11 },
        { skill: 'CI/CD', years: 5 },
        { skill: 'Docker', years: 4 },
        { skill: 'Nginx/Apache', years: 6 },
      ],
    },
  ];

  const interestsAndAchievements = [
    'Worked on the award winning, M-Sport Raptor Dakar Rally web experience',
    'Created and released Xbox Live Indie Game, Avatar Euro Penalty Shootout with a friend , which achieved number 1 sports game and number 8 overall chart position in the UK',
    'I regularly attend events and networking meetups related to web development, 3D and the creative sector.',
    'Always keen to learn and keep my knowledge and keep up to date by attending industry related conferences such as unity.com/events/unite and www.middlesbroughfe.co.uk',
    'Co Developed a Kinnect training simulation for NATO and demonstrated it in Rome at the annual ITEC conference www.itec.co.uk',
    'Achieved a top 60,000 website ranking on alexa with www.g-unleashed.com',
    'I love to keep fit by cycling and walking',
    'Avid Follower of TEDTalks andt Tech blogs such as Geek.com, and TheVerge.com',
    'Love Motorsport and Formula 1',
  ];

  const employmentHistory: EmploymentHistoryItem[] = [
    {
      company: 'Freelance',
      role: '3D Specialist',
      dates: '2011 - 2016 & 2024 - Present',
      description: [
        'Produced 3D renders of the M-Sport Raptor Dakar Rally car for use in marketing materials.',
        'Worked on Combat Air Patrol 2 flight simulator. Modelling cockpits, Aircraft and various supporting assets.',
        'Helped build 3d interior design editor in three.js, including tiling editor',
        'Implemented webrtc feed from browser to Blender in realtime, for high quality realtime rendering in the browser.',
        'Created VR and AR experiences, including a driving simulator highlighting the dangers of drink driving and interactive medical visualisations.',
        "Built 'Ocean Depths', a first person submarine journey for an exhibition, focusing on atmosphere, lighting and immersion.",
        'Modelled detailed environments and hero assets such as the Queens University building in Belfast and aircraft for a flight simulator.',
      ],
    },
    {
      company: '3DEO',
      role: 'Lead Visual Engineer',
      dates: '2016 - 2024',
      description: [
        'Designed and built a browser-based realtime 3D terrain visualiser (TypeScript, Three.js, WebGL) for analysing underwater elevation data.',
        'Turned complex geospatial and time-series data into clear interactive views, colour systems, and cross-sections that non-technical users could understand.',
        'Improved core analysis workflows by reducing volumetric calculations from around 30 seconds to 0.1 seconds using GPU-accelerated techniques.',
        'Developed methods to compare changes in elevation over time, blending datasets in realtime to tell clear visual stories.',
        'Collaborated with ports and maritime clients to design simple, high-impact visual systems that support everyday decision making.',
        'Delivered a realtime 3D flythrough of the Forth estuary showcased at COP26, combining cinematic camera work with live data overlays.',
        'Worked across AWS (EC2, S3) and the wider web stack to ensure visuals were performant, reliable and easy to access in the browser.',
      ],
    },
    {
      company: 'Caspian Learning',
      role: 'Artist / Developer',
      dates: '2005 - 2015',
      description: [
        'Created environments, characters and animations for educational and training games used by schools, the military and professional sectors.',
        'Collaborated with programmers on character rigs, lighting and tools that improved both visual quality and performance.',
        'Helped introduce lightmapping and custom 3ds Max tooling to speed up production and keep visuals consistent across large projects.',
        'Worked on projects for high profile clients including Siemens, IBM, Fiat, Unilever and PWC.',
      ],
    },
    {
      company: 'G-unleashed.com',
      role: 'Co Founder, Developer and Designer',
      dates: '2004 - 2005',
      description: [
        'Designed and built popular Grand Theft Auto fan websites, combining UI design, branding and front-end development.',
        'Grew the sites to a top 50,000 Alexa ranking and achieved number 1 search ranking for “GTA Vice City hidden packages guide” on Google.',
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
        'A Levels in Maths, Physics and Technology, St John Fisher Sixth Form',
    },
  ];

  const highlights = [
    'Combines front-end engineering (React, TypeScript, Three.js) with a strong eye for composition, lighting and motion.',
    'Comfortable working from sketch to prototype to polished, production-ready UI.',
    'Experienced turning complex data into clear, understandble visualisations.',
    'Background across games, VR/AR, and real-world data visualisation, bringing gameplay-level polish to business interfaces.',
  ];

  return (
    <SubPage title="CV / Resume — Front-End 3D Designer" expand>
      <CVWrapper ref={cvWrapperRef}>
        <Section>
          <ColumnLeft>
            <SuperTitle>Ian Hamblin</SuperTitle>
            <SuperSubTitle>
              Front-End Developer / 3D Graphics Specialist
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
                  <Tab indent={1} key={skill.skill}>
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
              <Title type="dark">Interests and Achievements</Title>
              <List>
                {interestsAndAchievements.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </List>
            </Column>

            {/* Spacer to extend dark sidebar down for PDF rendering */}
            <div style={{ height: '570px' }} />
          </ColumnLeft>

          <ColumnRight>
            <Column>
              <Title>Profile</Title>
              <p>
                Front-end developer and 3D designer with over two decades of web
                experience and a long-standing background in games and real-time
                graphics. I specialise in building interactive 3D animated
                experiences in the browser. I also produce cinematic 3D
                animations for use in marketing and advertising.
              </p>
              <p>
                With over 20 years of experience working web and 3D, I have
                delivered a wide range of projects, for small and large
                corporate clients. I enjoy pushing myself to achieve the best
                possible results for my clients in as fast a time as possible. I
                am always looking for creative simple solutions to complex
                problems and I always enjoy the buzz of producing high quality
                work that wow's my clients and achieves the desired results.
              </p>
            </Column>

            <Column>
              <Title>Highlights</Title>
              <List>
                {highlights.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </List>
            </Column>

            <Column>
              <Title>Employment History</Title>
              {employmentHistory.map((employment, index) => {
                if (index === 1) {
                  return (
                    <div key={employment.company}>
                      <div id="employment-page-break" />
                      <CVEmploymentBox employment={employment} />
                    </div>
                  );
                }

                return (
                  <CVEmploymentBox
                    key={employment.company}
                    employment={employment}
                  />
                );
              })}
            </Column>
          </ColumnRight>
        </Section>
      </CVWrapper>
      <DownloadButton onClick={handleDownload}>
        Download PDF Version
      </DownloadButton>
    </SubPage>
  );
}

export default CV3DDesigner;
