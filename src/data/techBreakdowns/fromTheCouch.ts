import { ZIPPY_NEW_TEXTURES_CROP } from '../videoCrop';
import type { TechBreakdown } from './types';

/*
 * Zippy Town from the couch: how the Blender PC, the Linux machine and the
 * phone are wired together so a coding agent can run the whole loop. Written
 * with Hacker News in mind; the art pipeline itself is zippyTown.ts.
 *
 * Every number below was taken from the Zippy Town repos on Ian's PC
 * (3DToonTownWebVersion: CLAUDE.md, build-and-install.sh,
 * src/scripts/blenderRemote.js, git log; blender_addon: README.md,
 * remote_control.py) in October 2026. Anything that could not be verified
 * there is a `todo` and shows on the page as a TODO(Ian) note. Do not replace
 * a todo with a guess.
 */
export const fromTheCouchBreakdown: TechBreakdown = {
  slug: 'from-the-couch',
  project: 'Zippy Town',
  title: 'Developing my Android app from the couch',
  summary:
    'My live wallpaper is spread over three devices: Blender bakes on a PC with a GPU, a Linux machine builds the app, and a phone runs it. I added a remote control to my Blender add-on and made every step scriptable, so a coding agent can run the whole loop while I sit on the couch.',
  hero: {
    video: '/videos/ZippyTown_NewTextures_Clip2.mp4',
    poster: '/posters/zippy_town_newtextures.webp',
    crop: ZIPPY_NEW_TEXTURES_CROP,
    alt: 'Zippy Town: a cartoon city with traffic and boats, rendered in real time',
  },
  links: [
    { label: 'zippy.town', href: 'https://zippy.town/' },
    { label: 'The art pipeline', href: '/tech/zippy-town' },
  ],
  playStore: {
    packageName: 'digital.overvieweffect.zippytown',
    title: 'Try it on your phone',
    body: 'The live wallpaper this setup builds is on Google Play.',
  },

  pipeline: {
    intro:
      'Three machines do the work. The export server on the Linux machine sits in the middle: the agent talks to it, Blender takes its orders from it, and the phone gets its builds from the same machine.',
    source: { id: 'couch', label: 'Couch · Linux machine' },
    outputs: [
      { id: 'blender', label: 'PC · Blender + GPU' },
      { id: 'phone', label: 'Phone · over Wi-Fi' },
    ],
    note: 'Blender sends its exports back to the export server, so the next phone build picks them up.',
    nodes: [
      {
        id: 'ask',
        label: 'Ask',
        tool: 'Claude Code',
        stageId: 'agent',
        lane: 'couch',
      },
      {
        id: 'queue',
        label: 'Queue',
        tool: 'Export server · Node',
        stageId: 'setup',
        lane: 'couch',
      },
      {
        id: 'poll',
        label: 'Remote Control',
        tool: 'Add-on · Python',
        stageId: 'remote-control',
        lane: 'blender',
      },
      {
        id: 'bake',
        label: 'Bake + export',
        tool: 'Cycles · glTF',
        stageId: 'agent',
        lane: 'blender',
      },
      {
        id: 'build',
        label: 'Build',
        tool: 'Gradle',
        stageId: 'wifi',
        lane: 'phone',
      },
      {
        id: 'install',
        label: 'Install',
        tool: 'adb · wireless',
        stageId: 'wifi',
        lane: 'phone',
      },
    ],
  },

  stages: [
    {
      id: 'setup',
      title: 'Three machines, one export server',
      tools: ['Node', 'Tailscale', 'Token auth'],
      problem:
        "Zippy Town needs three devices for one change. Blender and Cycles bake on my PC, because that's where the GPU is. The git checkout, the Android SDK and the build scripts live on a Linux machine. And a live wallpaper only really gets tested on a phone. An art change has to go through all three.",
      solution: [
        "The Linux machine runs a small Node server, the export server, on port 8787. Blender's Export to Server button uploads GLBs and lightmaps to it, and it compresses them into the KTX2 files the web and Android builds use. Blender reaches it on the LAN or over Tailscale, and every request needs a token.",
        "With the PC and the phone both driven from the Linux machine, a terminal on that machine is all I need, wherever I am in the house. That's also where the coding agent runs.",
      ],
      result:
        'I can re-bake the lighting, rebuild the textures and see the result on my phone’s home screen without going to the desk.',
      facts: [
        { label: 'Export server', value: 'Node, port 8787' },
        { label: 'Reachable over', value: 'LAN or Tailscale' },
      ],
      media: {
        src: '/images/tech/zippy-town/export-server.jpg',
        alt: "Blender's Export to Server panel with Remote Control connected, next to the export server terminal log",
        caption:
          "The export server running on the Linux machine (right: Blender's Export to Server panel, connected over the LAN).",
      },
      todos: [
        'What do you use on the couch (laptop, tablet, phone), and how does it reach Claude Code on the Linux machine (SSH, Remote Control, the desktop app)? The page needs a sentence on this.',
        'Is the Linux machine a home server or a desktop? The Zippy Town page calls it the build machine.',
      ],
    },
    {
      id: 'remote-control',
      title: 'A remote control inside the Blender add-on',
      tools: ['Python', 'bpy', 'HTTP long poll'],
      problem:
        "Blender has no way to take orders from another machine. I didn't want to open a port on the PC for it, and I didn't want anything that could run arbitrary Python inside the .blend I'm working in.",
      solution: [
        'I added Remote Control to my Blender add-on. When it’s on, Blender asks the export server for its next command with a long poll (/blender/next, up to 25 seconds per request) and posts the result back. Every connection starts from the PC, so the PC needs no firewall change.',
        'The add-on only accepts a fixed list of 21 commands, such as info, list_objects, set_mode, bake, export, save and revert. One of them, operator, can run the add-on’s own toontown.* operators and nothing else. Nothing in the list runs arbitrary Python.',
        "Blender's API is only safe on the main thread, so the network wait runs on a worker thread and the commands run on the main thread from a timer. Blender stays usable between commands. A bake still freezes the UI while it runs, the same as pressing Bake All, but it posts each log line back as it goes, so progress shows on the server.",
      ],
      result:
        'On the Linux machine, npm run blender -- bake halloween queues a bake on the PC, waits for it, prints the log and the result as JSON, and exits non-zero if it failed. A script or an agent can check it like any other command.',
      facts: [
        {
          label: 'Commands',
          value: '21',
          source: 'COMMANDS in remote_control.py',
        },
        { label: 'Long-poll wait', value: '25 s' },
        { label: 'Inbound ports on the PC', value: '0' },
      ],
      media: {
        src: '/images/tech/zippy-town/remote-control-log.jpg',
        alt: 'Export server terminal showing Blender commands being queued, sent and completed',
        caption:
          'The export server log: each Remote Control command is queued, sent to Blender on the next poll, and reported done.',
      },
    },
    {
      id: 'agent',
      title: 'Letting the agent drive',
      tools: ['Claude Code', 'CLAUDE.md', 'npm scripts'],
      problem:
        'A command line on its own still leaves me running every step. Changing the seasonal props, for example, takes six steps across two machines, in order, and each one waits on the last.',
      solution: [
        "Claude Code runs on the Linux machine, in the same checkout. The repo's CLAUDE.md documents npm run blender and what each command does, so the agent can look at the open .blend, switch modes, start a bake, export and read the results without me touching the PC.",
        'The sequence I run most often is a single button. The seasonal props editor runs on the web build’s dev server, which is reachable on the LAN, and has a Bake on beast button (beast is the PC). It saves the prop placements, then the export server runs the job: Blender swaps the new props in for the old ones, saves the .blend, bakes the season’s lightmaps and exports, and the server rebuilds the Android textures. The editor polls the job’s status, so I can follow it from any browser on the network.',
      ],
      result:
        'Since late July, 196 commits in the Zippy Town repo are co-authored by Claude Code, and because Blender is scriptable the agent can work on the art pipeline as well as the code.',
      facts: [
        {
          label: 'Commits co-authored by Claude Code',
          value: '196',
          source: 'git log, since 25 Jul 2026',
        },
        { label: 'Seasonal prop change', value: '6 steps, 1 button' },
      ],
      media: {
        alt: 'The seasonal editor’s Bake on beast panel during a job',
        caption:
          'Screenshot: the seasonal editor’s bake panel mid-job, ideally on the couch device.',
      },
      todos: [
        'One real example of something you asked the agent for from the couch, in your own words, would make this section.',
      ],
    },
    {
      id: 'wifi',
      title: 'Builds on the phone over Wi-Fi',
      tools: ['adb', 'Wireless debugging', 'Gradle', 'Bash'],
      problem:
        'A live wallpaper has to be checked on a real phone, on the home screen, and a USB cable keeps the phone at the desk.',
      solution: [
        'The phone stays paired using Android’s wireless debugging. build-and-install.sh builds the APK with Gradle and installs it with adb over Wi-Fi.',
        "For that to work unattended, the script handles the cases a person would spot at a glance. Wireless debugging often lists the same phone twice (mDNS duplicates), so the script uses the first. A Fire TV Cube is always connected to adb and would be picked whenever the phone dropped off, so it's ignored unless named; a TV has no live wallpaper picker, so an install there would prove nothing. Every APK is also copied to a WebDAV share, so I can still install it by hand when the phone is out of the house.",
        "Before each install the versionName goes up, and the app's settings screen shows it. That's how I know the phone is running the new build and not the last one.",
      ],
      result:
        'The draw-call counts on the Zippy Town breakdown were measured this way. I asked for draw calls per frame on my Note20. Android 13 no longer lets you trace individual OpenGL calls, and Filament has no draw counter you can read from Java, so the agent added a debug-only counter that logs every 5 seconds, installed the debug build over Wi-Fi with my data kept and the wallpaper still set, and read the log back: about 142 draws per frame.',
      facts: [
        { label: 'Install', value: 'adb over Wi-Fi' },
        { label: 'Away from home', value: 'APK on a WebDAV share' },
      ],
      media: {
        alt: 'build-and-install.sh output next to the phone',
        caption:
          'Screenshot: build-and-install.sh output, and the phone’s settings showing the new version.',
      },
    },
    {
      id: 'guards',
      title: 'Scripts that refuse the wrong thing',
      tools: ['Node', 'Wrangler', 'git tags'],
      problem:
        'When an agent can deploy, the deploy script has to catch mistakes on its own. zippy.town broke once in October when a two-month-old dist/ folder was uploaded directly with wrangler pages deploy.',
      solution: [
        'npm run deploy:web refuses to run unless the working tree is clean and pushed. It checks the live site’s build-info.json and refuses if the live build is newer than mine or has diverged. It always deletes dist/ and builds fresh, and after uploading it waits until the live build-info names the commit it just deployed.',
        'Then it tags the commit web-YYYY-MM-DD-HHMM, so git tag -l "web-*" is the deploy history, and a rollback is checking out an older tag and redeploying it.',
        'Remote Control follows the same idea: a fixed list of commands instead of a Python prompt.',
      ],
      result:
        'The checks are the same whoever runs the deploy, me at the desk or the agent from the couch.',
      media: {
        alt: 'npm run deploy:web refusing to deploy',
        caption:
          'Screenshot: npm run deploy:web refusing a dirty tree or an unpushed commit.',
      },
    },
  ],

  budgets: {
    title: 'The numbers',
    intro: 'Figures from my setup, October 2026.',
    groups: [
      {
        title: 'Loop times',
        facts: [
          { label: 'Full-city bake', value: '≈ 25 min', source: 'Bake All' },
          {
            label: 'Bake on beast, start to finish',
            todo: 'How long a seasonal Bake on beast round trip takes.',
          },
          {
            label: 'Debug build + Wi-Fi install',
            todo: 'Typical time for build-and-install.sh, from command to installed.',
          },
        ],
      },
      {
        title: 'Phone',
        facts: [
          { label: 'Test phone', value: 'Galaxy Note20 Ultra' },
          {
            label: 'Draw calls per frame',
            value: '≈ 142',
            source: 'measured over Wi-Fi',
          },
        ],
      },
      {
        title: 'Repo',
        facts: [
          { label: 'Commits', value: '741', source: 'since Nov 2020' },
          {
            label: 'Co-authored by Claude Code',
            value: '196',
            source: 'since 25 Jul 2026',
          },
        ],
      },
    ],
  },
};
