import { useCallback, useRef } from 'react';
import {
  Column,
  CVWrapper,
  DownloadButton,
  List,
  Row,
  Section,
  SectionRight,
  SkillsBox,
  SubRow,
  SubTitle,
  Title,
} from './CV.styles';
import CVEmploymentBox from './CVEmploymentBox';
import { EmploymentHistoryItem } from './CVInterfaces';
import SubPage from '../../SubPage/SubPage';

function CVMain() {
  const cvWrapperRef = useRef<HTMLDivElement>(null);

  const employmentHistory: EmploymentHistoryItem[] = [
    {
      company: '3DEO',
      role: 'Visual Engineer',
      dates: '2016 - Present',
      description: [
        'Built a 3D terrain visualizer for displaying and analysing Bathymetry (under water) elevation data.',
        'Used shaders to visualize elevation data in colour, for more useful analysis.',
        'Created terrain analysis tools such as cross section of elevation and sediment volume calculation.',
        'Worked with Harwich Port to translate their multi depth scanning technique into colour system for harbour pilots.',
        'Used elevation data in shader to calculate shadows and lighting in realtime.',
        'Wrote shader to allow blending between different elevation data over time.',
        'Worked with team to build ‘Active Maps’, for displaying geo based data on maps.',
        'Created Server app for converting raw cctv feed to browser compatible video stream.',
        'Created an AR mobile app to show air quality at various real world locations.',
        'Built COP26 journey. A 3D flythrough of the Forth estuary, interspersed with videos and user interactions.',
        'Worked with AWS EC2, S3 and other backed infrastructure.',
      ],
    },
    {
      company: 'Freelance Developer',
      role: 'App Development',
      dates: '2011 - 2016',
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

  return (
    <SubPage title="CV / Resume" expand>
      <CVWrapper ref={cvWrapperRef}>
        <SectionRight />
        <Section>
          <Row>
            <Column>
              <Title>Technical Skills</Title>
              <SkillsBox>
                <SubTitle>Web</SubTitle>
                <div>
                  Typescript / React / Sass / Emotion / MUI / Apollo Three.js /
                  React Three Fiber / Mapbox / Cesium AWS / Graphql / git / CI /
                  CD / Docker / Nginx / apache
                </div>
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Apps and Games</SubTitle>
                AR / VR / Unity c# / Android Java / Kotlin / ios
              </SkillsBox>
              <SkillsBox>
                <SubTitle>3D</SubTitle>
                Modelling / Rendering / PBR Materials / Texturing / UV
                Unwrapping
              </SkillsBox>
            </Column>
            <Column>
              <Title>About Me</Title>
              <p>
                Hi, I'm Ian and i'm a devloper with a passion for visualisation
                and user experience. I have a strong background in 3D
                visualisation and have worked on a wide range of projects from
                educational games to web based terrain analysis platforms.
              </p>
              <p>
                My 20 year career has seen me work with a variety of platforms
                and technologies. Working in startups has taught me to be
                versatile, efficient and adaptable. I am passionate about
                learning and helping others achieve their goals.
              </p>
              <p>
                I view myself as a highliy motivated, sociable, fast working and
                adaptable individual. I have ocassionally taken responsibility
                as a leader (like the time I captained my own dodgeball team!).
              </p>
              <p>
                Outside of work I like to keep fit with cycling, walking,
                spending time with my family, reading, gardening and building
                Lego!
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
