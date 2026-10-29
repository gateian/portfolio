"""
build_blockout_v06.py  -  v06 grey-box blockout generator for Ian Hamblin's v3 cinematic portfolio.
(Forked from build_blockout.py / v05, which stays the generator for the blockout_v05.blend master.)

Run (Windows):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --python build_blockout_v06.py -- D:\\projects\\portfolio-v3-blockout
Run (Linux/macOS):
  blender -b --python build_blockout_v06.py -- /path/to/outdir [--name blockout_v06.blend] [--render-previews dir "t,..."]

v06 / v06b (Oct 2026), from Ian's notes. Shunts (cues.json -> "shunts"): 1 = 0.60 s opening hit,
2 = 5.40 s, 3 = 10.20 s (v06 had mislabelled them 5.40 / 7.80 / 10.10 - kept as "shunts_v06_old").
  0 -> shunt 1   short black (FX_Blackout card in front of CAM_OPENER), cut to his face on shunt 1.
  shunt 1 -> 2   He faces OUT over the void (-Y). CAM_OPENER hangs in front of him over the drop looking
                 back at his face/chest; he barely moves (a breath) until halfway (T_MID), then looks
                 down, readies and crouches while the camera moves straight back (LINEAR, rising).
  shunt 2        jump out + backflip into a tuck; time ramps into slow motion through the apex
                 (cues.json -> "v06" -> "apex_slowmo"); CAM_MAIN simply follows him up the arc.
  shunt 3        he opens into a head-first dive; CAM_MAIN dives after him, follows, then twists round
                 (one full roll) into the normal-speed falling follow.
  Character      Ian's Meshy model (character/*.glb, collection Character_Model) rides CHAR_PIVOT; its
                 armature is keyed from the stand-in poses (Action ACT_Meshy_Poses). The stand-in boxes
                 are in Character_StandIn (hidden in render; un-hide to see/edit them).
  Upper level    a skyscraper city with emissive window strips; the breakthrough point is a pipe
                 access hatch (crust chunks kept) that several pipes converge on from random-looking
                 directions; the pipes dive into the ground and run down the shaft walls.
  Tunnel         lava rings kept; gentle bends (BENDS) and a teal machinery zone halfway down (ZONE).
  Ending         on the music drop-off the CAMERA (CAM_ENDING) overtakes him going down while he
                 brakes into his slow-down, leaving him above/off-screen, settles into a side view at
                 ground level, then he slams in from ~30 m at ~70 m/s (v05: ~3.5 m at 30 m/s).
  Cameras are switched by timeline markers (OPENER / MAIN / ENDING). Keys are sparse Bezier.
  CHAR_ROOT translates only; CHAR_PIVOT rotates (ZXY: rz twist, rx pitch/flip, ry roll).

World scale: 1 Blender unit = 1 metre. Crust/ground top is Z = 0, the fall line is X=0, Y=-8 (the
shaft centre bends away from it in the tunnel - see cl()).
"""
import bpy, bmesh, json, math, os, sys, random, shutil
from mathutils import Vector

# ----------------------------------------------------------------------------------------------
# Arguments / paths
# ----------------------------------------------------------------------------------------------
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
OUTDIR = os.path.abspath(argv[0]) if argv and not argv[0].startswith("--") else SCRIPT_DIR
PREVIEW_DIR, PREVIEW_TIMES = None, []
if "--render-previews" in argv:
    i = argv.index("--render-previews")
    PREVIEW_DIR = os.path.abspath(argv[i + 1])
    PREVIEW_TIMES = [float(x) for x in argv[i + 2].split(",")]
if "--name" in argv:
    BLEND_NAME_ARG = argv[argv.index("--name") + 1]
else:
    BLEND_NAME_ARG = None
os.makedirs(OUTDIR, exist_ok=True)

AUDIO_NAME = "brain-implant-330416.mp3"
BLEND_NAME = BLEND_NAME_ARG or "blockout_v06.blend"   # override with --name other.blend


def find_input(name):
    for d in (OUTDIR, SCRIPT_DIR, os.path.join(SCRIPT_DIR, "..", "music")):
        p = os.path.join(d, name)
        if os.path.isfile(p):
            return os.path.abspath(p)
    return None


# ----------------------------------------------------------------------------------------------
# Cues (cues.json drives the timeline; these defaults are only a fallback)
# ----------------------------------------------------------------------------------------------
DEFAULT_CUES = {
    "tempo": {"bpm": 100.0, "bar_s": 2.4, "first_downbeat": 0.6},
    "key_cues": [
        {"t": 0.51, "name": "opening_impact"}, {"t": 5.40, "name": "intro_impact_2"},
        {"t": 7.00, "name": "riser_start"}, {"t": 9.50, "name": "pre_pause_hit"},
        {"t": 9.60, "name": "pause_start"}, {"t": 10.10, "name": "reentry_impact"},
        {"t": 19.80, "name": "freeze_start"}, {"t": 21.50, "name": "freeze_lowest_filter"},
        {"t": 22.20, "name": "drop"}, {"t": 26.30, "name": "biggest_accent_in_drop"},
        {"t": 41.40, "name": "final_slowdown_start"}, {"t": 43.00, "name": "slowdown_lowest_filter"},
        {"t": 43.80, "name": "final_thump"}, {"t": 46.60, "name": "tail_quiet"}],
    "sections": [],
    "obstacle_hit_candidates": {
        "phase2_fall": [5.92, 6.05, 6.64, 7.10, 7.21, 9.20, 9.50, 10.86, 11.15, 11.46, 13.40, 14.46,
                        14.97, 15.66, 16.14, 16.70, 18.06, 19.07],
        "phase3_mantle": [22.72, 23.34, 23.90, 24.99, 25.26, 26.30, 27.63, 28.14, 28.70, 29.47, 30.96,
                          31.71, 33.50, 34.37, 36.08, 37.12, 37.74, 38.30, 39.65]},
}
CUES_PATH = find_input("cues.json")
CUES = DEFAULT_CUES
if CUES_PATH:
    with open(CUES_PATH, "r", encoding="utf-8") as fh:
        CUES = json.load(fh)
    print("[blockout] cues from", CUES_PATH)
else:
    print("[blockout] cues.json not found - using built-in defaults")

KEY = {c["name"]: float(c["t"]) for c in CUES["key_cues"]}
T_BOOM = KEY.get("opening_impact", 0.51)
T_LEAP = KEY.get("intro_impact_2", 5.40)
T_RISER = KEY.get("riser_start", 7.00)
T_PREHIT = KEY.get("pre_pause_hit", 9.50)
T_PAUSE = KEY.get("pause_start", 9.60)
T_REENTRY = KEY.get("reentry_impact", 10.10)
T_FREEZE = KEY.get("freeze_start", 19.80)
T_FREEZE_LOW = KEY.get("freeze_lowest_filter", 21.50)
T_DROP = KEY.get("drop", 22.20)
T_SETPIECE = KEY.get("biggest_accent_in_drop", 26.30)
T_SLOW = KEY.get("final_slowdown_start", 41.40)
T_SLOW_LOW = KEY.get("slowdown_lowest_filter", 43.00)
T_THUMP = KEY.get("final_thump", 43.80)
T_TAIL = KEY.get("tail_quiet", 46.60)
T_END = 52.0

# v05: the three opening shunts (editable in cues.json -> "shunts"; fallback = analysis values)
_SH = CUES.get("shunts", {})
def _sh(name, dflt):
    v = _SH.get(name, dflt)
    return float(v["t"] if isinstance(v, dict) else v)
# v06b: shunts re-identified from the audio: 1 = the opening hit, 2 = the jump hit, 3 = the dive hit
S1 = _sh("shunt_1_open", 0.60)            # black -> close-up on his face (he faces out over the void)
S2 = _sh("shunt_2_jump", T_LEAP)          # jump out + backflip into the tuck, apex slow motion
S3 = _sh("shunt_3_dive", 10.20)           # he opens into the dive; normal-speed descent
T_LEAP = S2                               # everything that keyed off the old leap now follows the jump
T_MID = 0.5 * (S1 + S2)                   # halfway: he starts to prepare, the camera starts to move back
# v05: bullet time on the wind-down (editable in cues.json -> "bullet_time")
_BT = CUES.get("bullet_time", {})
BT_START = float(_BT.get("start", T_FREEZE))
BT_SETTLE = float(_BT.get("settle", 20.45))
BT_MIN = float(_BT.get("min_rate", 0.035))
BT_DEEP = float(_BT.get("deepest", T_FREEZE_LOW))
BT_DEEP_RATE = float(_BT.get("deepest_rate", 0.025))
BT_CURL0 = float(_BT.get("curl_start", 20.10))
BT_CURL1 = float(_BT.get("curl_done", 21.10))
BT_END = float(_BT.get("end", T_DROP))
# v06: apex slow motion between shunt 2 and shunt 3 (cues.json -> "v06" -> "apex_slowmo")
_V6 = CUES.get("v06", {})
_AP = _V6.get("apex_slowmo", {})
AP_START = float(_AP.get("start", S2 + 0.3))      # real-time rate starts easing down
AP_SETTLE = float(_AP.get("settle", S2 + 0.8))     # fully slow
AP_RATE = float(_AP.get("rate", 0.1))         # 10x slow motion through the apex
AP_RELEASE = float(_AP.get("release", 9.6))   # starts speeding back up...
AP_END = float(_AP.get("end", S3))            # ...normal speed on shunt 3
# v06 ending (cues.json -> "v06" -> "ending")
_EN = _V6.get("ending", {})
T_CAM_DIVE = float(_EN.get("camera_dive", T_SLOW - 0.2))   # CAM_ENDING takes over and dives past him
T_SIDE = float(_EN.get("side_view", 42.3))                  # camera settled side-on at ground level
T_PLUNGE = float(_EN.get("plunge_start", 42.95))            # he starts to drop from the hang
PLUNGE_V = float(_EN.get("slam_speed", 70.0))               # m/s at impact

HITS = CUES.get("obstacle_hit_candidates", DEFAULT_CUES["obstacle_hit_candidates"])
HITS_A = sorted(float(t) for t in HITS["phase2_fall"])
HITS_B = sorted(float(t) for t in HITS["phase3_mantle"])
# Hits before the groove re-entry happen during the leap/riser: they get markers only, no monoliths.
PHASE2_OBSTACLE_START = 11.4  # v06: the descent proper starts on shunt 3; first monolith a beat later

FPS = 30


def F(t):
    """seconds -> frame (frame 1 == t 0)"""
    return int(round(t * FPS)) + 1


# ----------------------------------------------------------------------------------------------
# World layout constants (metres)
# ----------------------------------------------------------------------------------------------
FALL_X, FALL_Y = 0.0, -8.0      # the fall line
EDGE_Y = 2.0                     # rooftop edge (tower A occupies y >= EDGE_Y)
CHASM_HALF_X = 28.0              # chasm side walls at x = +-28
CHASM_FAR_Y = -48.0              # opposite tower face
SHAFT_R = 35.0                   # mantle shaft radius
CAVERN_R = 220.0                 # core cavern radius

# v06 clocks. The world clock (world_t) runs slow in two windows: the apex slow motion between
# shunt 2 and shunt 3, and v05's bullet time before the smash. Character + world read time through it.
JUMP_V0, JUMP_VY, G = 7.0, 3.6, 9.81      # launch speed up, backwards out over the edge, gravity
RATE_TABLE = [(AP_START, 1.0, "out"), (AP_SETTLE, AP_RATE, None), (AP_RELEASE, AP_RATE, "in"), (AP_END, 1.0, None),
              (BT_START, 1.0, "out"), (BT_SETTLE, BT_MIN, None), (BT_DEEP, BT_DEEP_RATE, None),
              (BT_END - 1.0 / 30, BT_MIN, None), (BT_END, 1.0, None)]


def time_rate(t):
    p = RATE_TABLE
    if t <= p[0][0] or t >= p[-1][0]:
        return 1.0
    for (t0, v0, e), (t1, v1, _) in zip(p, p[1:]):
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0) if t1 > t0 else 1.0
            if e == "out":
                u = 1 - (1 - u) ** 2
            elif e == "in":
                u = u * u
            return v0 + (v1 - v0) * u
    return 1.0


_DT = 1.0 / 600.0
_N = int((T_END + 1) / _DT) + 2
_W = [0.0]
for _i in range(_N):
    _t = _i * _DT
    _W.append(_W[-1] + 0.5 * (time_rate(_t) + time_rate(_t + _DT)) * _DT)


def _interp(tab, t):
    i = max(0.0, t) / _DT
    i0 = int(i)
    f = i - i0
    return tab[i0] * (1 - f) + tab[i0 + 1] * f


def world_t(t):
    """world clock: equals t except in the slow-motion windows, where it lags"""
    return _interp(_W, t)


def real_t(w):
    """inverse of world_t"""
    lo, hi = 0.0, T_END + 0.9
    if world_t(hi) < w:
        return hi
    for _ in range(50):
        m = 0.5 * (lo + hi)
        if world_t(m) < w:
            lo = m
        else:
            hi = m
    return hi


W_S2 = world_t(S2)


def jump_v(t):
    """downward speed of the ballistic jump (negative = still rising), on the world clock"""
    return -JUMP_V0 + G * (world_t(t) - W_S2)


V_S3 = jump_v(S3)
# Downward speed profile (m/s, +ve = down) AFTER the jump. Nominal speeds: multiplied by the world-clock
# rate inside the slow-motion windows.
SPEED_PROFILE = [
    (0.0, 0.0), (S2, 0.0),                # standing until shunt 2; S2..S3 is the ballistic jump (jump_v)
    (S3, V_S3), (S3 + 1.0, V_S3 + 8.5),   # shunt 3: falling properly, gravity takes over
    (12.6, 30.0), (15.0, 50.0), (T_FREEZE, 62.0),
    (T_DROP, 190.0),                      # ground rushing up (bullet time slows it)
    (T_DROP + 0.6, 280.0),
    (T_SLOW - 0.8, 295.0),
    (T_SLOW - 0.2, 60.0),                 # brake...
    (T_SLOW, 6.0),                        # ...the slow-down hang (camera overtakes him here)
    (T_PLUNGE, 1.5),
    (T_THUMP, PLUNGE_V),                  # ...then he slams down from ~30 m
    (T_THUMP + 0.001, 0.0), (T_END + 1, 0.0),
]


def speed_at(t):
    if S2 < t < S3:
        return jump_v(t)
    p = SPEED_PROFILE
    if t <= p[0][0]:
        return p[0][1]
    for (t0, v0), (t1, v1) in zip(p, p[1:]):
        if t0 <= t <= t1:
            return v0 if t1 == t0 else v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    return p[-1][1]


_DEPTH = [0.0]
for _i in range(_N):
    _t = _i * _DT
    _DEPTH.append(_DEPTH[-1] + 0.5 * (speed_at(_t) * time_rate(_t) + speed_at(_t + _DT) * time_rate(_t + _DT)) * _DT)


def depth(t):
    return _interp(_DEPTH, t)


Z_ROOF = depth(T_DROP)            # ground crust top is Z = 0 and the character hits it on the drop
Z_CORE = Z_ROOF - depth(T_THUMP)  # platform top


def zc(t):
    """character root height at time t"""
    return Z_ROOF - depth(t)


Y_START = EDGE_Y + 0.6           # v06b: he stands near the edge facing OUT over the void (-Y), as in v05
Y_S3 = Y_START - JUMP_VY * (world_t(S3) - W_S2)
T_ON_LINE = S3 + 1.4


def yc_jump(t):
    if t <= S2:
        return Y_START
    if t <= S3:
        return Y_START - JUMP_VY * (world_t(t) - W_S2)
    if t >= T_ON_LINE:
        return FALL_Y
    T = T_ON_LINE - S3
    u = (t - S3) / T
    h00, h10, h01 = 2 * u ** 3 - 3 * u * u + 1, u ** 3 - 2 * u * u + u, -2 * u ** 3 + 3 * u * u
    return h00 * Y_S3 + h10 * T * (-JUMP_VY) + h01 * FALL_Y


# v06 tunnel bends: shaft centre offset (dx, dy) from the fall line, keyed by the TIME he passes
# (converted to depth so the geometry is static). Smoothstep between waypoints.
BENDS = [(29.4, 0.0, 0.0), (31.8, 40.0, -8.0), (34.2, 22.0, -48.0), (36.6, -26.0, -30.0), (39.0, 0.0, 0.0)]
_BZ = [(zc(t), dx, dy) for t, dx, dy in BENDS]


