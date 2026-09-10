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

function CV3DDesigner() {
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
      title: 'FRONT-END & UI',
      skills: [
        { skill: 'HTML', years: 22 },
        { skill: 'CSS', years: 22 },
        { skill: 'JavaScript', years: 21 },
        { skill: 'TypeScript', years: 9 },
        { skill: 'React', years: 5 },
        { skill: 'Three.js', years: 9 },
        { skill: 'React Three Fiber', years: 4 },
        { skill: 'SASS', years: 7 },
        { skill: 'Emotion', years: 5 },
        { skill: 'MUI', years: 4 },
      ],
    },
    {
      title: '3D & VISUAL DESIGN',
      skills: [
        { skill: 'Three.js / WebGL', years: 9 },
        { skill: 'Blender', years: 6 },
        { skill: '3ds Max', years: 16 },
        { skill: 'Photoshop', years: 16 },
        { skill: 'Unreal Engine', years: 5 },
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
        { skill: 'Android Java/Kotlin', years: 5 },
        { skill: 'iOS', years: 3 },
        { skill: 'AWS', years: 9 },
        { skill: 'Git', years: 11 },
        { skill: 'CI/CD', years: 9 },
        { skill: 'Docker', years: 6 },
        { skill: 'Nginx/Apache', years: 7 },
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
      company: 'Insight UK',
      role: 'Creative Developer (Contract)',
      dates: 'December 2025 - March 2026',
      description: [
        'Modelled, sourced and art directed the 3D and 2D graphics for a high fidelity digital dashboard.',
        'Created futuristic, movie quality visuals in Unreal Engine and Three.js.',
        'Developed AI driven storytelling to present complex business data compellingly.',
        'Delivered to a fixed deadline for a high stakes client presentation.',
      ],
    },
    {
      company: 'Freelance',
      role: '3D Specialist',
      dates: '2011 - 2016 & 2024 - Present',
      description: [
        "Created 'Zippy Town 3D', a stylised cartoon city shipped as an Android live wallpaper and a realtime Three.js showcase at zippy.town — modelled, textured and built end to end, to a mobile performance budget using DRACO compressed meshes, LOD and post processing.",
        'Produced the photorealistic hero render sequence for the M-Sport Ford Raptor T1+ Dakar Rally site, taking the supplied CAD model into Unreal Engine for materials and lighting. The site won Awwwards Site of the Day.',
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
      <CVWrapper>
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
      <PrintCV file="Ian_Hamblin_CV_3D.pdf" />
    </SubPage>
  );
}

export default CV3DDesigner;
