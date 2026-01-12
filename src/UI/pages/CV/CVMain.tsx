import { useCallback, useContext, useEffect, useRef } from 'react';
import {
  Column,
  ContactDetails,
  CVWrapper,
  DownloadButton,
  List,
  Row,
  Section,
  SectionRight,
  SkillsBox,
  SkillsCategory,
  SkillsItem,
  SubRow,
  SubTitle,
  SuperSubTitle,
  SuperTitle,
  Tab,
  Title,
  Years,
} from './CV.styles';
import CVEmploymentBox from './CVEmploymentBox';
import { EmploymentHistoryItem } from './CVInterfaces';
import SubPage from '../../SubPage/SubPage';
import StateContext from '../../../StateContext';

function CVMain() {
  const cvWrapperRef = useRef<HTMLDivElement>(null);

  const { setIsFullPage } = useContext(StateContext);

  useEffect(() => {
    setIsFullPage(true);

    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  const employmentHistory: EmploymentHistoryItem[] = [
    {
      company: '3DEO',
      role: 'Lead Visual Engineer',
      dates: '2016 - 2024',
      description: [
        'Built a browser based realtime 3D terrain visualizer in typescript for displaying and analysing Bathymetry (under water) elevation data.',
        'Co Developed the customer portal in react and AWS for managing and viewing complex customer geospatial data.',
        'Improved volume calculation speeds from 30 seconds to 0.1 seconds, via gpu calculations.',
        'Designed and built terrain colouring method that allowed customers to analyse their large datasets in realtime.',
        'Worked with Harwich Port to build simple colour system for guiding harbour pilots through port.',
        'Worked with team to convert huge datasets (gigabytes) into a format that could be streamed to the browser in seconds.',
        'Developed method to show changes in elevation data over time, again in realtime.',
        'Created Server app for converting raw cctv feed to browser compatible video stream.',
        'Created an AR mobile app to show air quality at various real world locations.',
        'Built a realtime 3D flythrough of the Forth estuary, for use at the COP26 summit.',
        'Worked with AWS EC2, S3 and other backend infrastructure.',
      ],
    },
    {
      company: 'Freelance Developer',
      role: 'App Development',
      dates: '2011 - 2016 and 2024 - Present',
      description: [
        'Built a VR driving simulator for highlighting the dangers of Alcohol and driving.',
        'Various AR based app, including displaying interactive information on a real world brain model.',
        'Worked on Sixty5 app for helping farmers spray fields using GPS data.',
        'Worked on Combat Air Patrol 2 flight simulator. Modelling cockpits, Aircraft and various supporting assets.',
        "Created 'Ocean Depths' app for an exhibition. A first person journey into the depths of the ocean in a submarine.",
        'Developed my skills in client management and personal organisation.',
        "Created 'Toon Town 3D' live wallpaper app for android. A little cartoon city as a mobile wallpaper.",
        'Built detailed model of Queens University building in Belfast.',
      ],
    },
    {
      company: 'Caspian Learning',
      role: 'Artist / Developer',
      dates: '2005 - 2015',
      description: [
        'Building educational games for schools, military and professional industries.',
        'Used 3ds Max and Photoshop to create, edit characters, objects and environments for the game engine.',
        'Worked closely with programmers to develop efficient and flexible character rig, which included facial animation.',
        'Created, applied and edited looping character animations for all game characters.',
        'Worked on projects for high profile clients such as Siemens, IBM, Fiat, Unilever and PWC.',
        'Developed tools to rapidly speed up art asset importing as well as improve quality.',
        'Organised and managed over 2000 art assets in the Caspian library.',
        'Worked with development team to bring lightmapped environments to the game engine.',
        'Built a custom 3ds Max material editor to speed up working with game engine materials.',
      ],
    },
    {
      company: 'G-unleashed.com',
      role: 'Co Founder, Developer and Designer',
      dates: '2004 - 2005',
      description: [
        'Built popular Grand Theft Auto websites, GTA3 Unleashed, Vice city Unleashed and G-Unleashed.',
        'Achieved ranking in the top 50,000 most active websites according to alexa rankings.',
        'Achieved No. 1 search ranking for “GTA Vice City hidden packages guide” on google.',
      ],
    },
  ];

  const interestsAndAchievements = [
    'Created and released Xbox Live Indie Game, Avatar Euro Penalty Shootout with a friend , which achieved number 1 sports game and number 8 overall chart position in the UK',
    'I regularly attend events and networking meetings related to gaming, IT and the creative sector.',
    'Always keen to learn and keep my knowledge and keep up to date by attending industry related conferences such as unity.com/events/unite and www.middlesbroughfe.co.uk',
    'Co Developed a Kinnect training simulation for NATO and demonstrated it in Rome at the annual ITEC conference www.itec.co.uk',
    'Achieved a top 60,000 website ranking on alexa with www.g-unleashed.com',
    'I love to keep fit by cycling and walking',
    'Avid Follower of TEDTalks andt Tech blogs such as Geek.com, and TheVerge.com',
    'Love Motorsport and Formula 1',
  ];

  const education = [
    {
      date: '2004',
      description: 'BA Hons in Creative Visualisation University of Teesside',
    },
    {
      date: '1999',
      description:
        'A Levels in Maths, Physics and Technology, St John Fisher Sixth Form',
    },
    {
      date: '1997',
      description:
        "GCSE's including Science, Technology and Art, St John Fisher High School",
    },
  ];

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/Ian_Hamblin_CV.pdf';
    link.download = 'Ian_Hamblin_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Types
  interface Skill {
    skill: string;
    years: number;
  }

  interface SkillCategory {
    title: string;
    skills: Skill[];
  }

  // Data
  const skillsData: SkillCategory[] = [
    {
      title: 'FRONTEND',
      skills: [
        { skill: 'TypeScript', years: 7 },
        { skill: 'React', years: 3 },
        { skill: 'Three.js', years: 5 },
        { skill: 'SASS', years: 6 },
        { skill: 'Emotion', years: 4 },
        { skill: 'MUI', years: 3 },
        { skill: 'React Three Fiber', years: 3 },
      ],
    },
    {
      title: 'TESTING',
      skills: [
        { skill: 'Jest', years: 3 },
        { skill: 'React Testing Library', years: 3 },
        { skill: 'Cypress', years: 1 },
        { skill: 'Storybook', years: 1 },
        { skill: 'Log Rocket', years: 1 },
      ],
    },
    {
      title: 'MAPPING TECHNOLOGIES',
      skills: [
        { skill: 'Mapbox', years: 8 },
        { skill: 'Cesium', years: 1 },
      ],
    },
    {
      title: 'STATE MANAGEMENT',
      skills: [
        { skill: 'Apollo', years: 3 },
        { skill: 'GraphQL', years: 3 },
        { skill: 'Zustand', years: 3 },
      ],
    },
    {
      title: 'Apps and Games',
      skills: [
        { skill: 'AR/VR', years: 8 },
        { skill: 'Unity C#', years: 6 },
        { skill: 'Android Java/Kotlin', years: 4 },
        { skill: 'iOS', years: 2 },
      ],
    },
    {
      title: '3D',
      skills: [
        { skill: '3ds Max', years: 15 },
        { skill: 'Blender', years: 5 },
        { skill: 'Photoshop', years: 15 },
        { skill: 'Unreal Engine', years: 4 },
        { skill: 'Unity', years: 6 },
        { skill: 'Zbrush', years: 3 },
        { skill: 'Substance Painter', years: 3 },
        { skill: 'Gaea 2.0', years: 2 },
        { skill: 'Davinci Resolve', years: 2 },
      ],
    },
  ];

  return (
    <SubPage title="CV / Resume" expand>
      <CVWrapper ref={cvWrapperRef}>
        <SectionRight />
        <Section>
          <Row>
            <Column>
              <SuperTitle>Ian Hamblin</SuperTitle>
              <SuperSubTitle>Full Stack Web Development & 3D</SuperSubTitle>
            </Column>
            <Column>
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
            </Column>
          </Row>
          <Row>
            <Column>
              <Title>Technical Skills</Title>

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
                </SkillsBox>
              ))}
              <SkillsBox>
                <SubTitle>Frontend</SubTitle>
                <div>
                  HTML <Years>(20 yrs)</Years> / CSS <Years>(20 yrs)</Years> /
                  Javascript <Years>(20 yrs)</Years> / Typescript{' '}
                  <Years>(8 yrs)</Years> / React <Years>(3 yrs)</Years> /
                  Three.js <Years>(8 yrs)</Years> / Sass <Years>(3 yrs)</Years>{' '}
                  / Emotion <Years>(3 yrs)</Years> / MUI <Years>(3 yrs)</Years>{' '}
                  / React Three Fiber <Years>(1 yrs)</Years> / PHP{' '}
                  <Years>(5 yrs)</Years>
                </div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Testing</SubTitle>
                <div>
                  Jest (3 yrs) / React Testing Library (3 yrs) / Cypress (1 yrs)
                  / Storybook (1 yrs) / Log Rocket (1 yrs)
                </div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Map Technologies</SubTitle>
                <div>Mapping/Geospatial: Mapbox (8 yrs) / Cesium ( 1 yr )</div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>State Management</SubTitle>
                <div>Apollo (3 yrs) / GraphQL (3 yrs) / Zustand (3 yrs)</div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Cloud/DevOps</SubTitle>
                <div>
                  AWS (8 yrs) / git (10 yrs) / CI-CD ( 8 yrs) / Docker (5 yrs) /
                  Nginx (3 yrs) / apache(15 yrs)
                </div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Apps and Games</SubTitle>
                AR / VR / C# / Android Java / Kotlin / ios
              </SkillsBox>
              <SkillsBox>
                <SubTitle>3D</SubTitle>
                3ds Max / Blender / Photoshop / Unreal Engine / Unity / Three.js
                / Zbrush / Substance Painter / Gaea 2.0 / Davinci Resolve
              </SkillsBox>
            </Column>
            <Column>
              <Title>About Me</Title>
              <p>
                Hi, I'm Ian and I'm a web developer with a particular interest
                in 3D and earth mapping technologies. I built my first website
                in 1999 and have kept up to date with the latest technologies
                ever since, having developed industry standard applications in
                my previous roles using react, three.js, mapbox and cesium.
              </p>
              <p>
                My 20 year career has seen me work with a variety of platforms
                and technologies. Working in startups has taught me to be
                versatile, efficient and adaptable. I am passionate about
                learning and helping others achieve their goals.
              </p>
              <p>
                I am a highliy motivated, sociable, fast working and adaptable
                individual that is looking for roles where I can contribute and
                make a difference. I prefer office based work over remote when
                possible. As a more senior developer I am looking to mentor and
                help others and always like to contribute in meetings.
              </p>
              <p>
                In my personal life, I like to keep active with cycling and
                running. I once captained a local winning Dodgeball team. I am
                currently training for the great north run in aid of Prostate
                Cancer. I love to watch films, Formula 1 and football (I will
                tell you who I support if I get the job), I like to keep up to
                date with the latest tech on youtube and enjoy reading
                influential books such as 'The Mom Test' and 'Million Dollar
                Weekend'. Of course I also enjoy spending time with my family
                and friends and spending too much money on Lego!
              </p>
            </Column>
          </Row>
        </Section>
        <Section>
          <Column>
            <Title>Employment History</Title>
            {employmentHistory.map((employment) => (
              <CVEmploymentBox
                key={employment.company}
                employment={employment}
              />
            ))}
          </Column>
        </Section>
        <Section>
          <Row>
            <Column>
              <Title>Education</Title>
              {education.map((edu) => (
                <SubRow key={edu.date}>
                  <SkillsBox>{edu.date}</SkillsBox>
                  <div>{edu.description}</div>
                </SubRow>
              ))}
            </Column>
            <Column>
              <Title>Interests and Achievements</Title>
              <List>
                {interestsAndAchievements.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </List>
            </Column>
          </Row>
        </Section>
      </CVWrapper>
      <DownloadButton onClick={handleDownload}>
        Download PDF Version
      </DownloadButton>
    </SubPage>
  );
}

export default CVMain;