def _ss(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def cl(z):
    """shaft centre offset (dx, dy) at height z"""
    if z >= _BZ[0][0] or z <= _BZ[-1][0]:
        return (0.0, 0.0)
    for (z0, x0, y0), (z1, x1, y1) in zip(_BZ, _BZ[1:]):
        if z1 <= z <= z0:
            u = _ss((z0 - z) / (z0 - z1))
            return (x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)
    return (0.0, 0.0)


# v06 mid-tunnel detail zone: wider machinery section (teal steel, cyan light)
ZONE = (31.8, 36.6)
ZONE_R, ZONE_TAPER = 52.0, 120.0
Z_ZONE_TOP, Z_ZONE_BOT = zc(ZONE[0]), zc(ZONE[1])


def zone_w(z):
    """0 outside the zone, 1 inside, smooth over ZONE_TAPER metres"""
    if z > Z_ZONE_TOP:
        return _ss((Z_ZONE_TOP + ZONE_TAPER - z) / ZONE_TAPER)
    if z < Z_ZONE_BOT:
        return _ss((z - (Z_ZONE_BOT - ZONE_TAPER)) / ZONE_TAPER)
    return 1.0


def shaft_r(z):
    return SHAFT_R + (ZONE_R - SHAFT_R) * zone_w(z)


def yc(t):
    """character root Y (jump arc + tunnel bend)"""
    return yc_jump(t) + cl(zc(t))[1]


def xc_cl(t):
    return cl(zc(t))[0]


APEX_T = real_t(W_S2 + JUMP_V0 / G)
print("[blockout] Z_ROOF=%.1f m  Z_CORE=%.1f m  total descent %.1f m" % (Z_ROOF, Z_CORE, Z_ROOF - Z_CORE))
print("[blockout] v06 apex at %.2f s (+%.2f m), at S3 %.2f m above launch, v=%.1f m/s down; world clock lag at S3 %.2f s"
      % (APEX_T, zc(APEX_T) - Z_ROOF, zc(S3) - Z_ROOF, V_S3, S3 - world_t(S3)))
print("[blockout] hang height at T_SLOW %.1f m, at plunge %.1f m above the platform; impact %.0f m/s"
      % (zc(T_SLOW) - Z_CORE, zc(T_PLUNGE) - Z_CORE, PLUNGE_V))


# v05: the mantle/core layout must not change, but in v04 it shared one random stream with the
# (now shorter) tower. Replay v04's upper-section draws on a fresh stream to land on exactly the
# state the mantle section had in v04.
Z_ROOF_V04 = 1654.9763366749855
PLAN_A_LEN_V04 = len([t for t in HITS_A if t >= 10.10 - 0.2])


def _rng_v04_mantle():
    r = random.Random(330416)
    def tower(z_top):
        z = 0.0
        while z < z_top - 0.1:
            h = min(r.uniform(25, 60), z_top - z)
            r.uniform(-3.0, 3.0)
            zz = z + r.uniform(3, 8)
            while zz < z + h - 2:
                r.uniform(0.3, 0.8)
                for _ in range(r.randint(1, 3)):
                    r.uniform(0, 1); r.uniform(1.5, 6); r.uniform(0.8, 2.5); r.uniform(0.8, 3.0)
                zz += r.uniform(6, 14)
            z += h
    for zt in (Z_ROOF_V04 - 1.0, Z_ROOF_V04 - 70, Z_ROOF_V04 - 20, Z_ROOF_V04 - 30):
        tower(zt)
    for _ in range(14):
        r.uniform(0, 1); r.uniform(0, 1); r.uniform(0, 1); r.uniform(0, 1)
    for _ in range(int(Z_ROOF_V04 / 2.5)):
        while True:
            x, y = r.uniform(-CHASM_HALF_X + 2, CHASM_HALF_X - 2), r.uniform(CHASM_FAR_Y + 2, EDGE_Y - 1)
            if math.hypot(x - FALL_X, y - FALL_Y) > 6.5:
                break
        r.uniform(0, 1); r.uniform(0, 1); r.uniform(0, 1)
    for _ in range(PLAN_A_LEN_V04):
        r.uniform(0, 1); r.uniform(0, 1); r.choice((-1, 1)); r.uniform(0, 1); r.choice((-1, 1)); r.uniform(0, 1)
    return r


rng = random.Random(330416)

# ----------------------------------------------------------------------------------------------
# Scene reset
# ----------------------------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Blockout"
scene.render.fps = FPS
scene.render.fps_base = 1.0
scene.frame_start = 1
scene.frame_end = F(T_END)
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.engine = "BLENDER_WORKBENCH"
scene.unit_settings.system = "METRIC"

prefs_edit = bpy.context.preferences.edit
_orig_interp = prefs_edit.keyframe_new_interpolation_type

# ----------------------------------------------------------------------------------------------
# Collections
# ----------------------------------------------------------------------------------------------
COLL = {}
for name in ("01_Rooftop", "01b_City", "02_Fall_Monoliths", "03_Breakthrough_Mantle", "03b_Pipes",
             "03c_Machinery_Zone", "04_Core", "Character", "Cameras", "FX_Placeholders"):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    COLL[name] = c

# ----------------------------------------------------------------------------------------------
# Materials (flat viewport colours from the moodboard; also wired to Principled for EEVEE)
# ----------------------------------------------------------------------------------------------
MATS = {}


def mat(name, rgb, emit=0.0, rough=0.7, metal=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.diffuse_color = (rgb[0], rgb[1], rgb[2], 1.0)
    m.roughness = rough
    m.metallic = metal
    try:
        if bpy.app.version < (5, 0, 0) and not m.use_nodes:
            m.use_nodes = True
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
            bsdf.inputs["Roughness"].default_value = rough
            bsdf.inputs["Metallic"].default_value = metal
            if emit > 0:
                key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
                bsdf.inputs[key].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
                bsdf.inputs["Emission Strength"].default_value = emit
    except Exception as e:  # never fail the blockout over shader details
        print("[blockout] material node setup skipped for", name, e)
    MATS[name] = m
    return m


# Phase 1 - silver / concrete at sunset
M_ROOF = mat("M_Roof_Silver", (0.78, 0.64, 0.52), metal=0.3)   # v02: sunset-warm so the roof separates from the cool chasm
M_CONC = mat("M_Concrete", (0.42, 0.43, 0.45))
M_CONC_HI = mat("M_Concrete_Upper_Silver", (0.55, 0.56, 0.59))
M_CONC_DK = mat("M_Concrete_Dark", (0.22, 0.23, 0.25))
M_BAND = mat("M_Floor_Bands", (0.30, 0.31, 0.34))
# Phase 2 - gunmetal monoliths
M_MONO = mat("M_Monolith_Gunmetal", (0.17, 0.20, 0.25), metal=0.8, rough=0.35)
M_MONO_EDGE = mat("M_Monolith_Glyph", (0.45, 0.55, 0.65), emit=2.0)
# Phase 3 - volcanic
M_CRUST = mat("M_Crust", (0.30, 0.24, 0.20))
M_CRACK = mat("M_Crack_Glow", (1.0, 0.35, 0.05), emit=8.0)
M_MANTLE = mat("M_Mantle_Wall_Crimson", (0.40, 0.06, 0.03))
M_LAVA = mat("M_Lava_Orange", (1.0, 0.40, 0.06), emit=6.0)
M_ROCK = mat("M_Rock_Basalt", (0.14, 0.08, 0.07))
M_CLIFF = mat("M_Cliff_Ember", (0.50, 0.14, 0.05))
M_SETPIECE = mat("M_SetPiece_26_3", (0.70, 0.20, 0.04))
# Phase 4 - cyan + gold core
M_CAVERN = mat("M_Core_Cavern", (0.03, 0.10, 0.13))
M_PLAT = mat("M_Core_Platform_Cyan", (0.10, 0.80, 0.92), emit=3.0)
M_GOLD = mat("M_Core_Gold", (0.95, 0.70, 0.20), metal=1.0, rough=0.3)
M_DATA = mat("M_Data_Monolith", (0.30, 0.95, 1.00), emit=5.0)
M_CORE_LIGHT = mat("M_Core_Light", (0.80, 1.00, 1.00), emit=20.0)
# Character
M_GREEBLE = mat("M_Wall_Greebles", (0.30, 0.31, 0.34))   # v04: kept darker than the character so he pops
M_DUST = mat("M_Dust_Streaks", (0.36, 0.34, 0.32))
M_CHAR = mat("M_Char_Body_GlossBlack", (0.06, 0.065, 0.075), metal=0.8, rough=0.15)   # v06: glossy black armour
M_CHAR_DK = mat("M_Char_Joint", (0.18, 0.19, 0.21))
M_VISOR = mat("M_Char_Visor", (0.20, 0.90, 1.00), emit=4.0)
# FX
M_FLASH = mat("M_FX_Flash", (1.0, 0.98, 0.92), emit=30.0)
M_FIRE = mat("M_FX_Fireball", (1.0, 0.45, 0.08), emit=10.0)
M_SHOCK = mat("M_FX_Shockwave", (0.60, 1.00, 1.00), emit=10.0)
M_GUIDE = mat("M_Guide", (1.0, 0.0, 1.0))
# v06
M_BLACK = mat("M_FX_Blackout", (0.0, 0.0, 0.0), rough=1.0)
M_GLASS = mat("M_City_Glass_Dark", (0.10, 0.12, 0.16), metal=0.6, rough=0.25)
M_CITY_A = mat("M_City_Concrete_Warm", (0.46, 0.42, 0.40))
M_WIN_W = mat("M_City_Windows_Warm", (1.0, 0.72, 0.38), emit=4.0)
M_WIN_C = mat("M_City_Windows_Cyan", (0.35, 0.85, 1.0), emit=4.0)
M_PIPE = mat("M_Pipe_Steel", (0.34, 0.32, 0.30), metal=0.8, rough=0.4)
M_PIPE_DK = mat("M_Pipe_Steel_Dark", (0.20, 0.19, 0.19), metal=0.8, rough=0.4)
M_PLAZA = mat("M_Plaza_Ground", (0.30, 0.30, 0.31))
M_HATCH = mat("M_Hatch_Plates", (0.24, 0.25, 0.27), metal=0.6, rough=0.4)
M_HAZARD = mat("M_Hatch_Hazard", (0.85, 0.62, 0.10))
M_MACH = mat("M_Machinery_Teal", (0.10, 0.26, 0.28), metal=0.7, rough=0.4)
M_MACH_DK = mat("M_Machinery_Dark", (0.07, 0.09, 0.10), metal=0.8, rough=0.4)
M_RING_C = mat("M_Ring_Cyan", (0.30, 1.0, 0.95), emit=6.0)


# ----------------------------------------------------------------------------------------------
# Geometry helpers (bmesh, no operators -> fast and context-free)
# ----------------------------------------------------------------------------------------------
def _new_obj(name, bm, material, coll, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if material:
        me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    if material:
        ob.color = material.diffuse_color
    coll.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def box(name, size, loc, material, coll, rot=(0, 0, 0), parent=None, origin_top=False, origin_z_top=None):
    """Box of given full size. origin_top: origin at top-centre and geometry hanging down (limbs)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = size
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
        if origin_top:
            v.co.z -= sz / 2.0
    return _new_obj(name, bm, material, coll, loc, rot, parent)


def box_minmax(name, mn, mx, material, coll):
    size = (mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2])
    loc = ((mx[0] + mn[0]) / 2, (mx[1] + mn[1]) / 2, (mx[2] + mn[2]) / 2)
    return box(name, size, loc, material, coll)


def batch_boxes(name, boxes, material, coll):
    """Many axis-aligned boxes [(mn, mx), ...] merged into ONE mesh object (cheap speed-reference detail)."""
    bm = bmesh.new()
    for mn, mx in boxes:
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r["verts"]:
            v.co.x = mn[0] if v.co.x < 0 else mx[0]
            v.co.y = mn[1] if v.co.y < 0 else mx[1]
            v.co.z = mn[2] if v.co.z < 0 else mx[2]
    return _new_obj(name, bm, material, coll, (0, 0, 0))


def rock(name, radius, loc, material, coll, squash=(1, 1, 1), subdiv=1, jitter=0.25):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius)
    for v in bm.verts:
        n = v.co.normalized()
        v.co += n * radius * rng.uniform(-jitter, jitter)
        v.co.x *= squash[0]
        v.co.y *= squash[1]
        v.co.z *= squash[2]
    return _new_obj(name, bm, material, coll, loc)


def sphere(name, radius, loc, material, coll, segs=24, rings=12, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=radius)
    return _new_obj(name, bm, material, coll, loc, parent=parent)


def cylinder(name, radius, height, loc, material, coll, segs=32, caps=True, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=segs,
                          radius1=radius, radius2=radius, depth=height)
    return _new_obj(name, bm, material, coll, loc, rot)


def torus(name, major, minor, loc, material, coll, segs=48, ring_segs=8):
    bm = bmesh.new()
    verts = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        row = []
        for j in range(ring_segs):
            b = 2 * math.pi * j / ring_segs
            r = major + minor * math.cos(b)
            row.append(bm.verts.new((r * math.cos(a), r * math.sin(a), minor * math.sin(b))))
        verts.append(row)
    for i in range(segs):
        for j in range(ring_segs):
            bm.faces.new((verts[i][j], verts[(i + 1) % segs][j],
                          verts[(i + 1) % segs][(j + 1) % ring_segs], verts[i][(j + 1) % ring_segs]))
    return _new_obj(name, bm, material, coll, loc)


def empty(name, coll, loc=(0, 0, 0), parent=None, kind="PLAIN_AXES", size=1.0):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_type = kind
    ob.empty_display_size = size
    ob.location = loc
    coll.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


# ----------------------------------------------------------------------------------------------
# Keyframe helpers
# ----------------------------------------------------------------------------------------------
def key(ob, path, t, value, index=-1, interp="BEZIER", frame=None):
    prefs_edit.keyframe_new_interpolation_type = interp
    prop = getattr(ob, path)
    if index >= 0:
        prop[index] = value
    else:
        try:
            prop[:] = value
        except TypeError:
            setattr(ob, path, value)
    ob.keyframe_insert(data_path=path, index=index, frame=frame if frame is not None else F(t))


def _fcurves_early(ob):
    """F-curves of an object's action (Blender 5.x layered actions or legacy)"""
    act = ob.animation_data.action if ob.animation_data else None
    if act is None:
        return []
    try:
        from bpy_extras import anim_utils
        cb = anim_utils.action_get_channelbag_for_slot(act, ob.animation_data.action_slot)
        if cb is not None:
            return list(cb.fcurves)
    except Exception:
        pass
    return list(act.fcurves)


def key_scale(ob, t, s, interp="BEZIER", frame=None):
    key(ob, "scale", t, (s, s, s), interp=interp, frame=frame)


# ----------------------------------------------------------------------------------------------
# Timeline markers
# ----------------------------------------------------------------------------------------------
MARKER_NAMES = {
    "opening_impact": "OPENING_BOOM", "intro_impact_2": "JUMP_HIT", "riser_start": "RISER",
    "pre_pause_hit": "HIT_PRE_PAUSE", "pause_start": "PAUSE", "reentry_impact": "REENTRY",
    "freeze_start": "FREEZE", "freeze_lowest_filter": "FREEZE_LOW", "drop": "DROP_SMASH",
    "biggest_accent_in_drop": "SETPIECE_%.1f" % T_SETPIECE, "final_slowdown_start": "SLOWDOWN",
    "slowdown_lowest_filter": "SLOWMO_LOW", "final_thump": "LAND_THUMP", "tail_quiet": "CORE_FADE",
}
used_frames = set()
for c in CUES["key_cues"]:
    nm = MARKER_NAMES.get(c["name"], c["name"].upper())
    scene.timeline_markers.new(nm, frame=F(float(c["t"])))
    used_frames.add(F(float(c["t"])))
for s in CUES.get("sections", []):
    for edge, tag in ((s["start"], "SEC>"), (s["end"], "SEC|")):
        f = F(float(edge))
        if f not in used_frames and f <= F(T_END):
            scene.timeline_markers.new("%s%s" % (tag, s["name"]), frame=f)
            used_frames.add(f)
for i, t in enumerate(HITS_A):
    if F(t) not in used_frames:
        scene.timeline_markers.new("hitA_%02d" % (i + 1), frame=F(t))
for i, t in enumerate(HITS_B):
    if F(t) not in used_frames:
        scene.timeline_markers.new("hitB_%02d" % (i + 1), frame=F(t))
scene.timeline_markers.new("END_HOLD", frame=F(T_END))


def add_marker(name, t):
    """v05 beat markers; if a marker already sits on that frame, merge the names"""
    f = F(t)
    for m in scene.timeline_markers:
        if m.frame == f:
            if name not in m.name:
                m.name = (m.name + "+" + name)[:63]
            return
    scene.timeline_markers.new(name, frame=f)


for _nm, _t in (("SHUNT1_OPEN_FACE", S1), ("PREP_CAM_BACK", T_MID), ("CROUCH", S2 - 0.55), ("SHUNT2_JUMP_BACKFLIP", S2),
                ("SLOWMO_IN", AP_START), ("SLOWMO_HOLD", AP_SETTLE), ("APEX", APEX_T), ("TUCK_BALL", real_t(W_S2 + 0.45)),
                ("SLOWMO_OUT", AP_RELEASE), ("SHUNT3_DIVE", S3), ("CAM_TWIST", S3 + 0.6), ("ON_FALL_LINE", T_ON_LINE),
                ("BULLET_IN", BT_START), ("CURL_SIDEWAYS", BT_CURL0), ("CAM_PUSH_IN", BT_SETTLE),
                ("BALL_SIDEWAYS", BT_CURL1), ("BULLET_DEEPEST", BT_DEEP), ("BULLET_OUT_SMASH", BT_END),
                ("BEND_1", BENDS[1][0]), ("BEND_2", BENDS[2][0]), ("BEND_3", BENDS[3][0]), ("BENDS_END", BENDS[4][0]),
                ("ZONE_IN", ZONE[0]), ("ZONE_OUT", ZONE[1]), ("CAM_OVERTAKES", T_SLOW + 0.15),
                ("SIDE_VIEW", T_SIDE), ("PLUNGE", T_PLUNGE)):
    add_marker(_nm, _t)

# ----------------------------------------------------------------------------------------------
# Audio
# ----------------------------------------------------------------------------------------------
audio_src = find_input(AUDIO_NAME)
audio_dst = os.path.join(OUTDIR, AUDIO_NAME)
if audio_src and os.path.abspath(audio_src) != os.path.abspath(audio_dst):
    shutil.copy2(audio_src, audio_dst)
if CUES_PATH and os.path.abspath(os.path.dirname(CUES_PATH)) != OUTDIR:
    shutil.copy2(CUES_PATH, os.path.join(OUTDIR, "cues.json"))
sed = scene.sequence_editor_create()
strips = sed.strips if hasattr(sed, "strips") else sed.sequences
if os.path.isfile(audio_dst):
    snd = strips.new_sound("MUSIC_brain_implant", audio_dst, 1, 1)
    print("[blockout] sound strip added:", audio_dst)
else:
    print("[blockout] WARNING: %s not found - no sound strip added" % AUDIO_NAME)
scene.sync_mode = "AUDIO_SYNC"
scene.use_audio_scrub = True

# ----------------------------------------------------------------------------------------------
# World / lights
# ----------------------------------------------------------------------------------------------
world = bpy.data.worlds.new("World_Blockout")
scene.world = world
for t, col in ((0, (0.55, 0.47, 0.42)), (S3 + 0.4, (0.55, 0.47, 0.42)), (S3 + 2.5, (0.34, 0.32, 0.36)),
               (T_FREEZE, (0.12, 0.12, 0.14)), (T_DROP, (0.30, 0.06, 0.02)),
               (ZONE[0] - 0.4, (0.26, 0.05, 0.02)), (ZONE[0] + 0.3, (0.02, 0.12, 0.15)),   # v06 teal machinery zone
               (ZONE[1] - 0.3, (0.02, 0.12, 0.15)), (ZONE[1] + 0.4, (0.26, 0.05, 0.02)),
               (T_SLOW, (0.20, 0.05, 0.02)), (T_THUMP, (0.02, 0.08, 0.10))):
    world.color = col
    world.keyframe_insert("color", frame=F(t))

sun_d = bpy.data.lights.new("SUN_Sunset", "SUN")
sun_d.energy = 3.0
sun_d.color = (1.0, 0.72, 0.5)
sun = bpy.data.objects.new("SUN_Sunset", sun_d)
sun.rotation_euler = (math.radians(78), 0, math.radians(200))
COLL["01_Rooftop"].objects.link(sun)


def point_light(name, loc, color, energy, coll, radius=1.0):
    d = bpy.data.lights.new(name, "POINT")
    d.color = color
    d.energy = energy
    d.shadow_soft_size = radius
    ob = bpy.data.objects.new(name, d)
    ob.location = loc
    coll.objects.link(ob)
    return ob


# ----------------------------------------------------------------------------------------------
# 01 Rooftop + chasm towers
# ----------------------------------------------------------------------------------------------
C1 = COLL["01_Rooftop"]


def tower_stack(prefix, x0, x1, y0, y1, z_top, inner_axis, inner_sign, coll, recess_top=0.0):
    """Stack of brutalist blocks; the face toward the chasm jitters in/out per block.
    v05: blocks within recess_top of the top only jitter inward (the jump arc passes close)."""
    z = 0.0
    i = 0
    ribs, greebs = [], []
    while z < z_top - 0.1:
        h = min(rng.uniform(25, 60), z_top - z)
        jit = rng.uniform(-3.0, 3.0)
        if z + h > z_top - recess_top:
            jit = -inner_sign * abs(jit)
        mn, mx = [x0, y0, z], [x1, y1, z + h]
        if inner_axis == "x":
            if inner_sign > 0:
                mx[0] += jit
            else:
                mn[0] += jit
        else:
            if inner_sign > 0:
                mx[1] += jit
            else:
                mn[1] += jit
        frac = z / max(z_top, 1)
        m = M_CONC_HI if frac > 0.96 else (M_CONC if frac > 0.75 else M_CONC_DK)   # v02: darker sooner = depth reads from above
        box_minmax("%s_blk%02d" % (prefix, i), mn, mx, m, coll)
        # thin floor band on the chasm face (speed reference while falling)
        bz = z + h
        if bz < z_top - 1:
            if inner_axis == "x":
                fx = mx[0] if inner_sign > 0 else mn[0]
                box_minmax("%s_band%02d" % (prefix, i), (fx - 1.2, mn[1], bz - 0.6), (fx + 1.2, mx[1], bz + 0.6), M_BAND, coll)
            else:
                fy = mx[1] if inner_sign > 0 else mn[1]
                box_minmax("%s_band%02d" % (prefix, i), (mn[0], fy - 1.2, bz - 0.6), (mx[0], fy + 1.2, bz + 0.6), M_BAND, coll)
        # v04: extra speed-reference detail on the chasm face every ~6-14 m: thin ribs + ledges/boxes
        zz = z + rng.uniform(3, 8)
        face = (mx[0] if inner_sign > 0 else mn[0]) if inner_axis == "x" else (mx[1] if inner_sign > 0 else mn[1])
        lo, hi = (mn[1], mx[1]) if inner_axis == "x" else (mn[0], mx[0])
        while zz < z + h - 2:
            o = inner_sign * rng.uniform(0.3, 0.8)
            if inner_axis == "x":
                ribs.append(((min(face, face + o), lo, zz - 0.2), (max(face, face + o), hi, zz + 0.2)))
            else:
                ribs.append(((lo, min(face, face + o), zz - 0.2), (hi, max(face, face + o), zz + 0.2)))
            for _ in range(rng.randint(1, 3)):
                c = rng.uniform(lo + 2, hi - 2)
                w, dd, hh = rng.uniform(1.5, 6), inner_sign * rng.uniform(0.8, 2.5), rng.uniform(0.8, 3.0)
                if inner_axis == "x":
                    greebs.append(((min(face, face + dd), c - w / 2, zz), (max(face, face + dd), c + w / 2, zz + hh)))
                else:
                    greebs.append(((c - w / 2, min(face, face + dd), zz), (c + w / 2, max(face, face + dd), zz + hh)))
            zz += rng.uniform(6, 14)
        z += h
        i += 1
    batch_boxes("%s_ribs" % prefix, ribs, M_BAND, coll)
    batch_boxes("%s_greebles" % prefix, greebs, M_GREEBLE, coll)


# Tower A (the one Ian's character stands on): rooftop at Z_ROOF, chasm face at y = EDGE_Y
tower_stack("TWR_A", -22, 22, EDGE_Y, 45, Z_ROOF - 1.0, "y", -1, C1, recess_top=80.0)
roof = box_minmax("ROOF_Slab", (-22, EDGE_Y, Z_ROOF - 1.0), (22, 45, Z_ROOF), M_ROOF, C1)
for i, (x0, x1, y0, y1) in enumerate(((-22, -21.4, EDGE_Y + 0.6, 45), (21.4, 22, EDGE_Y + 0.6, 45), (-22, 22, 44.4, 45))):
    box_minmax("ROOF_Parapet_%d" % i, (x0, y0, Z_ROOF), (x1, y1, Z_ROOF + 1.1), M_ROOF, C1)
box_minmax("ROOF_Lip_Edge", (-22, EDGE_Y, Z_ROOF), (22, EDGE_Y + 0.35, Z_ROOF + 0.25), M_CONC_HI, C1)
box_minmax("ROOF_StairCore", (-14, 20, Z_ROOF), (-6, 30, Z_ROOF + 5.5), M_CONC, C1)
box_minmax("ROOF_HVAC_1", (6, 14, Z_ROOF), (12, 19, Z_ROOF + 2.5), M_CONC_DK, C1)
box_minmax("ROOF_HVAC_2", (8, 24, Z_ROOF), (16, 28, Z_ROOF + 3.0), M_CONC_DK, C1)
box_minmax("ROOF_Antenna", (15.6, 36.6, Z_ROOF), (16.4, 37.4, Z_ROOF + 28), M_ROOF, C1)
# v02: overhang beam removed (blocked the view down the facade)
# box_minmax("ROOF_Overhang_Beam", (-3, EDGE_Y - 4, Z_ROOF - 2.5), (3, EDGE_Y, Z_ROOF - 1.0), M_CONC, C1)
# v06: tower A gets cyan accent fins on its void face (reads as "his" tower)
for _i, _x in enumerate((-21.0, 21.0)):
    box_minmax("TWR_A_Fin_%d" % _i, (_x - 0.5, EDGE_Y - 0.7, 30.0), (_x + 0.5, EDGE_Y + 0.2, Z_ROOF - 4.0), M_WIN_C, C1)

# ---- v06 pipes plan (surface routes; built later in 03b_Pipes). Planned first so buildings avoid them.
HATCH_C = Vector((FALL_X, FALL_Y, 0.0))
prng = random.Random(1706)


def _dir(a):
    return Vector((math.cos(a), math.sin(a), 0.0))


PIPE_PLAN = []     # (name, radius, [surface points], end angle)
_NP = 7
for _i in range(_NP):
    # converge from everywhere except the +Y sector (tower A sits there)
    a_end = math.radians(160 + (_i + 0.5) * (225.0 / _NP) + prng.uniform(-9, 9))
    a_far = a_end + math.radians(prng.uniform(-28, 28))
    pr = prng.choice((0.7, 0.9, 1.2, 1.6, 2.0, 2.6))
    lift = pr + (prng.uniform(4, 9) if prng.random() < 0.3 else 0.0)
    pts = [HATCH_C + _dir(a_far) * prng.uniform(380, 560) + Vector((0, 0, lift)),
           HATCH_C + _dir(a_end + (a_far - a_end) * 0.4 + math.radians(prng.uniform(-5, 5))) * prng.uniform(170, 260) + Vector((0, 0, lift)),
           HATCH_C + _dir(a_end + math.radians(prng.uniform(-4, 4))) * prng.uniform(70, 100) + Vector((0, 0, pr + 0.2)),
           HATCH_C + _dir(a_end) * 36.0 + Vector((0, 0, pr + 0.2)),
           HATCH_C + _dir(a_end) * 31.0 + Vector((0, 0, -2.0))]
    PIPE_PLAN.append(("PIPE_%02d" % _i, pr, pts, a_end))


def _seg_dist(p, a, b):
    ab = (b - a).to_2d(); ap = (p - a).to_2d()
    u = max(0.0, min(1.0, ap.dot(ab) / max(ab.length_squared, 1e-9)))
    return (ap - ab * u).length


# ---- v06 city: skyscrapers in an annulus around the hatch plaza, emissive window strips
CB = COLL["01b_City"]
crng = random.Random(606)
BLD_MATS = (M_CONC, M_CONC_DK, M_GLASS, M_CITY_A, M_GLASS)
bld_boxes = {m.name: [] for m in BLD_MATS}
win_w, win_c, bld_fp = [], [], []
_tries = 0
while len(bld_fp) < 170 and _tries < 8000:
    _tries += 1
    a = crng.uniform(0, 2 * math.pi)
    d = 58 + (crng.random() ** 1.25) * 640
    cx, cy = HATCH_C.x + d * math.cos(a), HATCH_C.y + d * math.sin(a)
    w, dd = crng.uniform(16, 44), crng.uniform(16, 44)
    hw = max(w, dd) / 2
    if -36 < cx < 36 and -12 < cy < 60:               # tower A + clearance
        continue
    if math.hypot(cx - HATCH_C.x, cy - HATCH_C.y) - hw < 48:   # open plaza round the hatch
        continue
    if any(abs(cx - ox) < (w + ow) / 2 + 9 and abs(cy - oy) < (dd + od) / 2 + 9 for ox, oy, ow, od in bld_fp):
        continue
    pc = Vector((cx, cy, 0))
    if any(_seg_dist(pc, p0, p1) < hw * 1.42 + pr + 4 for _n, pr, pts, _a in PIPE_PLAN for p0, p1 in zip(pts, pts[1:])):
        continue
    bld_fp.append((cx, cy, w, dd))
    h = Z_ROOF * (crng.uniform(0.92, 0.98) if crng.random() < 0.08 else crng.uniform(0.25, 0.82))
    m = crng.choice(BLD_MATS)
    bld_boxes[m.name].append(((cx - w / 2, cy - dd / 2, 0.0), (cx + w / 2, cy + dd / 2, h)))
    top = h
    if crng.random() < 0.55:                           # setback crown
        s_ = crng.uniform(0.55, 0.8)
        h2 = crng.uniform(0.08, 0.2) * h
        bld_boxes[m.name].append(((cx - w * s_ / 2, cy - dd * s_ / 2, h), (cx + w * s_ / 2, cy + dd * s_ / 2, h + h2)))
        top = h + h2
    # window strips: thin emissive bands proud of one or two faces
    warm = crng.random() < 0.7
    sink = win_w if warm else win_c
    zz = crng.uniform(6, 20)
    step = crng.uniform(7, 16)
    faces = crng.sample((0, 1, 2, 3), crng.randint(2, 4))
    while zz < h - 4:
        if crng.random() < 0.75:
            for fce in faces:
                if fce == 0:
                    sink.append(((cx - w * 0.42, cy - dd / 2 - 0.4, zz), (cx + w * 0.42, cy - dd / 2 + 0.1, zz + 1.1)))
                elif fce == 1:
                    sink.append(((cx - w * 0.42, cy + dd / 2 - 0.1, zz), (cx + w * 0.42, cy + dd / 2 + 0.4, zz + 1.1)))
                elif fce == 2:
                    sink.append(((cx - w / 2 - 0.4, cy - dd * 0.42, zz), (cx - w / 2 + 0.1, cy + dd * 0.42, zz + 1.1)))
                else:
                    sink.append(((cx + w / 2 - 0.1, cy - dd * 0.42, zz), (cx + w / 2 + 0.4, cy + dd * 0.42, zz + 1.1)))
        zz += step
    if crng.random() < 0.25:                            # beacon / antenna
        win_c.append(((cx - 0.4, cy - 0.4, top), (cx + 0.4, cy + 0.4, top + crng.uniform(8, 25))))
for m in BLD_MATS:
    if bld_boxes[m.name]:
        batch_boxes("CITY_Towers_%s" % m.name[7:], bld_boxes[m.name], m, CB)
batch_boxes("CITY_Windows_Warm", win_w, M_WIN_W, CB)
batch_boxes("CITY_Windows_Cyan", win_c, M_WIN_C, CB)
print("[blockout] city: %d towers (%d tries), %d window strips" % (len(bld_fp), _tries, len(win_w) + len(win_c)))

# v04-style dust streaks around the fall line (static speed reference), off tower A, >= 6.5 m from him
dust = []
for i in range(int(Z_ROOF / 2.0)):
    while True:
        a, r = crng.uniform(0, 2 * math.pi), crng.uniform(6.5, 40.0)
        x, y = FALL_X + r * math.cos(a), FALL_Y + r * math.sin(a)
        if y < EDGE_Y - 1:
            break
    zz = crng.uniform(20, Z_ROOF - 40)
    sz, ln = crng.uniform(0.15, 0.4), crng.uniform(1.5, 5.0)
    dust.append(((x - sz, y - sz, zz), (x + sz, y + sz, zz + ln)))
batch_boxes("SPEED_City_DustStreaks", dust, M_DUST, C1)

# v06b: low sun behind him in the front-on opener (camera looks +Y at his face), far ground flush with the plaza
M_SUN = mat("M_Sky_SunDisc", (1.0, 0.62, 0.28), emit=8.0)
SUN_POS = Vector((-520.0, 4300.0, Z_ROOF + 330.0))
sund = sphere("SKY_SunDisc", 230.0, SUN_POS[:], M_SUN, C1, segs=32, rings=16)
M_FARGROUND = mat("M_Far_Ground", (0.25, 0.23, 0.23))
for _i, (_mn, _mx) in enumerate((((-20000, -20000), (-400, 20000)), ((400, -20000), (20000, 20000)),
                                  ((-400, -20000), (400, -400)), ((-400, 400), (400, 20000)))):
    box_minmax("SKY_FarGround_%d" % _i, (_mn[0], _mn[1], -2.0), (_mx[0], _mx[1], -0.05), M_FARGROUND, C1)

# ----------------------------------------------------------------------------------------------
# Character placeholder (all motion lives on CHAR_ROOT; poses on the CHAR_PIVOT sub-tree)
# ----------------------------------------------------------------------------------------------
CC = COLL["Character"]
CHAR_ROOT = empty("CHAR_ROOT", CC, kind="ARROWS", size=1.2)
CHAR_ROOT["note"] = "All travel/dodge animation lives here. Parent a Mixamo armature to this and delete CHAR_PIVOT."
PIVOT_STAND_Z = 0.98
CHAR_PIVOT = empty("CHAR_PIVOT", CC, loc=(0, 0, PIVOT_STAND_Z), parent=CHAR_ROOT, kind="SPHERE", size=0.15)
CHAR_PIVOT.rotation_mode = "ZXY"   # Z (roll about body axis) first, then X (pitch/tumble), then Y (sway)

P = {}
P["torso"] = box("CHAR_torso", (0.38, 0.22, 0.62), (0, 0, 0.21), M_CHAR, CC, parent=CHAR_PIVOT)
# move torso geometry so its origin sits at the hips
for v in P["torso"].data.vertices:
    v.co.z += 0.21
    _u = v.co.z / 0.62                      # v06: taper - slim waist (0.27 m) to broad shoulders (0.50 m)
    v.co.x *= 0.71 + 0.61 * _u
    v.co.y *= 0.9 + 0.25 * _u
P["torso"].location = (0, 0, -0.10)
box("CHAR_pelvis", (0.29, 0.2, 0.16), (0, 0, 0.0), M_CHAR_DK, CC, parent=P["torso"])
P["head"] = box("CHAR_head", (0.2, 0.24, 0.26), (0, 0, 0.72), M_CHAR, CC, parent=P["torso"])
for v in P["head"].data.vertices:
    v.co.z += 0.13
box("CHAR_visor", (0.16, 0.04, 0.07), (0, -0.12, 0.16), M_VISOR, CC, parent=P["head"])
for side, sx in (("L", 1), ("R", -1)):
    ua = box("CHAR_arm_upper_" + side, (0.1, 0.1, 0.3), (sx * 0.30, 0, 0.60), M_CHAR, CC, parent=P["torso"], origin_top=True)
    la = box("CHAR_arm_lower_" + side, (0.09, 0.09, 0.3), (0, 0, -0.3), M_CHAR, CC, parent=ua, origin_top=True)
    box("CHAR_fist_" + side, (0.1, 0.1, 0.1), (0, 0, -0.33), M_CHAR_DK, CC, parent=la)
    th = box("CHAR_leg_upper_" + side, (0.14, 0.14, 0.45), (sx * 0.11, 0, -0.05), M_CHAR, CC, parent=CHAR_PIVOT, origin_top=True)
    sh = box("CHAR_leg_lower_" + side, (0.12, 0.12, 0.43), (0, 0, -0.45), M_CHAR, CC, parent=th, origin_top=True)
    box("CHAR_foot_" + side, (0.12, 0.24, 0.06), (0, -0.05, -0.45), M_CHAR_DK, CC, parent=sh)
    P["arm_upper_" + side], P["arm_lower_" + side] = ua, la
    P["leg_upper_" + side], P["leg_lower_" + side] = th, sh

# Poses: per-part (rx, ry, rz) degrees, parts default to 0. Character faces -Y, its left is +X.
# +rx swings a hanging limb backwards (+Y); -rx forwards. Arms out sideways: L ry<0, R ry>0.
POSES = {
    "STAND": {"arm_upper_L": (0, -6, 0), "arm_upper_R": (0, 6, 0), "arm_lower_L": (-8, 0, 0), "arm_lower_R": (-8, 0, 0)},
    "CROUCH": {"torso": (35, 0, 0), "head": (-25, 0, 0), "arm_upper_L": (55, -5, 0), "arm_upper_R": (55, 5, 0),
               "arm_lower_L": (-25, 0, 0), "arm_lower_R": (-25, 0, 0), "leg_upper_L": (-70, 0, 0), "leg_upper_R": (-70, 0, 0),
               "leg_lower_L": (110, 0, 0), "leg_lower_R": (110, 0, 0)},
    "LEAP": {"torso": (15, 0, 0), "head": (-15, 0, 0), "arm_upper_L": (-150, -15, 0), "arm_upper_R": (-150, 15, 0),
             "leg_upper_L": (15, 0, 0), "leg_upper_R": (-25, 0, 0), "leg_lower_L": (30, 0, 0), "leg_lower_R": (60, 0, 0)},
    "SKYDIVE": {"torso": (-12, 0, 0), "head": (-30, 0, 0), "arm_upper_L": (20, -75, 0), "arm_upper_R": (20, 75, 0),
                "arm_lower_L": (0, -60, 0), "arm_lower_R": (0, 60, 0), "leg_upper_L": (15, -15, 0), "leg_upper_R": (15, 15, 0),
                "leg_lower_L": (60, 0, 0), "leg_lower_R": (60, 0, 0)},
    "SPREAD": {"torso": (-18, 0, 0), "head": (-35, 0, 0), "arm_upper_L": (10, -95, 0), "arm_upper_R": (10, 95, 0),
               "leg_upper_L": (10, -25, 0), "leg_upper_R": (10, 25, 0), "leg_lower_L": (30, 0, 0), "leg_lower_R": (30, 0, 0)},
    "DIVE": {"head": (-20, 0, 0), "arm_upper_L": (-175, -8, 0), "arm_upper_R": (-175, 8, 0),
             "leg_upper_L": (5, 0, 0), "leg_upper_R": (5, 0, 0), "leg_lower_L": (10, 0, 0), "leg_lower_R": (10, 0, 0)},
    "TUCK": {"torso": (40, 0, 0), "head": (30, 0, 0), "arm_upper_L": (-60, 0, 0), "arm_upper_R": (-60, 0, 0),
             "arm_lower_L": (-100, 0, 0), "arm_lower_R": (-100, 0, 0), "leg_upper_L": (-120, 0, 0), "leg_upper_R": (-120, 0, 0),
             "leg_lower_L": (130, 0, 0), "leg_lower_R": (130, 0, 0)},
    "READY": {"torso": (14, 0, 0), "head": (-12, 0, 0), "arm_upper_L": (30, -10, 0), "arm_upper_R": (30, 10, 0),
              "arm_lower_L": (-30, 0, 0), "arm_lower_R": (-30, 0, 0), "leg_upper_L": (-28, -4, 0), "leg_upper_R": (-28, 4, 0),
              "leg_lower_L": (45, 0, 0), "leg_lower_R": (45, 0, 0)},
    "SLAM": {"torso": (-5, 0, 0), "head": (15, 0, 0), "arm_upper_L": (-165, -20, 0), "arm_upper_R": (-165, 20, 0),
             "arm_lower_L": (-20, 0, 0), "arm_lower_R": (-20, 0, 0), "leg_upper_L": (-15, 0, 0), "leg_upper_R": (5, 0, 0),
             "leg_lower_L": (25, 0, 0), "leg_lower_R": (10, 0, 0)},
    "PRELAND": {"torso": (10, 0, 0), "head": (-10, 0, 0), "arm_upper_L": (-30, -60, 0), "arm_upper_R": (-30, 60, 0),
                "leg_upper_L": (-45, 0, 0), "leg_upper_R": (-20, 0, 0), "leg_lower_L": (50, 0, 0), "leg_lower_R": (50, 0, 0)},
    "LAND_KNEEL": {"torso": (50, 0, 0), "head": (-40, 0, 0), "arm_upper_R": (-50, 5, 0), "arm_lower_R": (-10, 0, 0),
                   "arm_upper_L": (60, -45, 0), "arm_lower_L": (-20, 0, 0), "leg_upper_L": (-90, 0, 0),
                   "leg_lower_L": (90, 0, 0), "leg_upper_R": (15, 0, 0), "leg_lower_R": (85, 0, 0)},
    "KNEEL_IDLE": {"torso": (25, 0, 0), "head": (35, 0, 0), "arm_upper_R": (-15, 5, 0), "arm_lower_R": (-40, 0, 0),
                   "arm_upper_L": (-20, -5, 0), "arm_lower_L": (-60, 0, 0), "leg_upper_L": (-90, 0, 0),
                   "leg_lower_L": (90, 0, 0), "leg_upper_R": (15, 0, 0), "leg_lower_R": (85, 0, 0)},
}
PIVOT_Z = {"STAND": PIVOT_STAND_Z, "READY": 0.9, "CROUCH": 0.62, "LAND_KNEEL": 0.5, "KNEEL_IDLE": 0.5}


POSE_LOG = []      # v06b: (t, pose) - replayed onto the Meshy armature


def key_pose(t, pose):
    POSE_LOG.append((t, pose))
    spec = POSES[pose]
    for part, ob in P.items():
        r = spec.get(part, (0, 0, 0))
        key(ob, "rotation_euler", t, tuple(math.radians(a) for a in r))
    if pose in PIVOT_Z:
        key(CHAR_PIVOT, "location", t, PIVOT_Z[pose], index=2)


def key_pivot_rot(t, rx=None, ry=None, rz=None, interp="BEZIER"):
    for i, v in enumerate((rx, ry, rz)):
        if v is not None:
            key(CHAR_PIVOT, "rotation_euler", t, math.radians(v), index=i, interp=interp)


# -- root travel: Z and Y keyed every frame here, then thinned to sparse Bezier keys before saving
for f in range(1, F(T_END) + 1):
    t = (f - 1) / FPS
    key(CHAR_ROOT, "location", t, zc(min(t, T_THUMP)), index=2, interp="LINEAR", frame=f)
    key(CHAR_ROOT, "location", t, yc(t), index=1, interp="LINEAR", frame=f)


# -- root X: dodge plan. Obstacle sides alternate when hits are >= 0.7 s apart, else they repeat
#    (a "wall run"), and the character steers to the opposite side.
def plan(hits, start_side=1):
    out, s, prev = [], start_side, None
    for t in hits:
        if prev is not None and t - prev >= 0.7:
            s = -s
        out.append((t, s))
        prev = t
    return out


PLAN_A = plan([t for t in HITS_A if t >= PHASE2_OBSTACLE_START], 1)
PLAN_B = plan(HITS_B, -1)
DODGE_A, DODGE_B, BANK = 2.6, 3.2, 28.0


def key_dodges(pl, dist, centre_by, hold_after):
    x_prev = 0.0
    key(CHAR_ROOT, "location", pl[0][0] - 1.0, 0.0, index=0)
    key_pivot_rot(pl[0][0] - 1.0, rz=0)
    for i, (t, s) in enumerate(pl):
        x = -s * dist
        ha = hold_after(t)
        key(CHAR_ROOT, "location", t - 0.25, x, index=0)
        key(CHAR_ROOT, "location", t + ha, x, index=0)
        if x != x_prev:
            key_pivot_rot(t - 0.45, rz=BANK * (1 if x > x_prev else -1))
            key_pivot_rot(t - 0.05, rz=0)
        nxt = pl[i + 1][0] if i + 1 < len(pl) else None
        if nxt is None or nxt - t > 2.2:
            back = min(t + ha + 0.8, centre_by) if nxt is None else t + ha + 0.8
            key(CHAR_ROOT, "location", back, 0.0, index=0)
            x = 0.0
        x_prev = x
    key(CHAR_ROOT, "location", centre_by, 0.0, index=0)


key(CHAR_ROOT, "location", 0, FALL_X, index=0)
key_dodges(PLAN_A, DODGE_A, T_FREEZE, lambda t: 0.15)
key_dodges(PLAN_B, DODGE_B, T_SLOW - 0.4, lambda t: 0.3 if abs(t - T_SETPIECE) < 0.01 else 0.12)

# -- body orientation & poses (v06b)
# He faces OUT over the void (-Y, rz = 0) as in v05. Shunt 1: still, breathing. Halfway to shunt 2 he
# readies and crouches. Shunt 2: jump out with a backflip (backflip = negative rx when facing -Y) into a
# slow tuck through the apex slow motion. Shunt 3: opens into a head-down dive, then belly-down skydive
# (rx -270 == +90). The flip adds -360 of pitch, so later rx keys are offset by RX_OFF.
RX_OFF = -360
POSES["BREATH"] = {"torso": (-2.5, 0, 0), "head": (-3, 0, 0), "arm_upper_L": (2, -8, 0), "arm_upper_R": (2, 8, 0),
                   "arm_lower_L": (-10, 0, 0), "arm_lower_R": (-10, 0, 0)}
POSES["LOOK_DOWN"] = {"torso": (4, 0, 0), "head": (14, 0, 0), "arm_upper_L": (0, -6, 0), "arm_upper_R": (0, 6, 0),
                      "arm_lower_L": (-8, 0, 0), "arm_lower_R": (-8, 0, 0)}


def rt(w):
    """real time at which the world clock is w seconds after shunt 2 (jump keys follow the slow motion)"""
    return real_t(W_S2 + w)


key_pivot_rot(0, rx=0, ry=0, rz=0)
key_pose(0, "STAND")
key_pose(S1, "STAND")
key_pose(S1 + 0.55 * (T_MID - S1), "BREATH")      # mostly still: one slow breath on the close-up
key_pose(T_MID - 0.15, "STAND")
key_pivot_rot(T_MID, ry=0)
key_pose(T_MID + 0.5, "LOOK_DOWN")                # halfway: glances down at the drop...
key_pose(T_MID + 1.3, "READY")                    # ...and loads up while the camera moves back
key_pivot_rot(T_MID + 1.3, ry=1.5)
key_pivot_rot(S2 - 0.55, ry=0)
key_pose(S2 - 0.55, "READY")
key_pose(S2 - 0.1, "CROUCH")                      # load...
key_pivot_rot(S2 - 0.1, rx=0)
key_pose(S2 + 0.1, "LEAP")                        # shunt 2: arms up, launch out over the void
key(CHAR_PIVOT, "location", S2 + 0.1, PIVOT_STAND_Z, index=2)
key_pivot_rot(rt(0.25), rx=-95)
key_pose(rt(0.25), "SPREAD")                      # open layout backflip...
key_pose(rt(0.45), "TUCK")                        # ...balls up as the slow motion settles
key_pivot_rot(rt(0.45), rx=-150)
key_pivot_rot(AP_RELEASE, rx=-190)                # slow tumble in the ball through the riser
key_pose(S3 - 0.05, "TUCK")
key_pivot_rot(S3, rx=-205)
key_pose(S3 + 0.3, "DIVE")                        # shunt 3: opens head-first into the dive...
key_pivot_rot(S3 + 0.35, rx=-225)
key_pose(S3 + 1.3, "SKYDIVE")                     # ...then flattens into the skydive
key_pivot_rot(S3 + 1.3, rx=90 + RX_OFF)
key_pivot_rot(BT_START, rx=90 + RX_OFF)
key_pose(BT_START, "SKYDIVE")
# bullet time (as v05)
key_pivot_rot(BT_CURL0, rx=90 + RX_OFF, ry=0)
key_pose(BT_CURL0, "SKYDIVE")
key_pose(BT_CURL1, "TUCK")
key_pivot_rot(BT_CURL1, rx=95 + RX_OFF, ry=-90)
key_pose(BT_END, "TUCK")
key_pivot_rot(BT_END, rx=105 + RX_OFF, ry=-102)
key(CHAR_PIVOT, "location", BT_END, PIVOT_Z["CROUCH"], index=2)
key_pivot_rot(T_DROP + 0.9, rx=105 + 300 + RX_OFF, interp="LINEAR")  # tumble through the crust
key_pose(T_DROP + 1.0, "TUCK")
key_pivot_rot(T_DROP + 1.4, rx=150 + 360 + RX_OFF, ry=0)
key_pose(T_DROP + 1.5, "DIVE")
key(CHAR_PIVOT, "location", T_DROP + 1.5, PIVOT_STAND_Z, index=2)
key_pivot_rot(T_SLOW - 0.2, rx=150 + 360 + RX_OFF)
key_pose(T_SLOW - 0.2, "DIVE")
# v06 ending: brakes into the hang (camera dives past), rights himself feet-first, then the slam
key_pose(T_SLOW + 0.7, "SPREAD")
key_pivot_rot(T_SLOW + 1.3, rx=360 + 360 + RX_OFF)
key_pose(T_PLUNGE - 0.1, "SPREAD")
key_pose(T_PLUNGE + 0.25, "SLAM")
key_pivot_rot(T_PLUNGE, rx=360 + 360 + RX_OFF)
key_pose(T_THUMP - 0.1, "PRELAND")
key_pivot_rot(T_THUMP - 0.1, rx=360 + 360 + RX_OFF)
key_pose(T_THUMP, "LAND_KNEEL")                                     # superhero landing
key_pivot_rot(T_THUMP, rx=360 + 360 + RX_OFF)
key_pose(T_THUMP + 1.2, "LAND_KNEEL")
key_pose(T_TAIL, "KNEEL_IDLE")
key_pose(T_END, "KNEEL_IDLE")

# ----------------------------------------------------------------------------------------------
# v06b: Ian's Meshy character (character/SciFi_Void_Walker_Rig_Idle_3.glb) under CHAR_PIVOT. Its armature
# gets sparse quaternion keys on the same frames as the stand-in poses (one key per pose change), each
# computed by aiming the bones along the stand-in limbs. Hand-edit the Action "ACT_Meshy_Poses" (or the
# stand-in limbs + re-run). The stand-in boxes live in collection "Character_StandIn" (hidden in renders
# when the model is found; toggle the collection to bring them back).
# ----------------------------------------------------------------------------------------------
from mathutils import Euler, Quaternion
CSI = bpy.data.collections.new("Character_StandIn")
CC.children.link(CSI)
for _o in [o for o in CHAR_PIVOT.children_recursive if o.type == "MESH"]:
    for _c in list(_o.users_collection):
        _c.objects.unlink(_o)
    CSI.objects.link(_o)
CHAR_GLB = find_input(os.path.join("character", "SciFi_Void_Walker_Rig_Idle_3.glb"))
CHAR_HEIGHT = 1.85
MESHY = None


def _find_lc(lc, coll):
    if lc.collection == coll:
        return lc
    for ch in lc.children:
        r = _find_lc(ch, coll)
        if r:
            return r
    return None


if CHAR_GLB:
    CM = bpy.data.collections.new("Character_Model")
    CC.children.link(CM)
    bpy.context.view_layer.active_layer_collection = _find_lc(bpy.context.view_layer.layer_collection, CM)
    _before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=CHAR_GLB)
    _new = [o for o in bpy.data.objects if o not in _before]
    bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection
    arm = next(o for o in _new if o.type == "ARMATURE")
    body = [o for o in _new if o.type == "MESH" and o.parent == arm]
    for o in _new:                                  # stray helper meshes (Meshy exports an unparented icosphere)
        if o.type == "MESH" and o.parent is None:
            bpy.data.objects.remove(o)
    arm.name, arm.data.name = "MESHY_Armature", "MESHY_Armature"
    for i, o in enumerate(body):
        o.name = "MESHY_Body" if i == 0 else "MESHY_Body_%d" % i
    # Meshy's own clip: kept (fake user) but not used
    if arm.animation_data and arm.animation_data.action:
        _ia = arm.animation_data.action
        _ia.name, _ia.use_fake_user = "MESHY_Idle_3_unused", True
        arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
        pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()
    _mn, _mx = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for o in body:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            _mn = Vector(map(min, _mn, w)); _mx = Vector(map(max, _mx, w))
    _k = CHAR_HEIGHT / (_mx.z - _mn.z)
    MESHY_RAW_HEIGHT = _mx.z - _mn.z
    arm.scale = arm.scale * _k
    arm.parent = CHAR_PIVOT
    arm.matrix_parent_inverse.identity()
    arm.location = (-0.5 * (_mn.x + _mx.x) * _k, -0.5 * (_mn.y + _mx.y) * _k, -PIVOT_STAND_Z - _mn.z * _k)
    for o in body:
        o["note"] = "Ian's Meshy model, scaled x%.3f to %.2f m; deformed by MESHY_Armature" % (_k, CHAR_HEIGHT)
        for m_ in o.data.materials:
            if m_:
                m_.diffuse_color = (0.09, 0.095, 0.11, 1.0)   # Workbench (material colour) look: gloss black armour
                m_.metallic, m_.roughness = 0.8, 0.2
    # stand-in -> bone mapping (armature space; both face -Y, +X = his left)
    B_ = arm.data.bones
    HL = {b.name: b.head_local.copy() for b in B_}
    RQ = {b.name: b.matrix_local.to_quaternion() for b in B_}
    DOWN = Vector((0, 0, -1))

    def _swing(frm, to):
        return (HL[to] - HL[frm]).normalized().rotation_difference(DOWN)

    def _swing_to(frm, to, target):
        return (HL[to] - HL[frm]).normalized().rotation_difference(target)

    ABD = math.radians(8.0)          # rig arms rest slightly away from the body in the stand-in's 'straight down'
    SW = {}
    for sd, sx in (("L", 1), ("R", -1)):
        SW["ua" + sd] = _swing_to("upper_arm." + sd, "forearm." + sd, Vector((sx * math.sin(ABD), 0, -math.cos(ABD))))
        SW["fa" + sd] = _swing("forearm." + sd, "hand." + sd)
        SW["th" + sd] = _swing("thigh." + sd, "shin." + sd)
        SW["sh" + sd] = _swing("shin." + sd, "foot." + sd)

    def _E(spec, part):
        return Euler(tuple(math.radians(a) for a in spec.get(part, (0, 0, 0))), "XYZ").to_quaternion()

    def bone_deltas(pose):
        sp = POSES[pose]
        I = Quaternion()
        Qt = _E(sp, "torso"); Qh = Qt @ _E(sp, "head")
        D = {"spine": I.slerp(Qt, 1 / 3), "spine.001": I.slerp(Qt, 2 / 3)}
        for n in ("spine.002", "spine.003", "spine.004", "shoulder.L", "shoulder.R"):
            D[n] = Qt
        for n in ("spine.005", "head_end", "headfront"):
            D[n] = Qh
        for sd in ("L", "R"):
            Qua = Qt @ _E(sp, "arm_upper_" + sd); Qla = Qua @ _E(sp, "arm_lower_" + sd)
            Qth = _E(sp, "leg_upper_" + sd); Qsh = Qth @ _E(sp, "leg_lower_" + sd)
            D["upper_arm." + sd] = Qua @ SW["ua" + sd]
            D["forearm." + sd] = D["hand." + sd] = Qla @ SW["fa" + sd]
            D["thigh." + sd] = Qth @ SW["th" + sd]
            D["shin." + sd] = D["foot." + sd] = D["toe." + sd] = Qsh @ SW["sh" + sd]
        out = {}
        for b in B_:
            Db = D.get(b.name, None)
            if Db is None:
                continue
            Dp = D.get(b.parent.name, Quaternion()) if b.parent else Quaternion()
            out[b.name] = RQ[b.name].inverted() @ Dp.inverted() @ Db @ RQ[b.name]
        return out

    POSE_Q = {}
    _last = {}
    act = bpy.data.actions.new("ACT_Meshy_Poses")
    arm.animation_data_create()
    arm.animation_data.action = act
    prefs_edit.keyframe_new_interpolation_type = "BEZIER"
    for t, pose in sorted(POSE_LOG, key=lambda x: x[0]):
        if pose not in POSE_Q:
            POSE_Q[pose] = bone_deltas(pose)
        for bn, q in POSE_Q[pose].items():
            q = q.copy()
            if bn in _last and _last[bn].dot(q) < 0:
                q.negate()
            _last[bn] = q
            pb = arm.pose.bones[bn]
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=F(t), group=bn)
    MESHY = arm
    CSI.hide_render = True
    _lc = _find_lc(bpy.context.view_layer.layer_collection, CSI)
    if _lc:
        _lc.hide_viewport = True
    print("[blockout] Meshy model: %s, %d bones, raw height %.3f m -> %.2f m, %d pose keys on %d bones"
          % (os.path.basename(CHAR_GLB), len(B_), MESHY_RAW_HEIGHT, CHAR_HEIGHT, len(POSE_LOG), len(POSE_Q[next(iter(POSE_Q))])))
else:
    print("[blockout] Meshy model not found - stand-in only")

# ----------------------------------------------------------------------------------------------
# 02 Fall monoliths (one per groove hit, crossing the fall line at the character's height)
# ----------------------------------------------------------------------------------------------
C2 = COLL["02_Fall_Monoliths"]
MONO_GAP = 0.65
for i, (t, s) in enumerate(PLAN_A):
    idx = HITS_A.index(t) + 1
    sc = rng.uniform(0.85, 1.3)
    w, d, h = 2.4 * sc, 1.2 * sc, 10.0 * sc
    cx = FALL_X + s * (MONO_GAP + (0.6 if idx == 17 else 0.0) + w / 2)   # v05: gap 0.4 -> 0.65; v06b: hitA_17 +0.6 (camera passed 0.58 m)
    ob = box("MONO_hitA_%02d_t%.2f" % (idx, t), (w, d, h), (cx, FALL_Y, zc(t)), M_MONO, C2)
    box("MONO_hitA_%02d_glyph" % idx, (w * 0.3, d * 1.05, h * 0.6), (0, 0, 0), M_MONO_EDGE, C2, parent=ob)
    tilt = math.radians(rng.uniform(-18, 18))
    spin = math.radians(rng.choice((-1, 1)) * rng.uniform(15, 40))
    vy = rng.choice((-1, 1)) * rng.uniform(2.0, 4.0)
    if s < 0:
        vy = -abs(vy)
    # v05: world motion runs on the bullet-time clock (dt = world-clock offset from the hit)
    t_hi = real_t(world_t(t) + 4.0)
    if t_hi <= BT_START:
        ts = [t - 4.0, t + 4.0]
    else:
        ts = [t - 4.0] + [BT_START + k / FPS for k in range(int((min(t_hi, T_END) - BT_START) * FPS) + 1)]
        ts = [x for x in ts if x >= t - 4.0]
    for tr in ts:
        dt = world_t(tr) - world_t(t)
        key(ob, "location", 0, (cx, FALL_Y + vy * dt, zc(t) + 1.5 * dt), interp="LINEAR", frame=F(tr))
        key(ob, "rotation_euler", 0, (tilt, tilt * 0.5, spin * dt / 4.0), interp="LINEAR", frame=F(tr))
    ob.location = (cx, FALL_Y, zc(t))
    ob["cue_time"] = t
    ob["side"] = s

# ----------------------------------------------------------------------------------------------
# 03 Breakthrough crust + mantle
# ----------------------------------------------------------------------------------------------
C3 = COLL["03_Breakthrough_Mantle"]
rng = _rng_v04_mantle()          # v05: identical crust / mantle / ending layout to v04
CT = 8.0
GRID, CELL = 8, 5.0
for (mn, mx) in (((-400, -400, -CT), (-20, 400, 0)), ((20, -400, -CT), (400, 400, 0)),
                 ((-20, -400, -CT), (20, FALL_Y - 20, 0)), ((-20, FALL_Y + 20, -CT), (20, 400, 0))):
    box_minmax("CRUST_Slab_%d_%d" % (mn[0], mn[1]), mn, mx, M_PLAZA, C3)
# v06: the breakthrough point is a pipe access hatch - frame + hazard border round the chunk grid
_hf = []
for (mn, mx) in (((-21.5, FALL_Y - 21.5), (21.5, FALL_Y - 20.0)), ((-21.5, FALL_Y + 20.0), (21.5, FALL_Y + 21.5)),
                 ((-21.5, FALL_Y - 20.0), (-20.0, FALL_Y + 20.0)), ((20.0, FALL_Y - 20.0), (21.5, FALL_Y + 20.0))):
    _hf.append(((mn[0], mn[1], -0.6), (mx[0], mx[1], 0.45)))
batch_boxes("HATCH_Frame", _hf, M_HAZARD, C3)
ug = box_minmax("CRUST_Underglow", (-20, FALL_Y - 20, -CT - 1.0), (20, FALL_Y + 20, -CT - 0.6), M_CRACK, C3)
# v03: the glow sheet breaks with the crust (the high bird's-eye camera would otherwise look down onto it)
for attr in ("hide_render", "hide_viewport"):
    setattr(ug, attr, False); ug.keyframe_insert(attr, frame=F(T_DROP))
    setattr(ug, attr, True); ug.keyframe_insert(attr, frame=F(T_DROP) + 2)
for gi in range(GRID):
    for gj in range(GRID):
        cx = -20 + CELL * (gi + 0.5)
        cy = FALL_Y - 20 + CELL * (gj + 0.5)
        dz = rng.uniform(-0.4, 0.2)
        ch = box("CRUST_Chunk_%d_%d" % (gi, gj), (CELL - 0.25, CELL - 0.25, CT * rng.uniform(0.8, 1.0)),
                 (cx, cy, -CT / 2 + dz), M_HATCH, C3)
        r = math.hypot(cx - FALL_X, cy - FALL_Y)
        if r < 14:
            dirv = Vector((cx - FALL_X, cy - FALL_Y, 0)).normalized() if r > 0.1 else Vector((1, 0, 0))
            out = rng.uniform(15, 30) * (1.4 - r / 14)
            key(ch, "location", T_DROP - 0.05, ch.location[:])
            key(ch, "rotation_euler", T_DROP - 0.05, (0, 0, 0))
            dest = (cx + dirv.x * out, cy + dirv.y * out, ch.location.z - rng.uniform(25, 60))
            key(ch, "location", T_DROP + 0.1, (cx + dirv.x * (out * 0.45 + 6), cy + dirv.y * (out * 0.45 + 6), ch.location.z - 3))
            key(ch, "location", T_DROP + 1.4, (dest[0] + dirv.x * 6, dest[1] + dirv.y * 6, dest[2]))
            key(ch, "rotation_euler", T_DROP + 1.4, tuple(math.radians(rng.uniform(-200, 200)) for _ in range(3)))
        else:  # cracked, sagging slightly on impact
            key(ch, "rotation_euler", T_DROP, (0, 0, 0))
            key(ch, "rotation_euler", T_DROP + 0.3, (math.radians(rng.uniform(-6, 6)), math.radians(rng.uniform(-6, 6)), 0))

shaft_top, shaft_bot = -CT, Z_CORE + CAVERN_R * 0.95 - 30


def tube(name, z0, z1, material, coll, segs=40, step=10.0):
    """open tube from z0 (top) down to z1 following cl(z) with radius shaft_r(z)"""
    bm = bmesh.new()
    n = max(2, int(math.ceil((z0 - z1) / step)) + 1)
    rows = []
    for k in range(n):
        z = z0 + (z1 - z0) * k / (n - 1)
        ox, oy = cl(z)
        r = shaft_r(z)
        rows.append([bm.verts.new((FALL_X + ox + r * math.cos(2 * math.pi * i / segs),
                                   FALL_Y + oy + r * math.sin(2 * math.pi * i / segs), z)) for i in range(segs)])
    for a_, b_ in zip(rows, rows[1:]):
        for i in range(segs):
            bm.faces.new((a_[i], a_[(i + 1) % segs], b_[(i + 1) % segs], b_[i]))
    return _new_obj(name, bm, material, coll)


Z_ZA, Z_ZB = Z_ZONE_TOP + ZONE_TAPER, Z_ZONE_BOT - ZONE_TAPER
tube("MANTLE_Shaft_Upper", shaft_top, Z_ZA, M_MANTLE, C3)
tube("MACH_Shaft_Zone", Z_ZA, Z_ZB, M_MACH, COLL["03c_Machinery_Zone"])
tube("MANTLE_Shaft_Lower", Z_ZB, shaft_bot, M_MANTLE, C3)
z = shaft_top - 60
k = 0
while z > shaft_bot + 20:   # glowing magma veins: speed reference rings (cyan inside the machinery zone)
    ox, oy = cl(z)
    inz = Z_ZB < z < Z_ZA
    torus(("MACH_Ring_%02d" if inz else "MANTLE_LavaRing_%02d") % k, shaft_r(z) - 0.5, 1.4, (FALL_X + ox, FALL_Y + oy, z),
          M_RING_C if inz else M_LAVA, COLL["03c_Machinery_Zone"] if inz else C3, segs=40, ring_segs=6)
    z -= rng.uniform(35, 70)
    k += 1
for i in range(int((shaft_top - shaft_bot) / 18)):        # rocks embedded in the shaft walls
    a = rng.uniform(0, 2 * math.pi)
    rr = rng.uniform(2.5, 7.0)
    zz = rng.uniform(shaft_bot, shaft_top - 20)
    sq = rng.uniform(1.0, 2.2)
    if zone_w(zz) > 0.05:
        continue
    ox, oy = cl(zz)
    R = shaft_r(zz)
    rock("MANTLE_WallRock_%02d" % i, rr, (FALL_X + ox + (R - rr * 0.4) * math.cos(a), FALL_Y + oy + (R - rr * 0.4) * math.sin(a), zz),
         M_ROCK, C3, squash=(1, 1, sq))

emb, emb_c = [], []
for i in range(int((shaft_top - shaft_bot) / 4)):
    a, r = rng.uniform(0, 2 * math.pi), rng.uniform(7.5, SHAFT_R - 2)
    zz = rng.uniform(shaft_bot + 40, shaft_top - 20)
    sz, ln = rng.uniform(0.15, 0.35), rng.uniform(3, 9)
    ox, oy = cl(zz)
    r *= shaft_r(zz) / SHAFT_R
    x, y = FALL_X + ox + r * math.cos(a), FALL_Y + oy + r * math.sin(a)
    (emb_c if zone_w(zz) > 0.5 else emb).append(((x - sz, y - sz, zz), (x + sz, y + sz, zz + ln)))
batch_boxes("SPEED_Mantle_EmberStreaks", emb, M_LAVA, C3)
batch_boxes("SPEED_Zone_Sparks", emb_c, M_RING_C, COLL["03c_Machinery_Zone"])

# ---- v06 machinery zone: ring girders, radial struts (>= 14 m off the axis), wall units, light strips
CZ = COLL["03c_Machinery_Zone"]
mrng = random.Random(3636)
z = Z_ZONE_TOP + 30
k = 0
wall_units, strips_ = [], []
while z > Z_ZONE_BOT - 30:
    ox, oy = cl(z)
    R = shaft_r(z)
    torus("MACH_Girder_%02d" % k, R - 1.6, 1.1, (FALL_X + ox, FALL_Y + oy, z), M_MACH_DK, CZ, segs=40, ring_segs=4)
    for _s in range(mrng.randint(1, 3)):
        a = mrng.uniform(0, 2 * math.pi)
        r_in = mrng.uniform(15, 26)
        L = R - r_in
        st = box("MACH_Strut_%02d_%d" % (k, _s), (L, 2.4, 3.0),
                 (FALL_X + ox + (r_in + L / 2) * math.cos(a), FALL_Y + oy + (r_in + L / 2) * math.sin(a), z + mrng.uniform(-6, 6)),
                 M_MACH_DK, CZ, rot=(0, 0, a))
        if mrng.random() < 0.5:   # turbine housing on the strut tip
            cylinder("MACH_Turbine_%02d_%d" % (k, _s), 3.2, 5.0,
                     (FALL_X + ox + (r_in + 2.5) * math.cos(a), FALL_Y + oy + (r_in + 2.5) * math.sin(a), st.location.z),
                     M_MACH, CZ, segs=16)
    for _u in range(8):
        a = mrng.uniform(0, 2 * math.pi)
        zz = z - mrng.uniform(0, 45)
        R2 = shaft_r(zz) - 2.5
        ox2, oy2 = cl(zz)
        cx_, cy_ = FALL_X + ox2 + R2 * math.cos(a), FALL_Y + oy2 + R2 * math.sin(a)
        s_ = mrng.uniform(2, 5)
        wall_units.append(((cx_ - s_, cy_ - s_, zz), (cx_ + s_, cy_ + s_, zz + mrng.uniform(3, 12))))
        if mrng.random() < 0.6:
            R3 = shaft_r(zz) - 0.8
            sx_, sy_ = FALL_X + ox2 + R3 * math.cos(a + 0.2), FALL_Y + oy2 + R3 * math.sin(a + 0.2)
            strips_.append(((sx_ - 0.35, sy_ - 0.35, zz), (sx_ + 0.35, sy_ + 0.35, zz + mrng.uniform(10, 30))))
    z -= mrng.uniform(40, 60)
    k += 1
batch_boxes("MACH_WallUnits", wall_units, M_MACH, CZ)
batch_boxes("MACH_LightStrips", strips_, M_RING_C, CZ)
point_light("MACH_Light_Zone", (FALL_X + cl((Z_ZONE_TOP + Z_ZONE_BOT) / 2)[0], FALL_Y + cl((Z_ZONE_TOP + Z_ZONE_BOT) / 2)[1],
            (Z_ZONE_TOP + Z_ZONE_BOT) / 2), (0.3, 0.95, 1.0), 400000, CZ, radius=10)

# ---- v06 pipes: surface routes converge on the hatch, dive into the ground and run down the shaft walls
CP = COLL["03b_Pipes"]


def pipe_curve(name, pts, radius, material):
    cd = bpy.data.curves.new(name, "CURVE")
    cd.dimensions = "3D"
    cd.bevel_depth = radius
    cd.bevel_resolution = 2
    cd.resolution_u = 6
    cd.use_fill_caps = True
    sp = cd.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p[:]
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cd)
    ob.data.materials.append(material)
    ob.color = material.diffuse_color
    CP.objects.link(ob)
    return ob


