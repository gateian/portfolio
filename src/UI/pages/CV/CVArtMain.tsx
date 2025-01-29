import { useContext, useEffect, useRef } from 'react';
import {
  Column,
  ContactDetails,
  CVWrapper,
  EducationBox,
  List,
  Row,
  Section,
  SectionRight,
  SkillsBox,
  SubRow,
  SubTitle,
  SuperSubTitle,
  SuperTitle,
  Title,
} from './CV.styles';
import StateContext from '../../../StateContext';
import CVEmploymentBox from './CVEmploymentBox';
import { EmploymentHistoryItem } from './CVInterfaces';
import SubPage from '../../SubPage/SubPage';
import PrintCV from "../../PrintCV/PrintCV";

function CVArtMain() {
  const cvWrapperRef = useRef<HTMLDivElement>(null);
  const { setIsFullPage } = useContext(StateContext);

  useEffect(() => {
    setIsFullPage(true);

    console.log('CVArtMain useEffect');
    return () => {
      setIsFullPage(false);
    };
  }, [setIsFullPage]);

  const employmentHistory: EmploymentHistoryItem[] = [
    {
      company: '3DEO',
      role: '3D Engineer',
      dates: '2016 - 2024',
      description: [
        'Built a 3D tile based terrain visualizer for displaying and analysing Bathymetry (under water) elevation data.',
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
      dates: '2011 - 2016 and 2024 - Present',
      description: [
        'Generated 3D renders of the M-Sport Raptor Dakar Rally car for use in marketing materials.',
        'Worked on Combat Air Patrol 2 flight simulator. Modelling cockpits, Aircraft and various supporting assets.',
        "Created 'Ocean Depths' app for an exhibition. A first person journey into the depths of the ocean in a submarine.",
        'Built a VR driving simulator for highlighting the dangers of Alcohol and driving.',
        'Various AR based app, including displaying interactive information on a real world brain model.',
        'Worked on Sixty5 app for helping farmers spray fields using GPS data.',
        'Developed my skills in client management and personal organisation.',
        "Created 'Toon Town 3D' live wallpaper app for android. A little cartoon city as a mobile wallpaper.",
        'Built detailed model of Queens University building in Belfast.',
      ],
    },
    {
      company: 'Caspian Learning',
      role: 'Lead Artist',
      dates: '2005 - 2015',
      description: [
        'Building educational games for schools, military and professional industries.',
        'Used 3ds Max and Photoshop to create environments, objects and characters for the game engine.',
        'Worked with development team to enhance environment lighting with lightmapping pipeline.',
        'Worked closely with programmers to develop efficient and flexible character rig, which included facial animation.',
        'Created, applied and edited looping character animations for all game characters.',
        'Worked on projects for high profile clients such as Siemens, IBM, Fiat, Unilever and PWC.',
        'Developed tools to rapidly speed up art asset importing as well as improve quality.',
        'Organised and managed art assets across a range of projects, managing outsource teams.',
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

  return (
    <SubPage title="CV / Resume" expand>
      <CVWrapper ref={cvWrapperRef} className={"cv-container"}>
        <SectionRight />
        <Section>
          <Row>
            <Column>
            <SuperTitle>Ian Hamblin</SuperTitle>
            <SuperSubTitle>3D Graphics Specialist</SuperSubTitle>
          </Column>
          <Column>
          <ContactDetails>
            <div><b>Email:</b> ihamblin@gmail.com</div>
            <div><b>Phone:</b> 07882449285</div>
            <div><b>LinkedIn:</b> linkedin.com/in/ihamblin</div>
            <div><b>Portfolio:</b> https://ianhamblin.xyz</div>
          </ContactDetails>
          </Column>
          </Row>
          <Row>
            <Column>
              <Title>Technical Skills</Title>
              <SkillsBox>
                <SubTitle>3D Art</SubTitle>
                <div>
                  3ds Max / Blender / Photoshop / Unreal Engine / Unity /
                  Three.js / Zbrush / Substance Painter / Gaea 2.0 / Davinci
                  Resolve
                </div>
              </SkillsBox>

              <SkillsBox>
                <SubTitle>Code</SubTitle>
                AR / VR / Unity c# / Android Java / Kotlin / ios
              </SkillsBox>
              <SkillsBox>
                <SubTitle>Web</SubTitle>
                <div>
                  Typescript / React / Sass / Emotion / MUI / Apollo Three.js /
                  React Three Fiber / Mapbox / Cesium AWS / Graphql / git / CI /
                  CD / Docker / Nginx / apache
                </div>
              </SkillsBox>
            </Column>
            <Column>
            
              <Title>About Me</Title>
              <p>
                Hi, I'm Ian and i'm a 3D specialist with a passion for beutiful
                CG art and visuals. I have worked with 3D across a variety of
                disciplines since graduating from Teeside University in 2004. On
                top of having a background in 3D environments for games and CG
                Art, I also have experience in developing 3D content for the web
                and can also write shaders for visual effects.
              </p>
              <p>
                I am a highliy motivated, sociable, fast working and adaptable
                individual that loves to work in teams and learn from everybody
                around me. I have worked on projects for many high profile
                clients such as Price Waterhouse Cooper, HSBC, Fiat, Unilever
                and M-Sport and know how to work quickly and efficiently to meet
                tight deadlines.
              </p>
              <p>
                My other passions in life are Formula 1, Lego, Cycling, Video
                Games, Films and generally getting into nature with the family.
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
                  <EducationBox>{edu.date}</EducationBox>
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
      <PrintCV />
    </SubPage>
  );
}

export default CVArtMain;
