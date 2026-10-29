import { ZIPPY_NEW_TEXTURES_CROP } from '../videoCrop';
import type { TechBreakdown } from './types';

/*
 * Zippy Town: Blender -> web + Android pipeline.
 *
 * Every number below was taken from the Zippy Town repos on Ian's PC
 * (3DToonTownWebVersion: CLAUDE.md, ISSUES.md, blender_addon/README.md,
 * src/scripts/*.js|mjs, app/build.gradle) in October 2026. Anything that
 * could not be verified there is a `todo` and shows on the page as a
 * TODO(Ian) note. Do not replace a todo with a guess.
 */
export const zippyTownBreakdown: TechBreakdown = {
  slug: 'zippy-town',
  project: 'Zippy Town',
  title: 'Blender → Android Pipeline',
  summary:
    'One Blender scene, two renderers: a custom Blender add-on bakes Cycles lighting into lightmaps, a small export server compresses everything to KTX2, and the same assets ship to a three.js website and a native Filament live wallpaper on Android.',
  hero: {
    video: '/videos/ZippyTown_NewTextures_Clip2.mp4',
    poster: '/posters/zippy_town_newtextures.webp',
    crop: ZIPPY_NEW_TEXTURES_CROP,
    alt: 'Zippy Town: a cartoon city with traffic and boats, rendered in real time',
  },
  links: [{ label: 'zippy.town', href: 'https://zippy.town/' }],
  // applicationId in app/build.gradle; listing checked live on Google Play
  // ("Zippy Town 3D Live Wallpaper") in October 2026.
  playStore: {
    packageName: 'digital.overvieweffect.zippytown',
    title: 'Try it on your phone',
    body: 'Android developer? Install the live wallpaper to see the Filament renderer, ASTC textures and baked lighting from this page running on your own device.',
  },

  pipeline: [
    {
      id: 'blender',
      label: 'Author',
      tool: 'Blender 5.1',
      stageId: 'authoring',
      lane: 'source',
    },
    {
      id: 'bake',
      label: 'Bake light',
      tool: 'Cycles · EXR',
      stageId: 'bake',
      lane: 'source',
    },
    {
      id: 'export',
      label: 'Export server',
      tool: 'Node · gltf-transform',
      stageId: 'export',
      lane: 'source',
    },
    {
      id: 'web',
      label: 'Web build',
      tool: 'Draco · UASTC',
      stageId: 'web',
      lane: 'web',
    },
    {
      id: 'three',
      label: 'Browser',
      tool: 'three.js',
      stageId: 'web',
      lane: 'web',
    },
    {
      id: 'native',
      label: 'Native textures',
      tool: 'ASTC · ETC2',
      stageId: 'native-textures',
      lane: 'android',
    },
    {
      id: 'filament',
      label: 'Live wallpaper',
      tool: 'Filament · Kotlin',
      stageId: 'filament',
      lane: 'android',
    },
    {
      id: 'devices',
      label: 'Device lab',
      tool: 'Firebase Test Lab',
      stageId: 'devices',
      lane: 'android',
    },
  ],

  stages: [
    {
      id: 'authoring',
      title: 'Authoring & validation: Toon Town Tools add-on',
      tools: ['Blender 5.1', 'Python', 'bpy'],
      problem: `As with most games/3d apps, when dealing with an interactive 3d environment, the assets need a specific setup
        that the code expects. Any small error or change can break the app or cause visual errors and even behaviour that is
        not intended. It's very easy to miss a setting that leads to a bad lightmap bake, or cause a problem or failed export.
        `,
      solution: [
        'A custom Blender add-on (~7,600 lines of Python in its main module) lists every export mesh and runs a table of checks on each one: missing Triangulate modifier, multiple materials, material shared with another mesh, WebP textures, ORM maps that will not pack. Each failing mesh shows the reason.',
        'Each check has a one-click fix where it can: Separate by Material, Make Material Unique, Fix Triangulation on Export Meshes, Rename Single Materials to Mesh. An Image Usage panel shows every image with its size and users, finds duplicate images and duplicate texture nodes, and merges them.',
        'New checks are one line: a (label, predicate) pair added to a CHECKS tuple automatically appears in the list highlighting and the detail panel.',
      ],
      result:
        'Export problems are caught in Blender, at the mesh that causes them, before anything reaches a device.',
      media: {
        src: '/images/tech/zippy-town/blender-addon.png',
        alt: 'The Toon Town Tools panel in Blender showing the mesh list, lighting mode and bake settings',
        caption:
          'Toon Town Tools in Blender: mesh list with status, lighting mode, and the Bake All panel (1024px lightmap, 2048 samples).',
      },
    },
    {
      id: 'bake',
      title: 'Baking light: Cycles to HDR lightmaps',
      tools: ['Cycles', 'OpenEXR', 'AgX'],
      problem: `Getting cycles/Blender lighting solution into an android app that can't possibly calculate global illumination 
        in real time on low end devices is a challenge.`,
      solution: [
        'The add-on bakes per-mesh ambient occlusion and lightmaps in Cycles. Lightmaps are Diffuse with Direct + Indirect and Colour off, so they hold pure light, not albedo. Each bake writes a 32-bit float EXR master plus the shipped PNG.',
        'Five lighting modes (Day, Night, Halloween Day, Halloween Night, Golden Hour) each bake to their own images, so nothing overwrites another mode. Switching mode swaps the collections, the World and the view exposure to match the app. Bake All walks every mesh with a second UV channel for the active set.',
        'The shipped lightmap stores scene-linear light ÷ 8 through a plain sRGB curve. The shaders decode it, multiply by 8 and by the albedo, then apply Blender\'s own AgX "Punchy" view transform, exported from Blender as a 33³ LUT and shared by the web and Android shaders.',
      ],
      result:
        "I compared the real-time result with Cycles renders from the same camera. On matte surfaces the colours are within about 1.5/255 of Blender's. The three.js AgX tone mapping I used before, with AO on top, was about 8/255 darker. The lightmap stores light divided by 8, so anything brighter than 8 (scene-linear) clips, but that's under 0.1% of any bake and only in the hotspots right under the lamps at night.",
      facts: [
        { label: 'Lightmap encoding', value: 'linear ÷ 8, sRGB curve' },
        { label: 'Match to Cycles (matte)', value: '≈ 1.5 / 255' },
        { label: 'Lightmap size', value: '1024 × 1024 per mesh' },
        { label: 'Bake samples', value: '2048 (add-on panel)' },
        { label: 'Full-city bake time', value: '≈ 25 min', source: 'Bake All' },
      ],
      media: {
        alt: 'Placeholder: lightmap before and after',
        caption:
          'Drop in: one mesh shown three ways (albedo only, lightmap only, final), e.g. Buildings2Optimised with its day lightmap.',
      },
    },
    {
      id: 'export',
      title: 'Export server & Blender remote control',
      tools: ['Node.js', 'gltf-transform', 'KTX-Software'],
      problem: `I work from different machines and wanted to store the main repo and phone deployment on my server. My server does
        not have a powerful GPU for cycles and blender work and manually copying GLBs and lightmaps by hand after every
         bake or scene edit is slow and error-prone.`,
      solution: [
        `An "Export to Server" button writes the GLB and POSTs it, with every lightmap belonging to the included 
        meshes, to a small token-authenticated Node HTTP server on my home server. The server compresses 
        textures to UASTC with gltf-transform and encodes each lightmap PNG to KTX2.`,
        `Remote Control runs the other way: Blender long-polls the server for work, so scripts on the build 
        machine can switch modes, bake a whole lightmap set or export, using a fixed command list with no way to 
        run arbitrary Python. Progress is posted back per mesh.`,
      ],
      result:
        "One click in Blender updates the shipped assets on the build machine, and bakes can be queued from there while running on the PC's GPU.",
      media: {
        alt: 'Placeholder: export to server',
        caption:
          'Drop in: the Export to Server panel next to the server terminal showing the upload, KTX2 encode and inventory diff.',
      },
    },
    {
      id: 'native-textures',
      title: 'Android textures: UASTC → ASTC, without a decode',
      tools: ['KTX-Software', 'ASTC', 'ETC2'],
      problem: `Android's strict memory limits for a wallpaper means our textures and lightmaps were a challenge to pack
        into the modest memory budget. I wanted the whole app to consume under 200 MB in total so that Android is unlikely
        to kill the app, which then unsets the live wallpaper, leading to a poor user experience. Filament's glTF loader can only pick an uncompressed format for linear data like lightmaps, making this problematic`,

      solution: [
        "A build script keeps the geometry going through Filament's glTF loader but swaps every image for a 4×4 placeholder (so the right shader variant is still chosen) and writes the real textures as ASTC sidecar files, uploaded by a custom KTX2 reader.",
        'Because the source images are already UASTC, it re-wraps them with ktx transcode instead of decoding and re-encoding. Lightmaps and AO use ASTC 6×6 (0.63 MB per 1024² map vs 1.40 MB at 4×4, indistinguishable on a phone); colour and normal maps stay 4×4.',
        'A parallel ETC2 set is built for GPUs without ASTC support.',
      ],
      result:
        'About 56 MB saved on the lightmaps alone, with a fallback for GPUs that lack ASTC.',
      facts: [
        { label: 'Lightmaps as RGBA8', value: '≈ 90 MB GPU' },
        { label: 'Saved by ASTC (lightmaps)', value: '≈ 56 MB' },
        { label: 'Lightmap block size', value: 'ASTC 6×6 (3.56 bpp)' },
      ],
      media: {
        alt: 'Placeholder: ASTC 4×4 vs 6×6 lightmap',
        caption:
          'Drop in: a lightmap crop at ASTC 4×4 next to ASTC 6×6, showing the quality difference is invisible at phone size.',
      },
    },
    {
      id: 'filament',
      title: 'The live wallpaper: native Filament',
      tools: ['Filament 1.71.6', 'Kotlin', 'GLSL'],
      problem:
        'The first wallpaper ran the three.js build in a WebView. It measured about 710 MB, and an empty WebView alone is 154 MB, so it could never meet a 200 MB budget.',
      solution: [
        'The wallpaper is a native Filament renderer. The city shader is a port of the three.js one, and both include the same view-transform GLSL file, so the web and the phone tone map identically. three.js stays the visual reference.',
        'It runs in its own Android process, separate from the app. The renderer is built on demand and released 15 s after the wallpaper is hidden (or at once on onTrimMemory); a warm rebuild takes about 260 ms while the surface keeps its last frame.',
        'Cars share one GLB, with extra copies created lazily as gltfio instances that share vertex and index buffers. Seasonal props are instanced, one renderable per 64 placements, with transforms and baked light in uniform arrays.',
      ],
      result:
        'About 138 MB idle and 260 MB while drawing on a Galaxy Note20, down from about 710 MB for the WebView version.',
      facts: [
        { label: 'WebView wallpaper', value: '≈ 710 MB' },
        { label: 'Native, idle (Note20)', value: '≈ 138 MB' },
        { label: 'Native, drawing (Note20)', value: '≈ 260 MB' },
        { label: 'Warm rebuild', value: '≈ 260 ms' },
      ],
      media: {
        alt: 'Placeholder: wallpaper on a phone',
        caption:
          'Drop in: the live wallpaper on a home screen (day and night), ideally next to an Android Studio memory profile.',
      },
    },
    {
      id: 'web',
      title: 'The web build: same assets, smaller',
      tools: ['three.js', 'Vite', 'Draco', 'Cloudflare'],
      problem:
        'The APK and the website share the source GLBs, but desktop GPUs need Basis rather than ASTC, and the city GLB was 17 MB.',
      solution: [
        'At build time a Vite plugin rewrites only the copies in dist/: textures are halved (a quarter of the texels) and re-encoded to UASTC, and geometry is Draco-compressed with 16-bit position quantisation (the city is about 68 units across).',
        "Deploys go through a guard script that refuses unless the tree is clean and pushed, checks the live site's build-info is not newer, builds fresh, verifies the upload and tags the release. It exists because a two-month-old dist/ once went live by hand and broke the site.",
      ],
      result:
        'Draco alone takes the 17.04 MB city GLB (7.62 MB textures, 9.42 MB vertex data) to about 8.4 MB before the half-resolution pass. The logo GLB goes from 5.47 MB to about 1.3 MB.',
      facts: [
        { label: 'City GLB (source)', value: '17.04 MB' },
        { label: 'After Draco', value: '≈ 8.4 MB' },
        {
          label: 'Final city GLB on zippy.town',
          value: '≈ 3.6 MB',
          source: 'live file, Oct 2026',
        },
      ],
      media: {
        src: '/images/zippytown.webp',
        alt: 'Zippy Town rendered in the browser',
        caption: 'The three.js build running on zippy.town.',
      },
    },
    {
      id: 'atlas',
      title: 'Atlas tricks: new looks with no new draw calls',
      tools: ['Blender (headless)', 'Python', 'NumPy'],
      problem:
        'Adding detail usually means new materials, textures and draw calls, which is exactly what a wallpaper cannot spend.',
      solution: [
        'The painted road look is packed into an unused corner of the existing 2048×1024 RoadsAndSign atlas. A headless Blender script classifies road faces (straights and junction types) and rewrites only their colour UVs; lightmap UVs and topology are untouched, and the script asserts the vertex and face counts.',
        'Every region edge is a multiple of 16 px, so the web half-res pass and 4×4 block formats (UASTC, ASTC, ETC2) stay block-aligned, and the free block is edge-extended so mip levels never bleed.',
        'Water colour lives in its own 1024² map in lightmap UV space, generated by a headless Blender script that raycasts the terrain to find the coast.',
      ],
      result:
        'A new road look and tropical shallows with no new material, image or draw call.',
      media: {
        alt: 'Placeholder: road atlas',
        caption:
          'Drop in: the RoadsAndSign atlas with the packed road sub-atlas outlined, next to the roads in game.',
      },
    },
    {
      id: 'devices',
      title: 'Testing on real devices',
      tools: ['Firebase Test Lab', 'Robo', 'Gradle'],
      problem:
        'A Play review rejected the app for crashing with no crash report anywhere: native aborts in Filament leave no Java stack trace, and it ran fine on the four in-house Samsung phones.',
      solution: [
        'A playtest build throws on a missing GPU capability (release degrades quietly instead), so Test Lab flags the device with a reason. Every run logs a capability dump: ABIs, SDK, heap, Filament feature level, ASTC support.',
        'To test below the shipping minimum, a probe APK is built with a Gradle -PminSdkOverride flag, since Android will not install an app below its own minSdk.',
      ],
      result:
        'Two 2018 flagships below the old floor matched the control phone, and a 1.7 GB budget phone held a 59 fps median, so v11 lowered minSdk from 30 to 28. (30 s windows, no thermal soak, in-app preview.)',
      facts: [
        {
          label: 'Pixel 3 (API 28)',
          value: '60 / 59 fps',
          source: 'median / p90-low',
        },
        {
          label: 'Galaxy S9 (API 29)',
          value: '60 / 59 fps',
          source: 'median / p90-low',
        },
        {
          label: 'Galaxy A10 (API 29)',
          value: '59 / 39 fps',
          source: 'median / p90-low',
        },
        {
          label: 'Pixel 5 (API 30)',
          value: '60 / 58 fps',
          source: 'median / p90-low',
        },
      ],
      media: {
        alt: 'Placeholder: Test Lab results',
        caption:
          'Drop in: the Firebase Test Lab matrix or a ZippyCaps capability log from one run.',
      },
    },
  ],

  budgets: {
    intro:
      "The wallpaper has to run all day on someone else's phone. These are the targets and measured numbers it is held to.",
    groups: [
      {
        title: 'Devices',
        facts: [
          { label: 'Minimum Android', value: 'API 28 (Android 9)' },
          { label: 'Target SDK', value: '36' },
          { label: 'ABIs', value: 'armeabi-v7a, arm64-v8a, x86_64' },
          { label: 'GPU', value: 'GLES 3.2; ASTC, ETC2 fallback' },
        ],
      },
      {
        title: 'Frame time',
        facts: [
          { label: 'Target', value: '60 fps (16.7 ms)' },
          { label: 'Budget phone (Galaxy A10)', value: '59 fps median' },
        ],
      },
      {
        title: 'Memory',
        facts: [
          { label: 'Budget', value: '200 MB' },
          { label: 'Idle / drawing (Note20)', value: '≈ 138 / 260 MB' },
          { label: 'Hidden', value: 'renderer released after 15 s' },
        ],
      },
      {
        title: 'Geometry',
        facts: [
          { label: 'City vertex data', value: '9.42 MB (f32)' },
          { label: 'City triangles', value: '≈ 123k' },
          { label: 'Vehicle set triangles', value: '≈ 16k' },
        ],
      },
      {
        title: 'Textures',
        facts: [
          { label: 'Lightmaps', value: '1024², ASTC 6×6' },
          { label: 'Colour / normal', value: 'ASTC 4×4' },
          { label: 'Roads + signs atlas', value: '2048 × 1024' },
        ],
      },
      {
        title: 'Draw calls',
        facts: [
          { label: 'Seasonal props', value: '1 per 64 placements' },
          { label: 'Road restyle', value: '0 added' },
          {
            label: 'Per frame (Note20)',
            value: '≈ 142',
            source: 'Halloween night, app view',
          },
          { label: 'Car shadows', value: '64 (≈ 45%)', source: 'same frame' },
        ],
      },
    ],
  },

  closing: {
    title: "What I'd bring to console work",
    points: [
      {
        title: 'Tools that keep artists in their DCC',
        body: 'Validation, one-click fixes, baking and export live in Blender, where the problem is, rather than in a wiki page or a build log.',
      },
      {
        title: 'Working to a fixed memory and frame budget',
        body: 'Measuring first, then choosing formats and process boundaries to fit: ASTC sidecars, block sizes per map type, a renderer released while hidden.',
      },
      {
        title: 'Offline quality, real-time cost',
        body: 'Baked lighting matched to the offline renderer within a couple of 8-bit levels, with one view transform shared across two engines.',
      },
      {
        title: 'Testing on the hardware that ships',
        body: 'Device farms, capability dumps and probe builds instead of trusting the spec sheet.',
      },
      {
        title: 'Guard rails in the pipeline',
        body: 'Build and deploy steps that refuse to ship stale or unpushed output, written after learning that lesson once.',
      },
    ],
    todos: [
      'Review this section and make it your own voice; it is a first draft from the project notes.',
    ],
  },
};