def wall_run(a, pr, z_from):
    out = []
    z = z_from
    while z > shaft_bot + 5:
        ox, oy = cl(z)
        R = shaft_r(z) - pr - 0.3
        out.append(Vector((FALL_X + ox + R * math.cos(a), FALL_Y + oy + R * math.sin(a), z)))
        z -= 30.0
    return out


_supports = []
for name, pr, pts, a_end in PIPE_PLAN:
    full = pts + wall_run(a_end, pr, -CT - 8.0)
    pipe_curve(name, full, pr, M_PIPE if pr < 1.8 else M_PIPE_DK)
    for p0, p1 in zip(pts[:2], pts[1:3]):        # stilts under raised runs
        if p0.z > pr + 1.0:
            for u in (0.15, 0.4, 0.65, 0.9):
                q = p0.lerp(p1, u)
                _supports.append(((q.x - 0.6, q.y - 0.6, 0.0), (q.x + 0.6, q.y + 0.6, q.z - pr)))
if _supports:
    batch_boxes("PIPE_Supports", _supports, M_PIPE_DK, CP)
for _i in range(9):                              # extra wall-only pipes (part of the tunnel walls)
    a = prng.uniform(0, 2 * math.pi)
    pr = prng.uniform(0.5, 1.5)
    pipe_curve("PIPE_Wall_%02d" % _i, wall_run(a, pr, -CT - 2.0), pr, M_PIPE_DK)

