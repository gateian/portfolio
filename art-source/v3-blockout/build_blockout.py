"""
build_blockout.py  -  Grey-box blockout generator for Ian Hamblin's v3 cinematic portfolio.

Run (Windows):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --python build_blockout.py -- D:\\projects\\portfolio-v3-blockout
Run (Linux/macOS):
  blender -b --python build_blockout.py -- /path/to/outdir

Optional extra args after the out dir:
  --render-previews <dir> "t1,t2,..."   render 640x360 Workbench stills at those times (seconds)

Inputs (looked up in OUTDIR first, then next to this script):
  cues.json                   music analysis (key cues, sections, obstacle hits). Edit it and re-run to retime.
  brain-implant-330416.mp3    the track (copied into OUTDIR if found next to the script)
Output:
  OUTDIR/blockout_v05.blend   (or --name <file>.blend)   (sound strip path is relative: //brain-implant-330416.mp3)

v05 (Oct 2026): new opening choreography on the three music "shunts" (cues.json -> "shunts"):
  shunt 1 = diving-board jump up/out + backflip + pirouette into a tuck (side-on camera, sun behind),
  shunt 2 = descent proper (still tucked), camera cuts to the bird's-eye follow,
  shunt 3 = snap open into the skydive spread + the fall speeds up (same hit as reentry_impact).
  Building is ~0.93 km roof-to-crust (was 1.65 km). Bullet time (cues.json -> "bullet_time") on the
  wind-down before the smash: world + character run on a remapped clock, the camera does not.
  Rotation lives on CHAR_PIVOT (rotation_mode ZXY: rz = twist/pirouette about the body axis,
  rx = pitch/flip, ry = roll onto the side); CHAR_ROOT only translates.

World scale: 1 Blender unit = 1 metre. Descent runs down -Z along the "fall line" X=0, Y=-8.
Targets Blender 5.2 (validated on 5.2.3 LTS); written to also work on 4.5 LTS.
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
BLEND_NAME = BLEND_NAME_ARG or "blockout_v05.blend"   # override with --name other.blend


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
S1 = _sh("shunt_1_jump", T_LEAP)          # jump up/out + backflip + pirouette into a tuck
S2 = _sh("shunt_2_descent", 7.80)         # descent proper (still tucked), camera -> bird's-eye
S3 = _sh("shunt_3_spread", T_REENTRY)     # spread into skydive, fall speeds up
T_LEAP = S1                               # everything that keyed off the old leap now follows shunt 1
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

HITS = CUES.get("obstacle_hit_candidates", DEFAULT_CUES["obstacle_hit_candidates"])
HITS_A = sorted(float(t) for t in HITS["phase2_fall"])
HITS_B = sorted(float(t) for t in HITS["phase3_mantle"])
# Hits before the groove re-entry happen during the leap/riser: they get markers only, no monoliths.
PHASE2_OBSTACLE_START = 9.9   # v05: kept at the v04 value (T_REENTRY - 0.2) so the obstacle plan is unchanged

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

# Downward speed profile (m/s, +ve = down). Positions are integrated from this table, so editing
# a cue time in cues.json retimes everything.
# v05: shunt 1 is a real ballistic jump (v0 up = JUMP_V0, g = 9.81 -> apex ~2.5 m after ~0.7 s),
# shunt 2 kicks the descent proper, shunt 3 the groove fall at GROOVE_V0..GROOVE_V1 (tuned for a
# ~0.93 km tall tower, v04 was 1.65 km at 110-125 m/s). These are NOMINAL speeds: inside the
# bullet-time window they are multiplied by the world-clock rate (see time_rate()).
# Phase 3 (mantle) onwards is unchanged from v04.
JUMP_V0, JUMP_VY, G = 7.0, 3.6, 9.81      # launch speed up (m/s), out over the chasm (m/s), gravity
GROOVE_V0, GROOVE_V1 = 75.0, 85.0         # fall speed just after shunt 3 / at the freeze
_v_s2 = -JUMP_V0 + G * (S2 - S1)          # still free-falling when shunt 2 hits (~16.5 m/s)
SPEED_PROFILE = [
    (0.0, 0.0), (S1, 0.0),
    (S1 + 0.001, -JUMP_V0),               # shunt 1: jump up and out (no bounce)
    (S2, _v_s2),                          # ballistic arc (linear speed = constant g)
    (S2 + 0.6, 55.0),                     # shunt 2: descent proper
    (T_PREHIT, 70.0),
    (T_PAUSE, 60.0),
    (T_PAUSE + 0.2, 22.0),                # breath in the near-silent pause
    (S3 - 0.05, 22.0),
    (S3 + 0.35, GROOVE_V0),               # shunt 3: spread + speed up
    (T_FREEZE, GROOVE_V1),
    (T_DROP, 190.0),                      # ground rushing up (nominal; bullet time slows it)
    (T_DROP + 0.6, 280.0),
    (T_SLOW - 0.8, 295.0),
    (T_SLOW - 0.2, 60.0),                 # brake...
    (T_SLOW, 4.0),                        # ...everything slows
    (T_THUMP - 0.25, 2.5),
    (T_THUMP, 30.0),                      # ...then slams down on the final thump
    (T_THUMP + 0.001, 0.0), (T_END + 1, 0.0),
]
_sp, _last = [], -1.0
for _t, _v in SPEED_PROFILE:                # drop any point that a retimed cue pushed out of order
    if _t > _last or (_t == _last == 0.0):
        _sp.append((_t, _v)); _last = _t
SPEED_PROFILE = _sp

# v05 bullet time: rate of the world clock vs real time. 1 = normal, 0.03 = ~33x slow motion.
# Everything except the camera reads time through this (character fall, debris, monoliths).
RATE_TABLE = [(BT_START, 1.0), (BT_SETTLE, BT_MIN), (BT_DEEP, BT_DEEP_RATE),
              (BT_END - 1.0 / 30, BT_MIN), (BT_END, 1.0)]


def time_rate(t):
    p = RATE_TABLE
    if t <= p[0][0] or t >= p[-1][0]:
        return 1.0
    for (t0, v0), (t1, v1) in zip(p, p[1:]):
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0) if t1 > t0 else 1.0
            if t0 == BT_START:                # ease-out into slow motion (fast at first, then settles)
                u = 1 - (1 - u) ** 2
            return v0 + (v1 - v0) * u
    return 1.0


def speed_at(t):
    p = SPEED_PROFILE
    if t <= p[0][0]:
        return p[0][1]
    for (t0, v0), (t1, v1) in zip(p, p[1:]):
        if t0 <= t <= t1:
            return v0 if t1 == t0 else v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    return p[-1][1]


_DT = 1.0 / 600.0
_DEPTH, _W = [0.0], [0.0]
for _i in range(int((T_END + 1) / _DT) + 2):
    _t = _i * _DT
    _r0, _r1 = time_rate(_t), time_rate(_t + _DT)
    _DEPTH.append(_DEPTH[-1] + 0.5 * (speed_at(_t) * _r0 + speed_at(_t + _DT) * _r1) * _DT)
    _W.append(_W[-1] + 0.5 * (_r0 + _r1) * _DT)


def _interp(tab, t):
    i = max(0.0, t) / _DT
    i0 = int(i)
    f = i - i0
    return tab[i0] * (1 - f) + tab[i0 + 1] * f


def depth(t):
    return _interp(_DEPTH, t)


def world_t(t):
    """bullet-time world clock: equals t before the freeze, lags behind it after"""
    return _interp(_W, t)


def real_t(w):
    """inverse of world_t (first real time at which the world clock reaches w)"""
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


Z_ROOF = depth(T_DROP)            # ground crust top is Z = 0 and the character hits it on the drop
Z_CORE = Z_ROOF - depth(T_THUMP)  # platform top


def zc(t):
    """character root height at time t"""
    return Z_ROOF - depth(t)


Y_START = EDGE_Y + 0.6
Y_S2 = Y_START - JUMP_VY * (S2 - S1)
T_ON_LINE = S2 + 1.2                  # back over the fall line


def yc(t):
    """character root Y (approximation of the keys, used for the camera + guide)"""
    if t <= S1:
        return Y_START
    if t <= S2:
        return Y_START - JUMP_VY * (t - S1)
    if t >= T_ON_LINE:
        return FALL_Y
    u = (t - S2) / (T_ON_LINE - S2)
    return Y_S2 + (FALL_Y - Y_S2) * (3 * u * u - 2 * u * u * u)


print("[blockout] Z_ROOF=%.1f m  Z_CORE=%.1f m  total descent %.1f m" % (Z_ROOF, Z_CORE, Z_ROOF - Z_CORE))
print("[blockout] v05 shunts %.2f / %.2f / %.2f  bullet time %.2f-%.2f (world clock lags %.2f s at the drop, "
      "height at BT_SETTLE %.1f m)" % (S1, S2, S3, BT_START, BT_END, BT_END - world_t(BT_END), zc(BT_SETTLE)))


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
for name in ("01_Rooftop", "02_Fall_Monoliths", "03_Breakthrough_Mantle", "04_Core",
             "Character", "Cameras", "FX_Placeholders"):
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
M_CHAR = mat("M_Char_Body", (0.86, 0.87, 0.90), metal=0.5, rough=0.3)
M_CHAR_DK = mat("M_Char_Joint", (0.08, 0.08, 0.09))
M_VISOR = mat("M_Char_Visor", (0.20, 0.90, 1.00), emit=4.0)
# FX
M_FLASH = mat("M_FX_Flash", (1.0, 0.98, 0.92), emit=30.0)
M_FIRE = mat("M_FX_Fireball", (1.0, 0.45, 0.08), emit=10.0)
M_SHOCK = mat("M_FX_Shockwave", (0.60, 1.00, 1.00), emit=10.0)
M_GUIDE = mat("M_Guide", (1.0, 0.0, 1.0))


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
    "opening_impact": "OPENING_BOOM", "intro_impact_2": "LEAP", "riser_start": "RISER",
    "pre_pause_hit": "HIT_PRE_PAUSE", "pause_start": "HANG_PAUSE", "reentry_impact": "REENTRY_FALL",
    "freeze_start": "FREEZE", "freeze_lowest_filter": "FREEZE_LOW", "drop": "DROP_SMASH",
    "biggest_accent_in_drop": "SETPIECE_%.1f" % T_SETPIECE, "final_slowdown_start": "SLOWMO_SWOOP",
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


for _nm, _t in (("SHUNT1_JUMP", S1), ("BACKFLIP", S1 + 0.15), ("APEX", S1 + JUMP_V0 / G),
                ("PIROUETTE", S1 + 1.0), ("TUCK", S1 + 1.75), ("SHUNT2_DESCENT_CAMCUT", S2),
                ("SHUNT3_SPREAD", S3), ("BULLET_IN", BT_START), ("CURL_SIDEWAYS", BT_CURL0),
                ("CAM_PUSH_IN", BT_SETTLE), ("BALL_SIDEWAYS", BT_CURL1), ("BULLET_DEEPEST", BT_DEEP),
                ("BULLET_OUT_SMASH", BT_END)):
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
for t, col in ((0, (0.55, 0.47, 0.42)), (S2 + 0.6, (0.30, 0.30, 0.33)), (T_FREEZE, (0.12, 0.12, 0.14)),
               (T_DROP, (0.30, 0.06, 0.02)), (T_SLOW, (0.20, 0.05, 0.02)), (T_THUMP, (0.02, 0.08, 0.10))):
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
# Opposite tower B (taller, silhouette against the sunset) and the two side walls of the chasm
tower_stack("TWR_B", -40, 40, CHASM_FAR_Y - 25, CHASM_FAR_Y, Z_ROOF - 70, "y", 1, C1)
tower_stack("WALL_L", -CHASM_HALF_X - 25, -CHASM_HALF_X, CHASM_FAR_Y, EDGE_Y + 10, Z_ROOF - 20, "x", 1, C1)
tower_stack("WALL_R", CHASM_HALF_X, CHASM_HALF_X + 25, CHASM_FAR_Y, EDGE_Y + 10, Z_ROOF - 30, "x", -1, C1)
# Distant skyline towers
for i in range(14):
    a = rng.uniform(0, 2 * math.pi)
    r = rng.uniform(140, 320)
    w = rng.uniform(25, 50)
    h = Z_ROOF * rng.uniform(0.5, 1.1)
    box_minmax("SKYLINE_%02d" % i, (r * math.cos(a) - w / 2, r * math.sin(a) - w / 2, 0),
               (r * math.cos(a) + w / 2, r * math.sin(a) + w / 2, h), M_CONC_HI, C1)
# Sky bridges across the chasm, well clear of the fall line (y = -30)
for i, fz in enumerate((0.9, 0.78, 0.66, 0.55, 0.44, 0.33, 0.22, 0.11)):
    bz = Z_ROOF * fz
    box_minmax("BRIDGE_%d" % i, (-CHASM_HALF_X, -34, bz), (CHASM_HALF_X, -26, bz + 4), M_CONC_DK, C1)

# v04: floating dust/debris streaks in the chasm (static; they whip past the camera at 110+ m/s).
# Kept >= 6 m off the fall line so nothing hits the lens or hides the character.
dust = []
for i in range(int(Z_ROOF / 2.5)):
    while True:
        x, y = rng.uniform(-CHASM_HALF_X + 2, CHASM_HALF_X - 2), rng.uniform(CHASM_FAR_Y + 2, EDGE_Y - 1)
        if math.hypot(x - FALL_X, y - FALL_Y) > 6.5:
            break
    zz = rng.uniform(20, Z_ROOF - 40)
    sz, ln = rng.uniform(0.15, 0.4), rng.uniform(1.5, 5.0)
    dust.append(((x - sz, y - sz, zz), (x + sz, y + sz, zz + ln)))
batch_boxes("SPEED_Chasm_DustStreaks", dust, M_DUST, C1)

# v05: placeholder sun low on the horizon behind him in the side-on opener (camera looks +X),
# plus a far ground ring so a horizon line reads (the crust area |x|,|y| < 400 is left open).
M_SUN = mat("M_Sky_SunDisc", (1.0, 0.62, 0.28), emit=8.0)
SUN_POS = Vector((4200.0, -900.0, Z_ROOF + 160.0))
sund = sphere("SKY_SunDisc", 260.0, SUN_POS[:], M_SUN, C1, segs=32, rings=16)
M_FARGROUND = mat("M_Far_Ground", (0.33, 0.25, 0.22))
for _i, (_mn, _mx) in enumerate((((-20000, -20000), (-400, 20000)), ((400, -20000), (20000, 20000)),
                                  ((-400, -20000), (400, -400)), ((-400, 400), (400, 20000)))):
    box_minmax("SKY_FarGround_%d" % _i, (_mn[0], _mn[1], -12.0), (_mx[0], _mx[1], -10.0), M_FARGROUND, C1)

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
P["torso"].location = (0, 0, -0.10)
box("CHAR_pelvis", (0.34, 0.2, 0.16), (0, 0, 0.0), M_CHAR_DK, CC, parent=P["torso"])
P["head"] = box("CHAR_head", (0.2, 0.24, 0.26), (0, 0, 0.72), M_CHAR, CC, parent=P["torso"])
for v in P["head"].data.vertices:
    v.co.z += 0.13
box("CHAR_visor", (0.16, 0.04, 0.07), (0, -0.12, 0.16), M_VISOR, CC, parent=P["head"])
for side, sx in (("L", 1), ("R", -1)):
    ua = box("CHAR_arm_upper_" + side, (0.1, 0.1, 0.3), (sx * 0.25, 0, 0.62), M_CHAR, CC, parent=P["torso"], origin_top=True)
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
    "PRELAND": {"torso": (10, 0, 0), "head": (-10, 0, 0), "arm_upper_L": (-30, -60, 0), "arm_upper_R": (-30, 60, 0),
                "leg_upper_L": (-45, 0, 0), "leg_upper_R": (-20, 0, 0), "leg_lower_L": (50, 0, 0), "leg_lower_R": (50, 0, 0)},
    "LAND_KNEEL": {"torso": (50, 0, 0), "head": (-40, 0, 0), "arm_upper_R": (-50, 5, 0), "arm_lower_R": (-10, 0, 0),
                   "arm_upper_L": (60, -45, 0), "arm_lower_L": (-20, 0, 0), "leg_upper_L": (-90, 0, 0),
                   "leg_lower_L": (90, 0, 0), "leg_upper_R": (15, 0, 0), "leg_lower_R": (85, 0, 0)},
    "KNEEL_IDLE": {"torso": (25, 0, 0), "head": (35, 0, 0), "arm_upper_R": (-15, 5, 0), "arm_lower_R": (-40, 0, 0),
                   "arm_upper_L": (-20, -5, 0), "arm_lower_L": (-60, 0, 0), "leg_upper_L": (-90, 0, 0),
                   "leg_lower_L": (90, 0, 0), "leg_upper_R": (15, 0, 0), "leg_lower_R": (85, 0, 0)},
}
PIVOT_Z = {"STAND": PIVOT_STAND_Z, "CROUCH": 0.62, "LAND_KNEEL": 0.5, "KNEEL_IDLE": 0.5}


def key_pose(t, pose):
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


# -- root travel: Z sampled from the integrated speed profile (linear keys = exact speeds)
sample_ts = set(round(k * 0.2, 3) for k in range(int(T_END / 0.2) + 1))
for _t, _v in SPEED_PROFILE:
    if 0 <= _t <= T_END:
        sample_ts.add(round(_t, 3))
sample_ts |= {T_THUMP - 0.1, T_THUMP - 0.05}
# v05: every frame through the jump arc and through bullet time (curved / remapped motion)
for _a, _b in ((S1 - 0.1, S2 + 0.7), (BT_START - 0.1, BT_END + 0.7)):
    sample_ts |= {round(_a + k / FPS, 4) for k in range(int((_b - _a) * FPS) + 1)}
last_f = None
for t in sorted(sample_ts):
    f = F(t)
    if f == last_f:
        continue
    last_f = f
    key(CHAR_ROOT, "location", t, zc((f - 1) / FPS), index=2, interp="LINEAR", frame=f)

# -- root Y: v05 jump arc - constant speed out over the chasm until shunt 2, then ease onto the fall line
key(CHAR_ROOT, "location", 0, Y_START, index=1)
key(CHAR_ROOT, "location", S1, Y_START, index=1, interp="LINEAR")
key(CHAR_ROOT, "location", S2, Y_S2, index=1)
key(CHAR_ROOT, "location", T_ON_LINE, FALL_Y, index=1)


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

# -- body orientation & poses
# v05: all rotation on CHAR_PIVOT (ZXY): rx = pitch (+90 = belly-down skydive, backflip = negative),
# rz = twist about the body axis (pirouette), ry = roll onto the side. CHAR_ROOT only translates.
# The backflip + slow backwards tumble add -720 deg of pitch by shunt 3, so every later rx key is
# offset by RX_OFF (same orientation as v04, no unwinding spin).
RX_OFF = -720
key_pivot_rot(0, rx=0, ry=0, rz=0)
for k, t in enumerate([x * 1.2 for x in range(1, 4)]):          # rooftop sway in the wind
    key_pivot_rot(t, ry=(2.5 if k % 2 == 0 else -2.5))
key_pivot_rot(S1 - 1.2, ry=0)
key_pose(0, "STAND")
key_pose(S1 - 1.2, "STAND")
key_pose(S1 - 0.15, "CROUCH")                                       # one quick dip, no board bounce
key_pivot_rot(S1 - 0.15, rx=0)
key_pose(S1 + 0.12, "LEAP")                                         # shunt 1: arms up, launch
key(CHAR_PIVOT, "location", S1 + 0.12, PIVOT_STAND_Z, index=2)
key_pivot_rot(S1 + 0.15, rx=-15)
key_pose(S1 + 0.45, "SPREAD")                                       # open layout backflip...
key_pivot_rot(S1 + 1.15, rx=-360)                                   # ...over the top of the arc
key_pose(S1 + 0.95, "DIVE")                                         # pencil for the pirouette
key_pivot_rot(S1 + 0.92, rz=0, interp="CONSTANT")
key_pivot_rot(S1 + 0.95, rz=-360)                                   # (-360 == 0: no visible jump)
key_pivot_rot(S1 + 1.65, rz=0)                                      # pirouette, one full twist
key_pose(S1 + 1.75, "TUCK")                                         # ...into a ball
key_pivot_rot(S1 + 1.75, rx=-385)
key_pose(S2, "TUCK")                                                # shunt 2: descent proper, still tucked
key_pivot_rot(S2, rx=-410)
key_pose(S3 - 0.1, "TUCK")
key_pivot_rot(S3 - 0.12, rx=-590)                                   # slow backwards tumble in the ball
key_pose(S3 + 0.12, "SPREAD")                                       # shunt 3: snap open
key_pivot_rot(S3 + 0.15, rx=90 + RX_OFF)                            # belly-down
key_pose(S3 + 0.6, "SKYDIVE")
key_pivot_rot(S3 + 0.6, rx=90 + RX_OFF)
key_pivot_rot(BT_START, rx=90 + RX_OFF)
key_pose(BT_START, "SKYDIVE")
# bullet time: curl into a ball on his side to the ground (keyed in real time = seen in slow motion)
key_pivot_rot(BT_CURL0, rx=90 + RX_OFF, ry=0)
key_pose(BT_CURL0, "SKYDIVE")
key_pose(BT_CURL1, "TUCK")
key_pivot_rot(BT_CURL1, rx=95 + RX_OFF, ry=-90)
key_pose(BT_END, "TUCK")
key_pivot_rot(BT_END, rx=105 + RX_OFF, ry=-102)                     # slow drift of the ball
key(CHAR_PIVOT, "location", BT_END, PIVOT_Z["CROUCH"], index=2)
key_pivot_rot(T_DROP + 0.9, rx=105 + 300 + RX_OFF, interp="LINEAR")  # tumble through the crust
key_pose(T_DROP + 1.0, "TUCK")
key_pivot_rot(T_DROP + 1.4, rx=150 + 360 + RX_OFF, ry=0)
key_pose(T_DROP + 1.5, "DIVE")
key_pivot_rot(T_SLOW, rx=150 + 360 + RX_OFF)
key_pose(T_SLOW, "DIVE")
key_pose(T_SLOW + 0.9, "SPREAD")                                    # slow-mo flip to feet-first
key_pivot_rot(T_SLOW + 1.9, rx=360 + RX_OFF)
key_pose(T_THUMP - 0.3, "PRELAND")
key_pivot_rot(T_THUMP - 0.3, rx=360 + RX_OFF)
key_pose(T_THUMP, "LAND_KNEEL")                                     # superhero landing
key_pivot_rot(T_THUMP, rx=360 + RX_OFF)
key_pose(T_THUMP + 1.2, "LAND_KNEEL")
key_pose(T_TAIL, "KNEEL_IDLE")
key_pose(T_END, "KNEEL_IDLE")

# ----------------------------------------------------------------------------------------------
# 02 Fall monoliths (one per groove hit, crossing the fall line at the character's height)
# ----------------------------------------------------------------------------------------------
C2 = COLL["02_Fall_Monoliths"]
MONO_GAP = 0.65
for i, (t, s) in enumerate(PLAN_A):
    idx = HITS_A.index(t) + 1
    sc = rng.uniform(0.85, 1.3)
    w, d, h = 2.4 * sc, 1.2 * sc, 10.0 * sc
    cx = FALL_X + s * (MONO_GAP + w / 2)   # v05: MONO_GAP 0.4 -> 0.65 (camera passed 0.39 m from hitA_17)
    ob = box("MONO_hitA_%02d_t%.2f" % (idx, t), (w, d, h), (cx, FALL_Y, zc(t)), M_MONO, C2)
    box("MONO_hitA_%02d_glyph" % idx, (w * 0.3, d * 1.05, h * 0.6), (0, 0, 0), M_MONO_EDGE, C2, parent=ob)
    tilt = math.radians(rng.uniform(-18, 18))
    spin = math.radians(rng.choice((-1, 1)) * rng.uniform(15, 40))
    vy = rng.choice((-1, 1)) * rng.uniform(2.0, 4.0)
    # v05: world motion runs on the bullet-time clock (dt = world-clock offset from the hit)
    t_hi = real_t(t + 4.0)
    if t_hi <= BT_START:
        ts = [t - 4.0, t + 4.0]
    else:
        ts = [t - 4.0] + [BT_START + k / FPS for k in range(int((min(t_hi, T_END) - BT_START) * FPS) + 1)]
        ts = [x for x in ts if x >= t - 4.0]
    for tr in ts:
        dt = world_t(tr) - t
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
    box_minmax("CRUST_Slab_%d_%d" % (mn[0], mn[1]), mn, mx, M_CRUST, C3)
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
                 (cx, cy, -CT / 2 + dz), M_CRUST, C3)
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
shaft = cylinder("MANTLE_Shaft", SHAFT_R, shaft_top - shaft_bot, (FALL_X, FALL_Y, (shaft_top + shaft_bot) / 2),
                 M_MANTLE, C3, segs=40, caps=False)
z = shaft_top - 60
k = 0
while z > shaft_bot + 20:   # glowing magma veins: speed reference rings
    torus("MANTLE_LavaRing_%02d" % k, SHAFT_R - 0.5, 1.4, (FALL_X, FALL_Y, z), M_LAVA, C3, segs=40, ring_segs=6)
    z -= rng.uniform(35, 70)          # v04: denser at ~285 m/s (~5 rings / s)
    k += 1
for i in range(int((shaft_top - shaft_bot) / 18)):        # rocks embedded in the shaft walls
    a = rng.uniform(0, 2 * math.pi)
    rr = rng.uniform(2.5, 7.0)
    zz = rng.uniform(shaft_bot, shaft_top - 20)
    rock("MANTLE_WallRock_%02d" % i, rr, (FALL_X + (SHAFT_R - rr * 0.4) * math.cos(a), FALL_Y + (SHAFT_R - rr * 0.4) * math.sin(a), zz),
         M_ROCK, C3, squash=(1, 1, rng.uniform(1.0, 2.2)))

# v04: glowing ember streaks through the shaft (static, one mesh), kept >= 7 m off the fall line
emb = []
for i in range(int((shaft_top - shaft_bot) / 4)):
    a, r = rng.uniform(0, 2 * math.pi), rng.uniform(7.5, SHAFT_R - 2)
    x, y, zz = FALL_X + r * math.cos(a), FALL_Y + r * math.sin(a), rng.uniform(shaft_bot + 40, shaft_top - 20)
    sz, ln = rng.uniform(0.15, 0.35), rng.uniform(3, 9)
    emb.append(((x - sz, y - sz, zz), (x + sz, y + sz, zz + ln)))
batch_boxes("SPEED_Mantle_EmberStreaks", emb, M_LAVA, C3)

# flying rocks / cliff sides on the mantle hits
SETPIECE_BOULDER_X = 16.5        # v05: was 15.5 - the boulder passed ~1.8 m from the camera
for i, (t, s) in enumerate(PLAN_B):
    idx = HITS_B.index(t) + 1
    zt = zc(t)
    if abs(t - T_SETPIECE) < 0.01:      # ---- SET PIECE: giant boulder + opposing cliff, thread the gap
        big = rock("SETPIECE_%.1f_Boulder" % t, 14.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y, zt), M_SETPIECE, C3, subdiv=2, jitter=0.12)
        key(big, "location", t - 3.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y + 6, zt + 40), interp="LINEAR")
        key(big, "location", t + 3.0, (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y - 6, zt - 40), interp="LINEAR")
        key(big, "rotation_euler", t - 3.0, (0, 0, 0), interp="LINEAR")
        key(big, "rotation_euler", t + 3.0, (math.radians(60), math.radians(25), 0), interp="LINEAR")
        big.location = (FALL_X + s * SETPIECE_BOULDER_X, FALL_Y, zt)
        cl = box_minmax("SETPIECE_%.1f_Cliff" % t, (min(-s * SHAFT_R, -s * 5.8), FALL_Y - 12, zt - 9),
                        (max(-s * SHAFT_R, -s * 5.8), FALL_Y + 12, zt + 9), M_CLIFF, C3)
        point_light("SETPIECE_Glow", (FALL_X, FALL_Y, zt - 20), (1.0, 0.4, 0.1), 200000, C3, radius=5)
        continue
    if i % 3 == 2:                       # cliff side jutting out of the wall
        h = rng.uniform(10, 16)
        cl = box_minmax("CLIFF_hitB_%02d_t%.2f" % (idx, t), (min(s * SHAFT_R, s * 1.0), FALL_Y - 10, zt - h / 2),
                        (max(s * SHAFT_R, s * 1.0), FALL_Y + 10, zt + h / 2), M_CLIFF, C3)
        cl["cue_time"] = t
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

# slow-motion debris that travels with the character then hangs in the air
for i in range(10):
    a = 2 * math.pi * i / 10 + rng.uniform(-0.2, 0.2)
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
key(shock, "scale", T_THUMP + 0.9, (30.0, 30.0, 12.0))
key(shock, "scale", T_THUMP + 1.0, (0.001, 0.001, 0.001))
lflash = cylinder("FX_Land_Flash", 1.0, 0.06, (FALL_X, FALL_Y, Z_CORE + 0.05), M_SHOCK, CF, segs=32)
key_scale(lflash, 0, 0.001, frame=F(T_THUMP) - 1, interp="CONSTANT")
key(lflash, "scale", 0, (3.0, 3.0, 1.0), frame=F(T_THUMP))
key(lflash, "scale", 0, (5.0, 5.0, 1.0), frame=F(T_THUMP) + 4)
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

leapdust = torus("FX_Leap_Dust", 1.0, 0.15, (0, EDGE_Y + 0.6, Z_ROOF + 0.1), M_CONC_HI, CF)
key_scale(leapdust, 0, 0.001, frame=F(T_LEAP) - 1, interp="CONSTANT")
key_scale(leapdust, T_LEAP, 0.3)
key_scale(leapdust, T_LEAP + 0.6, 1.1)   # v05: smaller (side-on camera is close)
key_scale(leapdust, T_LEAP + 0.7, 0.001)

# Guide curve showing the full descent (viewport only, hidden by default)
cd = bpy.data.curves.new("GUIDE_Descent_Path", "CURVE")
cd.dimensions = "3D"
sp = cd.splines.new("POLY")
pts = [i * 0.25 for i in range(int(T_END / 0.25) + 1)]
sp.points.add(len(pts) - 1)
for p, t in zip(sp.points, pts):
    yy = yc(t)
    p.co = (FALL_X, yy, zc(t), 1.0)
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
# v03: during the fall the camera goes near top-down bird's-eye (80-88 deg down pitch), high above
# him on the -X/+Y diagonal (45 deg yaw to the tower/chasm faces) so he reads small in the
# upper-middle of frame and the shaft converges far below with obstacles rising toward him.
def BIRD(height, h_off, pitch, depth=28.0):
    """camera `height` m above him, `h_off` m back along the -X/+Y diagonal; view axis `pitch` deg down."""
    a = h_off / math.sqrt(2)
    dz = height + depth
    hx = dz / math.tan(math.radians(pitch))           # horizontal run of the view axis to the look point
    b = (hx - h_off) / math.sqrt(2)
    return (-a, a, height), (b, -b, -depth)
FALL_OFF, FALL_LOOK = BIRD(12.0, 2.7, 85)          # ~85 deg down, he sits ~8 deg above centre
# v05 side-on opener: camera ~8 m off his left side at -X looking +X (tower screen-left, the jump
# goes screen-right, horizon + sun behind him). From shunt 1 to shunt 2 it is world-anchored and only
# partly follows the arc (CAM_SIDE_FOLLOW_Y/Z), so the dive reads as an arc; at shunt 2 it cuts
# (CAM_S2_BLEND = 0) or whips (e.g. 0.35 s) into the v04 bird's-eye follow.
CAM_SIDE_X, CAM_SIDE_DY, CAM_SIDE_DZ = -8.0, -2.4, 1.6
CAM_SIDE_FOLLOW_Y, CAM_SIDE_FOLLOW_Z = 0.55, 0.9
CAM_SIDE_LOOK = (0.0, -0.5, 0.5)
CAM_S2_BLEND = 0.0
SIDE_OFF = (CAM_SIDE_X, CAM_SIDE_DY, CAM_SIDE_DZ)
CAM_KEYS = [
    (0.0, (-4.5, -3.0, 6.0), (0.6, -0.8, -3.6), 22, 3),   # out over the void: he stands on the lip, facade drops away below
    (3.0, (-5.0, -0.5, 5.0), (0.9, -1.2, -2.5), 24, 0),   # orbit round his side
    (S1 - 0.45, SIDE_OFF, CAM_SIDE_LOOK, 28, 0),          # v05: settle side-on before the jump
    (S2, FALL_OFF, FALL_LOOK, 24, 4),                     # v05: shunt 2 -> bird's-eye
    (T_PAUSE, FALL_OFF, FALL_LOOK, 24, 6),
    (T_PAUSE + 0.3, *BIRD(8.5, 2.0, 83), 24, 3),            # hang-time push-in
    (S3 + 0.1, FALL_OFF, FALL_LOOK, 24, -4),
    (15.0, FALL_OFF, FALL_LOOK, 24, 5),
    (BT_START, FALL_OFF, FALL_LOOK, 24, -3),
    # v05 bullet time: the camera runs in real time and pushes right in on the slowed-down world
    (BT_SETTLE, (-2.4, 2.4, 4.2), (0.0, 0.0, -0.8), 28, 0),
    (BT_CURL1, (-3.2, 2.4, 2.0), (0.0, -0.1, 0.75), 38, 3),
    (BT_END - 0.25, (-2.45, 1.85, 1.5), (0.3, -0.35, 0.95), 48, 6),
    (BT_END - 1.0 / FPS, (-2.35, 1.78, 1.45), (0.35, -0.4, 1.0), 50, 6),
    (T_DROP, *BIRD(14.0, 2.4, 88), 22, 0),                # snap back out on the smash (white flash frame)
    (T_DROP + 1.2, FALL_OFF, FALL_LOOK, 24, -5),
    (T_SETPIECE - 0.4, *BIRD(8.5, 2.4, 82), 22, 4),       # set piece: a touch closer, wider lens
    (T_SETPIECE + 0.6, *BIRD(8.5, 2.4, 82), 22, -3),
    (T_SETPIECE + 2.0, FALL_OFF, FALL_LOOK, 24, 3),
    (33.0, FALL_OFF, FALL_LOOK, 24, -4),
    (38.0, FALL_OFF, FALL_LOOK, 24, 4),
    (T_SLOW, FALL_OFF, FALL_LOOK, 24, 0),                     # SWOOP starts: everything slows except camera
    (T_SLOW + 0.9, (3.0, 6.0, 6.0), (0, 0, -1), 35, 0),
    (T_SLOW_LOW, (10, 2.5, 2.5), (0, 0, 0.3), 35, 0),
    (T_THUMP, (11, 0, 1.3), (0, 0, 0.8), 35, 0),              # side view for the landing
    (T_TAIL, (6, 4, 1.8), (0, -2, 1.2), 32, 0),               # drift round behind him...
    (T_END, (1.0, 4.5, 2.4), (0, -2.5, 1.3), 30, 0),          # ...settle over-shoulder on the data monolith
]
CONST_BEFORE = {F(BT_END - 1.0 / FPS)}                        # hold, then snap on the smash frame
for t, off, look, lens, roll in CAM_KEYS:
    ip = "CONSTANT" if F(t) in CONST_BEFORE else "BEZIER"
    key(aim, "location", t, off, interp=ip)
    key(target, "location", t, look, interp=ip)
    key(cam, "rotation_euler", t, math.radians(roll), index=2, interp=ip)
    cam_d.lens = lens
    prefs_edit.keyframe_new_interpolation_type = ip
    cam_d.keyframe_insert("lens", frame=F(t))

# v05 side-on jump: world-anchored camera sampled every 2 frames between shunt 1 and shunt 2
_f_end = F(S2) - 1 if CAM_S2_BLEND <= 0 else F(S2 - CAM_S2_BLEND)
_side = list(range(F(S1), _f_end, 2)) + [_f_end]
for f in _side:
    tr = (f - 1) / FPS
    rig_w = Vector((0.0, yc(tr), zc(tr)))
    cam_w = Vector((CAM_SIDE_X, Y_START + CAM_SIDE_DY + CAM_SIDE_FOLLOW_Y * (yc(tr) - Y_START),
                    Z_ROOF + CAM_SIDE_DZ + CAM_SIDE_FOLLOW_Z * (zc(tr) - Z_ROOF)))
    ip = "CONSTANT" if (f == _f_end and CAM_S2_BLEND <= 0) else "BEZIER"
    key(aim, "location", 0, (cam_w - rig_w)[:], interp=ip, frame=f)
    key(target, "location", 0, CAM_SIDE_LOOK, interp=ip, frame=f)
    key(cam, "rotation_euler", 0, 0.0, index=2, interp=ip, frame=f)
    cam_d.lens = 28
    prefs_edit.keyframe_new_interpolation_type = ip
    cam_d.keyframe_insert("lens", frame=f)
for _ob, _path in ((aim, "location"), (target, "location")):     # linear between the dense samples
    for fc in (_ob.animation_data.action and _fcurves_early(_ob)) or []:
        for kp in fc.keyframe_points:
            if F(S1) < kp.co[0] < _f_end:
                kp.interpolation = "LINEAR"

# shake hints: smash (strong), set piece (medium), landing (small)
for t0, amp, dur in ((T_DROP, 0.6, 0.8), (T_SETPIECE, 0.35, 0.5), (T_THUMP, 0.25, 0.5)):
    key(shake, "location", t0 - 0.1, (0, 0, 0), interp="LINEAR")
    n = int(dur * FPS / 2)
    for k in range(1, n + 1):
        a = amp * (1 - k / (n + 1))
        key(shake, "location", 0, (rng.uniform(-a, a), rng.uniform(-a, a), rng.uniform(-a, a)), interp="LINEAR",
            frame=F(t0) + 2 * (k - 1))
    key(shake, "location", t0 + dur + 0.1, (0, 0, 0), interp="LINEAR")

# v04: speed buffet - continuous high-frequency noise on CAM_SHAKE during the fall, stronger in the
# mantle (restricted F-curve Noise modifiers, blended in/out, so opener/ending stay steady)
def _fcurves(ob):
    act = ob.animation_data.action
    try:
        from bpy_extras import anim_utils
        cb = anim_utils.action_get_channelbag_for_slot(act, ob.animation_data.action_slot)
        if cb is not None:
            return cb.fcurves
    except Exception:
        pass
    return act.fcurves
for fc in _fcurves(shake):
    if fc.data_path != "location":
        continue
    for (t0, t1, strength) in ((S3 + 0.3, BT_START, 0.10), (T_DROP + 0.8, T_SLOW - 0.5, 0.18)):
        m = fc.modifiers.new("NOISE")
        m.scale, m.strength, m.phase = 2.5, strength, rng.uniform(0, 100) + fc.array_index * 37
        m.use_restricted_range = True
        m.frame_start, m.frame_end = F(t0), F(t1)
        m.blend_in = m.blend_out = 12

# v04: FOV punch - lens briefly widens as the speed kicks in (re-entry, smash) then settles back
for t0, base, wide in ((S3 + 0.35, 24, 19), (T_DROP + 0.6, 24, 18)):
    for dt, mm in ((-0.25, base), (0.0, wide), (0.9, base)):
        cam_d.lens = mm
        cam_d.keyframe_insert("lens", frame=F(t0 + dt))

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
notes = bpy.data.texts.new("BLOCKOUT_NOTES")
notes.write(__doc__ or "")
notes.write("\nZ_ROOF = %.1f m, ground crust top = 0 m, core platform top = %.1f m\n" % (Z_ROOF, Z_CORE))
notes.write("Phase-2 monolith hits: %s\nPhase-3 hits: %s\n" % ([t for t, _ in PLAN_A], [t for t, _ in PLAN_B]))
notes.write("v05 shunts: %.2f jump / %.2f descent + camera cut / %.2f spread. Bullet time %.2f-%.2f (world clock lags %.2f s).\n"
            % (S1, S2, S3, BT_START, BT_END, BT_END - world_t(BT_END)))
notes.write("Swap character: parent your armature to CHAR_ROOT (keep its origin at the feet), delete CHAR_PIVOT and its children.\n")

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