# flying rocks / cliff sides on the mantle hits
SETPIECE_BOULDER_X = 16.5        # v05: was 15.5 - the boulder passed ~1.8 m from the camera
for i, (t, s) in enumerate(PLAN_B):
    idx = HITS_B.index(t) + 1
    zt = zc(t)
    _ox, _oy = cl(zt)          # v06: obstacles sit in the bent shaft
    FALL_X, FALL_Y = 0.0 + _ox, -8.0 + _oy
    SHAFT_R = shaft_r(zt)
    if abs(t - T_SETPIECE) < 0.01:      # ---- SET PIECE: giant boulder + opposing cliff, thread the gap
        big = rock("SETPIECE_%.1f_Boulder" % t, 14.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y, zt), M_SETPIECE, C3, subdiv=2, jitter=0.12)
        key(big, "location", t - 3.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y + 6, zt + 40), interp="LINEAR")
        key(big, "location", t + 3.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y - 6, zt - 40), interp="LINEAR")
        key(big, "rotation_euler", t - 3.0, (0, 0, 0), interp="LINEAR")
        key(big, "rotation_euler", t + 3.0, (math.radians(60), math.radians(25), 0), interp="LINEAR")
        big.location = (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y, zt)
        cliff_ = box_minmax("SETPIECE_%.1f_Cliff" % t, (min(-s * SHAFT_R, -s * 5.8), FALL_Y - 12, zt - 9),
                        (max(-s * SHAFT_R, -s * 5.8), FALL_Y + 12, zt + 9), M_CLIFF, C3)
        point_light("SETPIECE_Glow", (FALL_X, FALL_Y, zt - 20), (1.0, 0.4, 0.1), 200000, C3, radius=5)
        continue
    if i % 3 == 2:                       # cliff side jutting out of the wall
        h = rng.uniform(10, 16)
        cliff_ = box_minmax("CLIFF_hitB_%02d_t%.2f" % (idx, t), (min(s * SHAFT_R, s * 1.0), FALL_Y - 10, zt - h / 2),
                        (max(s * SHAFT_R, s * 1.0), FALL_Y + 10, zt + h / 2), M_CLIFF, C3)
        cliff_["cue_time"] = t
    else:                                # flying rock
        rr = rng.uniform(2.4, 3.4)
        cx = FALL_X + s * (0.7 + rr)         # v04: +0.4 m so the faster camera never grazes the rock
        rk = rock("ROCK_hitB_%02d_t%.2f" % (idx, t), rr, (cx, FALL_Y, zt), M_ROCK, C3, squash=(1, 1, rng.uniform(1.0, 1.6)))
        vy = rng.choice((-1, 1)) * rng.uniform(3, 6)
        for dt in (-3.0, 3.0):
            key(rk, "location", t + dt, (cx - s * 2.0 * dt / 3, FALL_Y + vy * dt, zt + 4 * dt), interp="LINEAR")
            key(rk, "rotation_euler", t + dt, (dt * 0.8, dt * 0.5, dt * 0.3), interp="LINEAR")
        rk.location = (cx, FALL_Y, zt)
        rk["cue_time"] = t
        # trailing lava blob so rocks read as "flying"
        sphere("ROCK_hitB_%02d_ember" % idx, rr * 0.35, (0, 0, rr * 0.9), M_LAVA, C3, segs=8, rings=4, parent=rk)
FALL_X, FALL_Y, SHAFT_R = 0.0, -8.0, 35.0

# slow-motion debris that travels with the character then hangs in the air
for i in range(10):
    a = math.radians(200 + 250 * i / 10) + rng.uniform(-0.2, 0.2) * 0.5   # v06: clear of the camera's dive (90-190 deg)
    rr = rng.uniform(2.5, 7.0)
    off = Vector((rr * math.cos(a), rr * math.sin(a), rng.uniform(-3, 6)))
    db = rock("SLOWMO_Debris_%02d" % i, rng.uniform(0.25, 0.7), (0, 0, 0), M_ROCK, C3)
    for t in (T_SLOW - 1.0, T_SLOW):
        key(db, "location", t, (FALL_X + off.x, FALL_Y + off.y, zc(t) + off.z), interp="LINEAR")
    drift = Vector((rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6), -0.8))
    key(db, "location", T_THUMP - 0.05, (FALL_X + off.x + drift.x, FALL_Y + off.y + drift.y, zc(T_SLOW) + off.z + drift.z))
    blast = Vector((off.x, off.y, 0)).normalized() * rng.uniform(6, 14)
    key(db, "location", T_THUMP + 1.2, (FALL_X + off.x + blast.x, FALL_Y + off.y + blast.y, Z_CORE + rng.uniform(-6, 2)))
    key(db, "rotation_euler", T_SLOW - 1.0, (0, 0, 0), interp="LINEAR")
    key(db, "rotation_euler", T_SLOW, (8, 5, 3), interp="LINEAR")
    key(db, "rotation_euler", T_THUMP, (8.6, 5.4, 3.3), interp="LINEAR")
    key(db, "rotation_euler", T_THUMP + 1.2, (12, 9, 6), interp="LINEAR")

point_light("MANTLE_Light_Top", (FALL_X, FALL_Y, -60), (1.0, 0.35, 0.08), 500000, C3, radius=10)
point_light("MANTLE_Light_Mid", (FALL_X, FALL_Y, (shaft_top + shaft_bot) / 2), (1.0, 0.3, 0.05), 500000, C3, radius=10)

# ----------------------------------------------------------------------------------------------
# 04 Core
# ----------------------------------------------------------------------------------------------
C4 = COLL["04_Core"]
cav_c = Z_CORE - 30
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=CAVERN_R)
bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.calc_center_median().z > CAVERN_R * 0.93], context="FACES")
_new_obj("CORE_Cavern", bm, M_CAVERN, C4, (FALL_X, FALL_Y, cav_c))
plat = cylinder("CORE_Platform", 10.0, 1.5, (FALL_X, FALL_Y, Z_CORE - 0.75), M_PLAT, C4, segs=48)
torus("CORE_Platform_GoldRing", 10.3, 0.35, (FALL_X, FALL_Y, Z_CORE - 0.2), M_GOLD, C4)
torus("CORE_Platform_GoldRing_Outer", 14.0, 0.25, (FALL_X, FALL_Y, Z_CORE - 3.0), M_GOLD, C4)
cylinder("CORE_Platform_Underside", 6.0, 6.0, (FALL_X, FALL_Y, Z_CORE - 4.5), M_GOLD, C4, segs=24)
mono = box("CORE_Data_Monolith", (1.6, 0.5, 5.5), (FALL_X, FALL_Y - 5.0, Z_CORE + 2.75), M_DATA, C4)
box("CORE_Data_Monolith_Base", (2.4, 1.2, 0.4), (FALL_X, FALL_Y - 5.0, Z_CORE + 0.2), M_GOLD, C4)
key(mono, "location", T_THUMP, (FALL_X, FALL_Y - 5.0, Z_CORE + 2.75))
key(mono, "location", T_END, (FALL_X, FALL_Y - 5.0, Z_CORE + 3.25))
sphere("CORE_Light_Point", 4.0, (FALL_X, FALL_Y, Z_CORE - 40), M_CORE_LIGHT, C4)   # the 'tiny point of light'
cylinder("CORE_Light_Beam", 0.6, 32.0, (FALL_X, FALL_Y, Z_CORE - 22), M_CORE_LIGHT, C4, segs=12)
SHARD_RING_OFFSET_DEG = 30.0   # v05: was 0 - one shard sat right behind him in the landing side view
srng = random.Random(6)     # v04: own seed so the shards don't move when other layout changes
for i in range(6):  # floating gold shards around the chasm
    a = 2 * math.pi * i / 6 + math.radians(SHARD_RING_OFFSET_DEG)
    box("CORE_Shard_%d" % i, (1.2, 1.2, 9), (FALL_X + 30 * math.cos(a), FALL_Y + 30 * math.sin(a), Z_CORE + srng.uniform(-8, 10)),
        M_GOLD, C4, rot=(srng.uniform(-0.4, 0.4), srng.uniform(-0.4, 0.4), a))
point_light("CORE_Light", (FALL_X, FALL_Y, Z_CORE + 6), (0.4, 0.95, 1.0), 20000, C4, radius=3)
point_light("CORE_Light_Below", (FALL_X, FALL_Y, Z_CORE - 30), (0.4, 0.95, 1.0), 100000, C4, radius=5)

# ----------------------------------------------------------------------------------------------
# FX placeholders
# ----------------------------------------------------------------------------------------------
CF = COLL["FX_Placeholders"]
flash = sphere("FX_Smash_Flash", 1.0, (FALL_X, FALL_Y, 0), M_FLASH, CF)
key_scale(flash, 0, 0.001, frame=F(T_DROP) - 1, interp="CONSTANT")
key_scale(flash, 0, 60.0, frame=F(T_DROP), interp="CONSTANT")
key_scale(flash, 0, 60.0, frame=F(T_DROP) + 3)
key_scale(flash, 0, 0.001, frame=F(T_DROP) + 6)
fire = sphere("FX_Smash_Fireball", 1.0, (FALL_X, FALL_Y, 3), M_FIRE, CF)
key_scale(fire, T_DROP - 0.05, 0.001)
key_scale(fire, T_DROP + 0.5, 18.0)
key_scale(fire, T_DROP + 1.3, 24.0)
key_scale(fire, T_DROP + 1.4, 0.001)
shock = torus("FX_Land_Shockwave", 1.0, 0.08, (FALL_X, FALL_Y, Z_CORE + 0.15), M_SHOCK, CF)
key(shock, "scale", 0, (0.001, 0.001, 0.001), frame=F(T_THUMP) - 1, interp="CONSTANT")
key(shock, "scale", 0, (0.3, 0.3, 8.0), frame=F(T_THUMP))
key(shock, "scale", T_THUMP + 0.9, (45.0, 45.0, 14.0))
key(shock, "scale", T_THUMP + 1.0, (0.001, 0.001, 0.001))
lflash = cylinder("FX_Land_Flash", 1.0, 0.06, (FALL_X, FALL_Y, Z_CORE + 0.05), M_SHOCK, CF, segs=32)
key_scale(lflash, 0, 0.001, frame=F(T_THUMP) - 1, interp="CONSTANT")
key(lflash, "scale", 0, (5.0, 5.0, 1.0), frame=F(T_THUMP))
key(lflash, "scale", 0, (9.0, 9.0, 1.0), frame=F(T_THUMP) + 4)
# v06: heavier landing - dust ring + a stretched streak above him in the last frames of the slam
dring = torus("FX_Land_DustRing", 1.0, 0.35, (FALL_X, FALL_Y, Z_CORE + 0.12), M_CONC, CF, segs=32, ring_segs=6)
key(dring, "scale", 0, (0.001, 0.001, 0.001), frame=F(T_THUMP) - 1, interp="CONSTANT")
key(dring, "scale", 0, (1.0, 1.0, 0.5), frame=F(T_THUMP))
key(dring, "scale", T_THUMP + 0.5, (6.5, 6.5, 0.6))
key(dring, "scale", T_THUMP + 1.4, (8.5, 8.5, 0.4))
key(dring, "scale", T_THUMP + 1.5, (0.001, 0.001, 0.001))
streak = cylinder("FX_Slam_Streak", 0.22, 1.0, (0, 0, 0.5), M_SHOCK, CF, segs=12)
for v in streak.data.vertices:
    v.co.z += 0.5
streak.parent = CHAR_ROOT
streak.location = (0, 0, 1.6)
key(streak, "scale", 0, (0.001, 0.001, 0.001), frame=F(T_THUMP) - 6, interp="CONSTANT")
key(streak, "scale", 0, (1.0, 1.0, 14.0), frame=F(T_THUMP) - 5, interp="CONSTANT")
key(streak, "scale", 0, (0.001, 0.001, 0.001), frame=F(T_THUMP) + 1, interp="CONSTANT")
key_scale(lflash, 0, 0.001, frame=F(T_THUMP) + 6)
# v05: bullet-time debris - wall rubble falling with him that hangs in the air in slow motion.
# Positions use the world clock; nothing sits on the camera's push-in side (-X/+Y quadrant).
drng = random.Random(2205)
_rng_keep, rng = rng, drng       # rock() jitter draws from `rng`: keep the v04 stream untouched
_n = 0
while _n < 14:
    a = drng.uniform(0, 2 * math.pi)
    rr = drng.uniform(1.8, 6.5)
    dz = drng.uniform(-3.5, 4.5)
    da = math.degrees(abs((a - math.radians(144) + math.pi) % (2 * math.pi) - math.pi))
    if da < 65 and dz > -2.5:
        continue
    off = Vector((rr * math.cos(a), rr * math.sin(a), dz))
    vel = Vector((drng.uniform(-3, 3), drng.uniform(-3, 3), drng.uniform(-2, 3)))
    spin = Vector((drng.uniform(-4, 4), drng.uniform(-4, 4), drng.uniform(-4, 4)))
    db = rock("FREEZE_Debris_%02d" % _n, drng.uniform(0.12, 0.45), (0, 0, 0), M_ROCK, CF)
    db["note"] = "v05 bullet-time debris: keyed per frame on the world clock"
    t0 = BT_START - 0.5
    key_scale(db, 0, 0.001, frame=F(t0) - 1, interp="CONSTANT")
    key_scale(db, t0 + 0.25, 1.0)
    for f in range(F(t0), F(BT_END) + 2):
        tr = (f - 1) / FPS
        dw = world_t(tr) - world_t(BT_START)
        p_ = Vector((FALL_X, FALL_Y, zc(tr))) + off + vel * dw
        key(db, "location", 0, p_[:], interp="LINEAR", frame=f)
        key(db, "rotation_euler", 0, (spin * dw)[:], interp="LINEAR", frame=f)
    key_scale(db, 0, 1.0, frame=F(BT_END) + 1, interp="CONSTANT")
    key_scale(db, 0, 0.001, frame=F(BT_END) + 2, interp="CONSTANT")
    _n += 1
rng = _rng_keep

leapdust = torus("FX_Leap_Dust", 1.0, 0.15, (0, Y_START, Z_ROOF + 0.1), M_CONC_HI, CF)
key_scale(leapdust, 0, 0.001, frame=F(S2) - 1, interp="CONSTANT")
key_scale(leapdust, S2, 0.3)
key_scale(leapdust, S2 + 0.6, 1.1)
key_scale(leapdust, S2 + 0.7, 0.001)

# Guide curve showing the full descent (viewport only, hidden by default)
cd = bpy.data.curves.new("GUIDE_Descent_Path", "CURVE")
cd.dimensions = "3D"
sp = cd.splines.new("POLY")
pts = [i * 0.25 for i in range(int(T_END / 0.25) + 1)]
sp.points.add(len(pts) - 1)
for p, t in zip(sp.points, pts):
    yy = yc(t)
    p.co = (FALL_X + xc_cl(t), yy, zc(t), 1.0)
guide_path = bpy.data.objects.new("GUIDE_Descent_Path", cd)
CF.objects.link(guide_path)
guide_path.hide_render = True

# ----------------------------------------------------------------------------------------------
# Cameras: CAM_RIG follows CHAR_ROOT (Y/Z only, so dodges read on screen) -> CAM_SHAKE -> CAM_MAIN
# ----------------------------------------------------------------------------------------------
CCam = COLL["Cameras"]
rig = empty("CAM_RIG", CCam, kind="CUBE", size=0.5)
con = rig.constraints.new("COPY_LOCATION")
con.target = CHAR_ROOT
con.use_x = False
con_x = rig.constraints.new("COPY_LOCATION")   # follow 60% of the lateral dodge: dodge reads, char stays in the 9:16 centre
con_x.name = "Copy X (partial)"
con_x.target = CHAR_ROOT
con_x.use_y = con_x.use_z = False
con_x.influence = 0.6
# v06: + 40% of the tunnel-bend offset, so rig.x = bend + 60% of the dodge (dodges still read on screen)
PATH_CENTRE = empty("PATH_CENTRE", CCam, kind="PLAIN_AXES", size=2.0)
PATH_CENTRE["note"] = "X = tunnel bend centre offset; CAM_RIG follows it at 40% on top of CHAR_ROOT X at 60%"
con_p = rig.constraints.new("COPY_LOCATION")
con_p.name = "Copy X (tunnel centre)"
con_p.target = PATH_CENTRE
con_p.use_y = con_p.use_z = False
con_p.use_offset = True
con_p.influence = 0.4
shake = empty("CAM_SHAKE", CCam, parent=rig, kind="PLAIN_AXES", size=0.3)
cam_d = bpy.data.cameras.new("CAM_MAIN")
cam_d.lens = 35
cam_d.clip_start = 0.3
cam_d.clip_end = 15000
cam_d.passepartout_alpha = 0.85
aim = empty("CAM_AIM", CCam, parent=shake, kind="ARROWS", size=0.3)   # position + Track To
cam = bpy.data.objects.new("CAM_MAIN", cam_d)
CCam.objects.link(cam)
cam.parent = aim                     # CAM_MAIN local Z rotation = dutch roll
target = empty("CAM_TARGET", CCam, parent=rig, kind="SPHERE", size=0.4)
tt = aim.constraints.new("TRACK_TO")
tt.target = target
tt.track_axis = "TRACK_NEGATIVE_Z"
tt.up_axis = "UP_Y"
scene.camera = cam

# (time, camera offset from character, look-at offset from character, lens mm, dutch roll deg)
def BIRD(height, h_off, pitch, depth=28.0):
    """camera `height` m above him, `h_off` m back along the -X/+Y diagonal; view axis `pitch` deg down."""
    a = h_off / math.sqrt(2)
    dz = height + depth
    hx = dz / math.tan(math.radians(pitch))
    b = (hx - h_off) / math.sqrt(2)
    return (-a, a, height), (b, -b, -depth)
FALL_OFF, FALL_LOOK = BIRD(12.0, 2.7, 85)
# v06b opener (CAM_OPENER, free camera): in front of him over the void, looking back (+Y) at his face; still
# until halfway to shunt 2, then a LINEAR move straight back (and up, out of his jump path) to shunt 2.
OPEN_LENS = 50
OPEN_D0, OPEN_H0, OPEN_L0 = 2.2, 1.72, 1.62      # distance in front of him, lens height, look height
OPEN_D1, OPEN_H1, OPEN_L1 = 8.0, 2.3, 1.15
# CAM_MAIN takes over on shunt 2 from exactly the opener's end pose and simply follows him up through the
# slow-motion arc (it backs off as he comes towards it). Shunt 3: it dives after him, following first,
# then twists round (one full roll) into the falling follow. Later roll keys carry the +360.
TW = 360
CAM_KEYS = [
    (S2, (0.0, -OPEN_D1, OPEN_H1), (0.0, 0.0, OPEN_L1), OPEN_LENS, 0),
    (rt(0.3), (0.3, -7.0, 1.5), (0.0, 0.0, 0.8), 46, 0),           # following him up...
    (APEX_T, (0.8, -4.8, 0.3), (0.0, 0.0, 0.4), 40, -2),            # ...slightly below him at the apex
    (AP_RELEASE, (1.0, -4.5, 0.5), (0.0, 0.0, 0.3), 38, -3),
    (S3, (1.0, -4.4, 1.4), (0.0, 0.0, 0.1), 34, 0),
    (S3 + 0.6, (1.2, -2.6, 6.5), (0.0, -1.5, -1.8), 28, 70),       # diving after him, rolling...
    (S3 + 1.6, FALL_OFF, FALL_LOOK, 24, TW - 4),                     # ...round into the falling follow
    (15.0, FALL_OFF, FALL_LOOK, 24, TW + 5),
    (BT_START, FALL_OFF, FALL_LOOK, 24, TW + -3),
    (BT_SETTLE, (-2.4, 2.4, 4.2), (0.0, 0.0, -0.8), 28, TW + 0),
    (BT_CURL1, (-3.2, 2.4, 2.0), (0.0, -0.1, 0.75), 38, TW + 3),
    (BT_END - 0.25, (-2.45, 1.85, 1.5), (0.3, -0.35, 0.95), 48, TW + 6),
    (BT_END - 1.0 / FPS, (-2.35, 1.78, 1.45), (0.35, -0.4, 1.0), 50, TW + 6),
    (T_DROP, *BIRD(14.0, 2.4, 88), 22, TW + 0),
    (T_DROP + 1.2, FALL_OFF, FALL_LOOK, 24, TW + -5),
    (T_SETPIECE - 0.4, *BIRD(8.5, 2.4, 82), 22, TW + 4),
    (T_SETPIECE + 0.6, *BIRD(8.5, 2.4, 82), 22, TW + -3),
    (T_SETPIECE + 2.0, FALL_OFF, FALL_LOOK, 24, TW + 3),
    (30.6, FALL_OFF, FALL_LOOK, 24, TW + -7),                     # v06: dutch leans into the bends
    (33.0, FALL_OFF, FALL_LOOK, 24, TW + 9),
    (35.4, FALL_OFF, FALL_LOOK, 24, TW + -8),
    (37.8, FALL_OFF, FALL_LOOK, 24, TW + 6),
    (T_CAM_DIVE, FALL_OFF, FALL_LOOK, 24, TW + 0),
]
CONST_BEFORE = {F(BT_END - 1.0 / FPS)}
for t, off, look, lens, roll in CAM_KEYS:
    ip = "CONSTANT" if F(t) in CONST_BEFORE else "BEZIER"
    key(aim, "location", t, off, interp=ip)
    key(target, "location", t, look, interp=ip)
    key(cam, "rotation_euler", t, math.radians(roll), index=2, interp=ip)
    cam_d.lens = lens
    prefs_edit.keyframe_new_interpolation_type = ip
    cam_d.keyframe_insert("lens", frame=F(t))
for t0, base, wide in ((T_DROP + 0.6, 24, 18),):     # FOV punch
    for dt, mm in ((-0.2, base), (0.0, wide), (0.9, base)):
        cam_d.lens = mm
        prefs_edit.keyframe_new_interpolation_type = "BEZIER"
        cam_d.keyframe_insert("lens", frame=F(t0 + dt))

# shake: restricted F-curve Noise only (no baked keys). Buffet in the fall + impacts.
key(shake, "location", 0, (0, 0, 0), interp="LINEAR", frame=1)
key(shake, "location", 0, (0, 0, 0), interp="LINEAR", frame=F(T_END))


def _fcurves(ob):
    return _fcurves_early(ob)


def add_noise(ob, path, t0, t1, strength, scale=2.5, blend=12):
    for fc in _fcurves(ob):
        if fc.data_path != path:
            continue
        m = fc.modifiers.new("NOISE")
        m.scale, m.strength, m.phase = scale, strength, rng.uniform(0, 100) + fc.array_index * 37
        m.use_restricted_range = True
        m.frame_start, m.frame_end = F(t0), F(t1)
        m.blend_in, m.blend_out = min(blend, 2), blend


for (t0, t1, strength) in ((S3 + 0.5, BT_START, 0.10), (T_DROP + 0.8, T_SLOW - 0.5, 0.18)):
    add_noise(shake, "location", t0, t1, strength)
add_noise(shake, "location", T_DROP, T_DROP + 0.9, 0.9, scale=1.2, blend=18)
add_noise(shake, "location", T_SETPIECE, T_SETPIECE + 0.6, 0.5, scale=1.2, blend=12)


def look_euler(pos, look, prev=None):
    q = (Vector(look) - Vector(pos)).to_track_quat("-Z", "Y")
    return q.to_euler("XYZ", prev) if prev is not None else q.to_euler("XYZ")


def free_cam(name, lens, clip_start=0.1):
    d = bpy.data.cameras.new(name)
    d.lens = lens
    d.clip_start = clip_start
    d.clip_end = 15000
    d.passepartout_alpha = 0.85
    ob = bpy.data.objects.new(name, d)
    CCam.objects.link(ob)
    return ob, d


def key_free(ob, d, frame, pos, look, lens, interp="BEZIER"):
    prev = ob.get("_prev_eul")
    e = look_euler(pos, look, None if prev is None else __import__("mathutils").Euler(prev, "XYZ"))
    ob["_prev_eul"] = e[:]
    key(ob, "location", 0, tuple(pos), interp=interp, frame=frame)
    key(ob, "rotation_euler", 0, e[:], interp=interp, frame=frame)
    d.lens = lens
    prefs_edit.keyframe_new_interpolation_type = interp
    d.keyframe_insert("lens", frame=frame)


# ---- CAM_OPENER + blackout card
cam_o, cam_od = free_cam("CAM_OPENER", OPEN_LENS, clip_start=0.05)
_cz = Vector((0.0, Y_START, Z_ROOF))
for f, (dd, hh, ll), ip in ((1, (OPEN_D0, OPEN_H0, OPEN_L0), "LINEAR"), (F(S1), (OPEN_D0, OPEN_H0, OPEN_L0), "LINEAR"),
                           (F(T_MID), (OPEN_D0, OPEN_H0, OPEN_L0), "LINEAR"),
                           (F(S2), (OPEN_D1, OPEN_H1, OPEN_L1), "LINEAR")):
    key_free(cam_o, cam_od, f, _cz + Vector((0, -dd, hh)), _cz + Vector((0, 0, ll)), OPEN_LENS, interp=ip)
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
blk = _new_obj("FX_Blackout", bm, M_BLACK, CCam, (0, 0, -0.12), parent=cam_o)
blk["note"] = "black card in front of CAM_OPENER: screen is black until shunt 1"
for attr in ("hide_render", "hide_viewport"):
    setattr(blk, attr, False); blk.keyframe_insert(attr, frame=1)
    setattr(blk, attr, True); blk.keyframe_insert(attr, frame=F(S1))
# Workbench specular lifts even a black card to dark grey, so the render is also exposed down to black.
prefs_edit.keyframe_new_interpolation_type = "CONSTANT"
scene.view_settings.exposure = -10.0
scene.view_settings.keyframe_insert("exposure", frame=1)
scene.view_settings.exposure = 0.0
scene.view_settings.keyframe_insert("exposure", frame=F(S1))
for fc_ in _fcurves_early(scene):
    if fc_.data_path.endswith("exposure"):
        for kp in fc_.keyframe_points:
            kp.interpolation = "CONSTANT"

# ---- CAM_ENDING: the camera overtakes him going down as he brakes into his slow-down (he is left
# above, off-screen), settles side-on at ground level, then he slams in from above.
cam_e, cam_ed = free_cam("CAM_ENDING", 24)
B = Vector((FALL_X, FALL_Y, Z_CORE))


def char_at(t):
    return Vector((FALL_X, FALL_Y, zc(t)))


H_PASS = zc(T_SLOW + 0.35) - Z_CORE
END_KEYS = [
    (T_CAM_DIVE, char_at(T_CAM_DIVE) + Vector(FALL_OFF), char_at(T_CAM_DIVE) + Vector(FALL_LOOK), 24),
    (T_SLOW - 0.05, char_at(T_SLOW - 0.05) + Vector((-1.9, 1.9, 4.0)), char_at(T_SLOW - 0.05) + Vector((0.4, -0.4, 0.2)), 24),
    (T_SLOW + 0.15, char_at(T_SLOW + 0.15) + Vector((-2.4, 2.4, 1.2)), char_at(T_SLOW + 0.15) + Vector((2.6, -2.6, -0.6)), 24),   # level with him: overtaking
    (T_SLOW + 0.4, char_at(T_SLOW + 0.4) + Vector((-2.6, 2.6, -4.0)), char_at(T_SLOW + 0.4) + Vector((2.5, -2.5, -14.0)), 24),   # he is left above, off-screen
    (T_SLOW + 0.9, B + Vector((-6.0, 5.0, H_PASS * 0.38)), B + Vector((0.0, 0.0, 0.0)), 28),
    (T_SIDE, B + Vector((-11.0, 0.5, 1.4)), B + Vector((0.0, 0.0, 1.8)), 35),                     # side view, he is off-screen above
    (T_THUMP, B + Vector((-10.4, 0.4, 1.3)), B + Vector((0.0, 0.0, 1.4)), 35),
    (T_THUMP + 0.5, B + Vector((-10.2, 0.4, 1.3)), B + Vector((0.0, 0.0, 1.0)), 35),
    (T_TAIL, B + Vector((-5.5, 4.5, 2.4)), B + Vector((0.0, -1.0, 0.7)), 32),                     # drift round behind him...
    (T_END, B + Vector((-1.2, 5.0, 2.6)), B + Vector((0.0, -2.5, 0.8)), 30),                      # ...over-shoulder on the data monolith
]
for t, p_, l_, lens in END_KEYS:
    key_free(cam_e, cam_ed, F(t), p_, l_, lens)
add_noise(cam_e, "location", T_THUMP, T_THUMP + 0.9, 0.45, scale=1.3, blend=20)
for _o in (cam_o, cam_e):
    del _o["_prev_eul"]

# ---- camera binding markers
def bind(frame, camob, name):
    for m in scene.timeline_markers:
        if m.frame == frame:
            m.camera = camob
            m.name = (name + "+" + m.name)[:63]
            return m
    m = scene.timeline_markers.new(name, frame=frame)
    m.camera = camob
    return m


bind(1, cam_o, "OPENER")
bind(F(S2), cam, "MAIN")
bind(F(T_CAM_DIVE), cam_e, "ENDING")
scene.camera = cam_o

# 9:16 mobile safe-frame guide (viewport only). Sits 1 m in front of the lens; driver keeps it
# matched to the animated focal length. Everything important should stay inside it.
half_w = 18.0 / 35.0
half_h = half_w * 9.0 / 16.0
half_wm = half_h * 9.0 / 16.0
bm = bmesh.new()
vs = [bm.verts.new(c) for c in ((-half_wm, -half_h, 0), (half_wm, -half_h, 0), (half_wm, half_h, 0), (-half_wm, half_h, 0))]
for a_, b_ in zip(vs, vs[1:] + vs[:1]):
    bm.edges.new((a_, b_))
g = _new_obj("GUIDE_Mobile_9x16", bm, None, CCam, (0, 0, -1.0), parent=cam)
g.hide_render = True
g.show_in_front = True
g.color = (1, 0, 1, 1)
for axis in (0, 1):
    fc = g.driver_add("scale", axis)
    drv = fc.driver
    drv.type = "SCRIPTED"
    var = drv.variables.new()
    var.name = "lens"
    var.type = "SINGLE_PROP"
    var.targets[0].id_type = "CAMERA"
    var.targets[0].id = cam_d
    var.targets[0].data_path = "lens"
    drv.expression = "35.0 / lens"

# ----------------------------------------------------------------------------------------------
# v06: tunnel bend on CHAR_ROOT X + PATH_CENTRE, then thin every dense curve to sparse Bezier keys
# ----------------------------------------------------------------------------------------------
def _fc(ob, path, idx):
    for fc in _fcurves_early(ob):
        if fc.data_path == path and fc.array_index == idx:
            return fc
    return None


NF = F(T_END)
_xfc = _fc(CHAR_ROOT, "location", 0)
_dod = [_xfc.evaluate(f) for f in range(1, NF + 1)]
key(PATH_CENTRE, "location", 0, 0.0, index=0, interp="LINEAR", frame=1)
_pfc = _fc(PATH_CENTRE, "location", 0)
for fc_, vals in ((_xfc, [_dod[f - 1] + xc_cl((f - 1) / FPS) for f in range(1, NF + 1)]),
                  (_pfc, [xc_cl((f - 1) / FPS) for f in range(1, NF + 1)])):
    fc_.keyframe_points.clear()
    fc_.keyframe_points.add(NF)
    for f, kp in zip(range(1, NF + 1), fc_.keyframe_points):
        kp.co = (f, vals[f - 1])
        kp.interpolation = "LINEAR"
    fc_.update()


def thin_fcurve(fc, tol_fn, pins=(), linear_after=(), step=0.5):
    """Refit fc with AUTO_CLAMPED Bezier keys on integer frames: greedy insertion at the worst error
    (sampled every half frame) until every sample is within tol_fn(frame) of the original."""
    kps = fc.keyframe_points
    if len(kps) < 8:
        return None
    if any(kp.interpolation == "CONSTANT" for kp in kps):
        return None
    f0, f1 = int(round(kps[0].co[0])), int(round(kps[-1].co[0]))
    samples = [f0 + i * step for i in range(int((f1 - f0) / step) + 1)]
    orig = [fc.evaluate(s) for s in samples]
    vals = {f: fc.evaluate(f) for f in range(f0, f1 + 1)}
    tols = [tol_fn(s) for s in samples]
    n_before = len(kps)
    keys = sorted({f0, f1} | {p for p in pins if f0 < p < f1} | {p + 1 for p in linear_after if f0 <= p < f1})

    def build():
        kps.clear()
        kps.add(len(keys))
        for kp, f in zip(kps, keys):
            kp.co = (f, vals[f])
            kp.interpolation = "LINEAR" if f in linear_after else "BEZIER"
            kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
        fc.update()

    worst = 0.0
    for _it in range(2000):
        build()
        worst, ws = 0.0, None
        for s, o, tl in zip(samples, orig, tols):
            e = abs(fc.evaluate(s) - o) / tl
            if e > worst:
                worst, ws = e, s
        if worst <= 1.0:
            break
        c = int(round(ws))
        ks = set(keys)
        cand = None
        for d in (0, 1, -1, 2, -2, 3, -3):
            if f0 <= c + d <= f1 and (c + d) not in ks:
                cand = c + d
                break
        if cand is None:            # all neighbours keyed already: accept this sample
            tols[samples.index(ws)] = 1e9
            continue
        keys.append(cand)
        keys.sort()
    return n_before, len(keys), round(worst, 3), ws


def _t(s):
    return (s - 1) / FPS


def tol_z(s):
    t = _t(s)
    if t < S3 + 1.5:
        return 0.01
    if t > T_SLOW - 0.5:
        return 0.02
    if BT_START - 0.2 < t < BT_END + 0.6:
        return 0.06
    return 0.25


PINS = [F(S2), F(S3), F(T_DROP) - 1, F(T_DROP), F(T_SLOW), F(T_PLUNGE), F(T_THUMP) - 1, F(T_THUMP)]
THIN_LOG = []
for idx, tol in ((2, tol_z), (1, lambda s: 0.02), (0, lambda s: 0.03)):
    r_ = thin_fcurve(_fc(CHAR_ROOT, "location", idx), tol, PINS, linear_after=(F(T_THUMP) - 1,))
    THIN_LOG.append(("CHAR_ROOT.location[%d]" % idx, r_))
THIN_LOG.append(("PATH_CENTRE.location[0]", thin_fcurve(_pfc, lambda s: 0.03)))
for ob in list(bpy.data.objects):
    if not (ob.name.startswith("MONO_hitA") or ob.name.startswith("FREEZE_Debris")) or not ob.animation_data:
        continue
    for fc_ in _fcurves_early(ob):
        if fc_.data_path in ("location", "rotation_euler") and len(fc_.keyframe_points) > 20:
            THIN_LOG.append(("%s.%s[%d]" % (ob.name, fc_.data_path, fc_.array_index),
                             thin_fcurve(fc_, (lambda s: 0.03) if fc_.data_path == "location" else (lambda s: 0.01))))
_tot0 = sum(r[1][0] for r in THIN_LOG if r[1])
_tot1 = sum(r[1][1] for r in THIN_LOG if r[1])
for nm, r_ in THIN_LOG[:4]:
    print("[blockout] thin %-28s %s" % (nm, r_))
print("[blockout] thinned %d curves: %d -> %d keys" % (len([r for r in THIN_LOG if r[1]]), _tot0, _tot1))

prefs_edit.keyframe_new_interpolation_type = _orig_interp

# ----------------------------------------------------------------------------------------------
# Display: Workbench, material colours, camera view in every 3D viewport
# ----------------------------------------------------------------------------------------------
sh = scene.display.shading
sh.light = "STUDIO"
sh.color_type = "MATERIAL"
sh.show_cavity = True
try:
    sh.cavity_type = "BOTH"
except Exception:
    pass
sh.show_object_outline = True
sh.background_type = "WORLD"
scene.display.render_aa = "8"
for scr in bpy.data.screens:
    for area in scr.areas:
        if area.type != "VIEW_3D":
            continue
        for space in area.spaces:
            if space.type != "VIEW_3D":
                continue
            space.shading.type = "SOLID"
            space.shading.color_type = "MATERIAL"
            space.shading.light = "STUDIO"
            space.shading.show_cavity = True
            space.shading.background_type = "WORLD"
            space.clip_end = 20000
            space.clip_start = 0.1
            if space.region_3d:
                space.region_3d.view_perspective = "CAMERA"

# metadata + notes inside the .blend
scene["Z_ROOF_m"] = Z_ROOF
scene["Z_CORE_m"] = Z_CORE
scene["fall_line_xy"] = (FALL_X, FALL_Y)
scene["shunts_s"] = (S1, S2, S3)
scene["bullet_time_s"] = (BT_START, BT_END)
scene["apex_slowmo_s"] = (AP_START, AP_SETTLE, AP_RELEASE, AP_END, AP_RATE)
scene["v06_slam"] = (T_PLUNGE, zc(T_PLUNGE) - Z_CORE, PLUNGE_V)
notes = bpy.data.texts.new("BLOCKOUT_NOTES")
notes.write(__doc__ or "")
notes.write("\nZ_ROOF = %.1f m, ground crust top = 0 m, core platform top = %.1f m\n" % (Z_ROOF, Z_CORE))
notes.write("Phase-2 monolith hits: %s\nPhase-3 hits: %s\n" % ([t for t, _ in PLAN_A], [t for t, _ in PLAN_B]))
notes.write("v06b shunts: %.2f open on his face (prep + camera back from %.2f) / %.2f jump + backflip (apex slow-mo %.2f-%.2f at %.2fx) / %.2f dive + camera twist. "
            "Bullet time %.2f-%.2f. Camera overtakes him %.2f, side view %.2f, plunge %.2f, impact %.0f m/s from %.1f m.\n"
            % (S1, T_MID, S2, AP_START, AP_END, AP_RATE, S3, BT_START, BT_END, T_SLOW + 0.35, T_SIDE, T_PLUNGE, PLUNGE_V,
               zc(T_PLUNGE) - Z_CORE))
notes.write("Cameras switch on markers: OPENER (frame 1) -> CAM_OPENER, MAIN (shunt 2) -> CAM_MAIN, ENDING -> CAM_ENDING.\n")
notes.write("Character: MESHY_Armature is parented to CHAR_PIVOT (movement/flips stay on CHAR_ROOT/CHAR_PIVOT); its limb poses are sparse quaternion keys in Action ACT_Meshy_Poses - edit them in the Dope Sheet/Pose Mode. Stand-in boxes: collection Character_StandIn (hidden in render). Meshy idle clip kept unused as MESHY_Idle_3_unused.\n")

scene.camera = cam_o
scene.frame_set(1)
blend_path = os.path.join(OUTDIR, BLEND_NAME)
bpy.ops.wm.save_as_mainfile(filepath=blend_path, relative_remap=True, compress=True)
# make sure the sound path is stored relative to the .blend
for s_ in bpy.data.sounds:
    if not s_.filepath.startswith("//"):
        s_.filepath = bpy.path.relpath(s_.filepath)
bpy.ops.wm.save_mainfile(filepath=blend_path, relative_remap=True, compress=True)
print("[blockout] saved", blend_path)
print("[blockout] sound paths:", [s_.filepath for s_ in bpy.data.sounds])

# ----------------------------------------------------------------------------------------------
# Optional preview stills
# ----------------------------------------------------------------------------------------------
if PREVIEW_DIR:
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    scene.render.resolution_x, scene.render.resolution_y = 640, 360
    scene.render.image_settings.file_format = "PNG"
    for t in PREVIEW_TIMES:
        scene.frame_set(F(t))
        scene.render.filepath = os.path.join(PREVIEW_DIR, "t%05.1f_f%04d.png" % (t, F(t)))
        bpy.ops.render.render(write_still=True)
        print("[blockout] preview", scene.render.filepath)
