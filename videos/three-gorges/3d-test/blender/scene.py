"""Three Gorges opening shot in Blender (Cycles), the same scene and camera as ../opening.html.

Run:  python scene.py <out_dir> [frame ...]
      (needs the `bpy` module: `uv pip install bpy`, Python 3.13)
No frames given → renders the whole shot as PNGs (out_dir/f0001.png …). Captions are added later by overlay.html.
Coordinates: written in the three.js frame (x right, y up, z toward the camera) and converted with B().
"""
import math, sys, random
import bpy
from mathutils import Vector

OUT = sys.argv[1]
ONLY = [int(a) for a in sys.argv[2:]]
FPS, END = 30, 4.6
PRE = 40    # particle pre-roll: the shot starts on scene frame PRE + 1, so the jets are already flowing
NF = round(END * FPS)
RES = (1080, 1920)

def B(x, y, z):  # three.js (y up, z toward viewer) → Blender (z up)
    return Vector((x, -z, y))

clamp = lambda x, a, b: max(a, min(b, x))
def sm(a, b, x):
    x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
lerp = lambda a, b, k: a + (b - a) * k
def ease(k): return 4 * k ** 3 if k < .5 else 1 - (-2 * k + 2) ** 3 / 2
def hsh(x, y):
    s = math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - math.floor(s)
def vnoise(x, y):
    xi, yi = math.floor(x), math.floor(y); xf, yf = x - xi, y - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    return lerp(lerp(hsh(xi, yi), hsh(xi + 1, yi), u), lerp(hsh(xi, yi + 1), hsh(xi + 1, yi + 1), u), v)
def fbm(x, y):
    s, a, f = 0, .5, 1
    for _ in range(5): s += a * vnoise(x * f, y * f); a *= .5; f *= 2.03
    return s

CREST, LAKE, RIVER, BED, DAM_X = 21, 18.6, 1.5, -3, 82
faceZ = lambda y: 2 + (16 - y) * 22 / 19
def half_width(z): return 50 + min(-z, 400) * 0.75 if z < 0 else 50 + z * 0.22
def ground(x, z):
    ax, half = abs(x), half_width(z)
    h = BED + sm(half - 6, half + 42, ax) * 50
    h += (fbm(x * 0.018 + 3.1, z * 0.018 + 7.7) - 0.5) * 16 * sm(half - 8, half + 20, ax)
    h += (fbm(x * 0.005 + 1.3, z * 0.005 - 2.1) - 0.45) * 70 * sm(half + 10, half + 120, ax)
    return h

# ---------------- scene ----------------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 14
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 4
sc.render.resolution_x, sc.render.resolution_y = RES
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, PRE + NF
sc.render.use_persistent_data = True
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [i.identifier for i in type(sc.view_settings).bl_rna.properties['look'].enum_items] else 'None'

def mat(name, color, rough=0.8, emit=None, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    if alpha < 1: p.inputs['Alpha'].default_value = alpha
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1); p.inputs['Emission Strength'].default_value = 0
    return m

def srgb(h):
    c = [((h >> s) & 255) / 255 for s in (16, 8, 0)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)

def mesh_obj(name, verts, faces, material, smooth=False):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    if material: me.materials.append(material)
    return ob

def box(name, c3, size3, material, rot_x=0.0):
    """box centred at three.js point c3 with three.js sizes (sx, sy, sz); rot_x about three.js x axis."""
    sx, sy, sz = size3
    vs = []
    for dx in (-1, 1):
        for dy in (-1, 1):
            for dz in (-1, 1):
                x, y, z = dx * sx / 2, dy * sy / 2, dz * sz / 2
                y, z = y * math.cos(rot_x) - z * math.sin(rot_x), y * math.sin(rot_x) + z * math.cos(rot_x)
                vs.append(B(c3[0] + x, c3[1] + y, c3[2] + z))
    f = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    return mesh_obj(name, vs, f, material)

# ---------------- terrain ----------------
N, SIZE = 260, 1800
verts, cols = [], []
cLow, cHigh, cRock, cSand = srgb(0x5f8a3a), srgb(0x3d6a2c), srgb(0x8a7f68), srgb(0xb9a77d)
for j in range(N + 1):
    for i in range(N + 1):
        x = -SIZE / 2 + SIZE * i / N; z = -SIZE / 2 + SIZE * j / N
        h = ground(x, z); verts.append(B(x, h, z))
        n = fbm(x * 0.05, z * 0.05); k = clamp(n * 1.4 - 0.2, 0, 1)
        c = [lerp(cLow[q], cHigh[q], k) for q in range(3)]
        shore = LAKE if z < 0 else RIVER
        if h < shore + 1.8: c = [lerp(c[q], cSand[q], 0.7) for q in range(3)]
        if h > 60: c = [lerp(c[q], cRock[q], sm(60, 110, h) * 0.5) for q in range(3)]
        cols.append(c)
faces = [(j * (N + 1) + i, j * (N + 1) + i + 1, (j + 1) * (N + 1) + i + 1, (j + 1) * (N + 1) + i) for j in range(N) for i in range(N)]
tmat = bpy.data.materials.new('terrain'); tmat.use_nodes = True
nt = tmat.node_tree; p = nt.nodes['Principled BSDF']; p.inputs['Roughness'].default_value = 0.95
ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Col'
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.35
mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 0.35
nt.links.new(ca.outputs['Color'], mx.inputs[6]); nt.links.new(nz.outputs['Color'], mx.inputs[7])
nt.links.new(mx.outputs[2], p.inputs['Base Color'])
terr = mesh_obj('terrain', verts, faces, tmat, smooth=True)
attr = terr.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
for i, c in enumerate(cols): attr.data[i].color = (*c, 1)

# ---------------- trees (one joined mesh of low-poly cones) ----------------
random.seed(7)
tv, tf, tcol = [], [], []
SEG = 7
placed = 0
for _ in range(80000):
    if placed >= 6000: break
    x = (random.random() - .5) * 900; z = -520 + random.random() * 700; h = ground(x, z)
    water = LAKE if z < -2 else RIVER
    if h < water + 1.5: continue
    if abs(z) < 34 and abs(x) < DAM_X + 6: continue
    if math.hypot(x + 97, z - 90) < 70: continue
    if fbm(x * 0.03 + 9, z * 0.03) < 0.42: continue
    sc_ = 0.7 + random.random() * 0.9; ht = 5.5 * sc_ * (0.8 + random.random() * 0.5); r = 1.5 * sc_
    base = len(tv)
    for s in range(SEG):
        a = 2 * math.pi * s / SEG; tv.append(B(x + r * math.cos(a), h - 0.4, z + r * math.sin(a)))
    tv.append(B(x, h - 0.4 + ht, z))
    for s in range(SEG): tf.append((base + s, base + (s + 1) % SEG, base + SEG))
    placed += 1
leaf = mat('leaf', srgb(0x2c4a22), 0.85)
lnt = leaf.node_tree; ob_info = lnt.nodes.new('ShaderNodeTexNoise'); ob_info.inputs['Scale'].default_value = 0.08
ramp = lnt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (*srgb(0x22401c), 1); ramp.color_ramp.elements[1].color = (*srgb(0x4a6e30), 1)
lnt.links.new(ob_info.outputs['Fac'], ramp.inputs['Fac']); lnt.links.new(ramp.outputs['Color'], lnt.nodes['Principled BSDF'].inputs['Base Color'])
mesh_obj('trees', tv, tf, leaf)

# ---------------- dam ----------------
concrete = mat('concrete', srgb(0xe4ddcc), 0.8)
cn = concrete.node_tree; cnz = cn.nodes.new('ShaderNodeTexNoise'); cnz.inputs['Scale'].default_value = 1.2; cnz.inputs['Detail'].default_value = 8
cmx = cn.nodes.new('ShaderNodeMix'); cmx.data_type = 'RGBA'; cmx.blend_type = 'MULTIPLY'; cmx.inputs['Factor'].default_value = 0.18
cmx.inputs[6].default_value = (*srgb(0xe4ddcc), 1)
cn.links.new(cnz.outputs['Color'], cmx.inputs[7]); cn.links.new(cmx.outputs[2], cn.nodes['Principled BSDF'].inputs['Base Color'])
sec = [(-3, BED - 2), (-3, CREST), (2, CREST), (2, 16), (24, BED - 2)]  # (z, y)
dv = [B(x, y, z) for x in (-DAM_X, DAM_X) for (z, y) in sec]
n5 = len(sec)
df = [tuple(range(n5))[::-1], tuple(range(n5, 2 * n5))] + [(i, (i + 1) % n5, n5 + (i + 1) % n5, n5 + i) for i in range(n5)]
mesh_obj('dam', dv, df, concrete)
ang = math.atan2(19, 22); L = math.hypot(22, 19)
rib = mat('rib', srgb(0xd8d0bd), 0.85)
x = -DAM_X + 4
while x <= DAM_X - 4:
    box('rib', (x, 6.5 + 0.759 * 0.45, 13 + 0.655 * 0.45), (1.1, 0.9, L), rib, rot_x=ang); x += 7.2
box('parapet', (0, CREST + 0.6, 1.8), (DAM_X * 2, 1.2, 0.5), concrete)
box('parapet2', (0, CREST + 0.6, -2.8), (DAM_X * 2, 1.2, 0.5), concrete)
x = -DAM_X + 2
while x < DAM_X:
    box('pier', (x, CREST + 1.1, -0.5), (0.9, 2.2, 5.2), concrete); x += 3.6
yel = mat('yellow', srgb(0xe6b422), 0.55)
for gx in (-50, 8, 46):
    for dx in (-1.6, 1.6):
        for dz in (-2.6, 1.6): box('leg', (gx + dx, CREST + 2.5, dz), (0.35, 5, 0.35), yel)
    box('beam', (gx, CREST + 5.2, -0.5), (4, 0.8, 5), yel)
dark = mat('dark', srgb(0x23282f), 0.6)
GATES = [-26 + i * 6.5 for i in range(9)]
for gx in GATES: box('gate', (gx, 9.5, faceZ(9.5) + 0.1), (3, 0.7, 3), dark, rot_x=ang)

# powerhouses with windows that light up
wall = mat('wall', srgb(0xd9d3c4), 0.85); roof = mat('roof', srgb(0x56606c), 0.55)
glass = mat('window', srgb(0x2a2f36), 0.2, emit=srgb(0xffd08a))
def powerhouse(x0, x1):
    cx, w = (x0 + x1) / 2, x1 - x0; zc = faceZ(RIVER + 4) + 3.5
    box('house', (cx, RIVER + 4.5, zc), (w, 9, 8), wall)
    box('roof', (cx, RIVER + 9.4, zc), (w + 0.6, 0.8, 9), roof)
    for i in range(16):
        for j in range(2):
            box('win', (x0 + 1 + (w - 2) * (i + .5) / 16, RIVER + 2.6 + j * 3.6, zc + 4.02), (w / 16 * 0.55, 2.2, 0.08), glass)
powerhouse(-64, -34); powerhouse(34, 64)

# crest lamps
lampm = mat('lamp', (1, 1, 1), 0.5, emit=srgb(0xffd9a0))
x = -DAM_X + 1
while x < DAM_X:
    box('lamp', (x, CREST + 2.6, 2.3), (0.35, 0.35, 0.35), lampm); x += 3.6

# ---------------- water ----------------
def water_mat(name, foam):
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree; p = t.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*srgb(0x123c5a), 1); p.inputs['Roughness'].default_value = 0.06
    p.inputs['Specular IOR Level'].default_value = 0.6
    tc = t.nodes.new('ShaderNodeTexCoord')
    nz = t.nodes.new('ShaderNodeTexNoise'); nz.noise_dimensions = '4D'
    nz.inputs['Scale'].default_value = 0.6; nz.inputs['Detail'].default_value = 6
    t.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nz.inputs['W'].default_value = 0; nz.inputs['W'].keyframe_insert('default_value', frame=PRE + 1)
    nz.inputs['W'].default_value = END * 0.5; nz.inputs['W'].keyframe_insert('default_value', frame=PRE + NF)
    bump = t.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.25
    t.links.new(nz.outputs['Fac'], bump.inputs['Height']); t.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    if foam:
        # white water below the spillway: a soft band in x, starting at the jets' landing line, streaking downstream
        sep = t.nodes.new('ShaderNodeSeparateXYZ'); t.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        def rng(src, a, b, c, d):
            r = t.nodes.new('ShaderNodeMapRange'); r.interpolation_type = 'SMOOTHSTEP'
            r.inputs['From Min'].default_value, r.inputs['From Max'].default_value = a, b
            r.inputs['To Min'].default_value, r.inputs['To Max'].default_value = c, d
            t.links.new(src, r.inputs['Value']); return r
        ax = t.nodes.new('ShaderNodeMath'); ax.operation = 'ABSOLUTE'; t.links.new(sep.outputs['X'], ax.inputs[0])
        bx = rng(ax.outputs[0], 34, 24, 0, 1)
        by1 = rng(sep.outputs['Y'], -18, -26, 0, 1)        # object y = -z(three) + offset handled below
        by2 = rng(sep.outputs['Y'], -60, -120, 1, 0)
        n2 = t.nodes.new('ShaderNodeTexNoise'); n2.noise_dimensions = '4D'; n2.inputs['Scale'].default_value = 0.25; n2.inputs['Detail'].default_value = 10
        t.links.new(tc.outputs['Object'], n2.inputs['Vector'])
        n2.inputs['W'].default_value = 0; n2.inputs['W'].keyframe_insert('default_value', frame=PRE + 1)
        n2.inputs['W'].default_value = END * 1.6; n2.inputs['W'].keyframe_insert('default_value', frame=PRE + NF)
        st = rng(n2.outputs['Fac'], 0.42, 0.62, 0.15, 1)
        m1 = t.nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; t.links.new(bx.outputs[0], m1.inputs[0]); t.links.new(by1.outputs[0], m1.inputs[1])
        m2 = t.nodes.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; t.links.new(m1.outputs[0], m2.inputs[0]); t.links.new(by2.outputs[0], m2.inputs[1])
        m3 = t.nodes.new('ShaderNodeMath'); m3.operation = 'MULTIPLY'; m3.use_clamp = True; t.links.new(m2.outputs[0], m3.inputs[0]); t.links.new(st.outputs[0], m3.inputs[1])
        mx = t.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
        mx.inputs[6].default_value = (*srgb(0x123c5a), 1); mx.inputs[7].default_value = (0.85, 0.88, 0.9, 1)
        t.links.new(m3.outputs[0], mx.inputs['Factor']); t.links.new(mx.outputs[2], p.inputs['Base Color'])
        rr = rng(m3.outputs[0], 0, 1, 0.06, 0.6); t.links.new(rr.outputs[0], p.inputs['Roughness'])
    return m
def water(name, x0, x1, z0, z1, y, foam):
    vs = [B(x0, y, z0), B(x1, y, z0), B(x1, y, z1), B(x0, y, z1)]
    return mesh_obj(name, vs, [(0, 1, 2, 3)], water_mat(name, foam))
water('lake', -450, 450, -600, -2.5, LAKE, False)
water('river', -250, 250, 0, 520, RIVER, True)   # object coords == world coords (no transform), so Y = -z(three)

# ---------------- spray (particles) ----------------
drop_mat = mat('drop', (0.92, 0.95, 1.0), 0.35, alpha=0.8)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.17, location=(0, 0, -500)); drop = bpy.context.object; drop.data.materials.append(drop_mat)
mist_mat = mat('mist', (0.95, 0.97, 1.0), 0.6, alpha=0.07)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0, location=(0, 0, -520)); puff = bpy.context.object; puff.data.materials.append(mist_mat)

def emitter(name, center3, size, count, vel, life, inst, size_rand, life_rand=0.3, gravity=1.0):
    vs = [B(center3[0] - size[0] / 2, center3[1], center3[2]), B(center3[0] + size[0] / 2, center3[1], center3[2]),
          B(center3[0] + size[0] / 2, center3[1] + size[1], center3[2]), B(center3[0] - size[0] / 2, center3[1] + size[1], center3[2])]
    ob = mesh_obj(name, vs, [(0, 1, 2, 3)], None)
    m = ob.modifiers.new('ps', 'PARTICLE_SYSTEM'); ps = m.particle_system.settings
    ps.count = count; ps.frame_start = 1; ps.frame_end = PRE + NF; ps.lifetime = life; ps.lifetime_random = life_rand
    ps.emit_from = 'FACE'; ps.normal_factor = 0
    ps.object_align_factor = vel; ps.factor_random = 1.2
    ps.render_type = 'OBJECT'; ps.instance_object = inst; ps.particle_size = 1; ps.size_random = size_rand
    ps.effector_weights.gravity = gravity
    ob.show_instancer_for_render = False
    return ob
emitter('jets', (0, 9.0, faceZ(9.5) + 1.0), (56, 1.2), 36000, (0, -22, 7), 34, drop, 0.6)

# ---------------- sky + sun ----------------
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True; wt = world.node_tree
for n in list(wt.nodes): wt.nodes.remove(n)
outn = wt.nodes.new('ShaderNodeOutputWorld')
skyt = wt.nodes.new('ShaderNodeTexSky')
types = [i.identifier for i in type(skyt).bl_rna.properties['sky_type'].enum_items]
for want in ('MULTIPLE_SCATTERING', 'SINGLE_SCATTERING', 'NISHITA'):
    if want in types: skyt.sky_type = want; break
skyt.sun_disc = True; skyt.sun_size = math.radians(1.6); skyt.altitude = 200; skyt.air_density = 1.2; skyt.aerosol_density = 2.2
bg_day = wt.nodes.new('ShaderNodeBackground'); wt.links.new(skyt.outputs['Color'], bg_day.inputs['Color'])
# night: dark gradient + stars
tcw = wt.nodes.new('ShaderNodeTexCoord'); sepw = wt.nodes.new('ShaderNodeSeparateXYZ'); wt.links.new(tcw.outputs['Generated'], sepw.inputs['Vector'])
grad = wt.nodes.new('ShaderNodeValToRGB'); wt.links.new(sepw.outputs['Z'], grad.inputs['Fac'])
grad.color_ramp.elements[0].position = 0.0; grad.color_ramp.elements[0].color = (*srgb(0x1c2b48), 1)
grad.color_ramp.elements[1].position = 0.6; grad.color_ramp.elements[1].color = (*srgb(0x040914), 1)
vor = wt.nodes.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 260; wt.links.new(tcw.outputs['Generated'], vor.inputs['Vector'])
srng = wt.nodes.new('ShaderNodeMapRange'); srng.inputs['From Min'].default_value = 0.06; srng.inputs['From Max'].default_value = 0.0
wt.links.new(vor.outputs['Distance'], srng.inputs['Value'])
spow = wt.nodes.new('ShaderNodeMath'); spow.operation = 'POWER'; spow.inputs[1].default_value = 6; wt.links.new(srng.outputs[0], spow.inputs[0])
sadd = wt.nodes.new('ShaderNodeMix'); sadd.data_type = 'RGBA'; sadd.blend_type = 'ADD'
wt.links.new(spow.outputs[0], sadd.inputs['Factor']); wt.links.new(grad.outputs['Color'], sadd.inputs[6]); sadd.inputs[7].default_value = (1.5, 1.5, 1.6, 1)
bg_night = wt.nodes.new('ShaderNodeBackground'); wt.links.new(sadd.outputs[2], bg_night.inputs['Color'])
mixw = wt.nodes.new('ShaderNodeMixShader'); wt.links.new(bg_day.outputs[0], mixw.inputs[1]); wt.links.new(bg_night.outputs[0], mixw.inputs[2])
wt.links.new(mixw.outputs[0], outn.inputs['Surface'])

sunl = bpy.data.lights.new('sun', 'SUN'); sunl.angle = math.radians(1.2)
sun = bpy.data.objects.new('sun', sunl); sc.collection.objects.link(sun)
moonl = bpy.data.lights.new('moon', 'SUN'); moonl.color = (0.55, 0.68, 1.0); moonl.angle = math.radians(2)
moon = bpy.data.objects.new('moon', moonl); sc.collection.objects.link(moon)
moon.rotation_euler = B(-200, 300, 150).normalized().to_track_quat('Z', 'Y').to_euler()

cam_d = bpy.data.cameras.new('cam'); cam_d.sensor_fit = 'VERTICAL'; cam_d.angle = math.radians(46); cam_d.clip_end = 5000
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam

for f in range(1, NF + 1):
    t = (f - 1) / FPS
    n = sm(1.9, 3.3, t)
    elev = lerp(0.2, -0.09, sm(0, 2.8, t))
    d3 = Vector((0.9, elev, -0.62)).normalized()
    db = B(*d3)
    skyt.sun_elevation = math.asin(db.z)
    skyt.sun_rotation = math.atan2(db.x, db.y)   # measured from +Y toward +X
    skyt.keyframe_insert('sun_elevation', frame=PRE + f); skyt.keyframe_insert('sun_rotation', frame=PRE + f)
    sun.rotation_euler = db.to_track_quat('Z', 'Y').to_euler(); sun.keyframe_insert('rotation_euler', frame=PRE + f)
    sunl.energy = lerp(2.6, 0, sm(1.6, 2.9, t)); sunl.keyframe_insert('energy', frame=PRE + f)
    moonl.energy = 0.25 * n; moonl.keyframe_insert('energy', frame=PRE + f)
    bg_day.inputs['Strength'].default_value = lerp(0.16, 0.05, n); bg_day.inputs['Strength'].keyframe_insert('default_value', frame=PRE + f)
    bg_night.inputs['Strength'].default_value = lerp(0.2, 1.0, n); bg_night.inputs['Strength'].keyframe_insert('default_value', frame=PRE + f)
    mixw.inputs['Fac'].default_value = n; mixw.inputs['Fac'].keyframe_insert('default_value', frame=PRE + f)
    on = sm(2.5, 3.1, t)
    lampm.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 60 * on
    lampm.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].keyframe_insert('default_value', frame=PRE + f)
    glass.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 12 * sm(2.6, 3.2, t)
    glass.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].keyframe_insert('default_value', frame=PRE + f)
    sc.view_settings.exposure = lerp(0.0, 0.6, n); sc.view_settings.keyframe_insert('exposure', frame=PRE + f)
    k = ease(clamp(t / END, 0, 1))
    pos = B(lerp(-105, -88, k), lerp(58, 60, k), lerp(100, 80, k))
    tgt = B(lerp(0, 10, k), lerp(24, 20, k), lerp(-10, -18, k))
    cam.location = pos; cam.rotation_euler = (tgt - pos).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=PRE + f); cam.keyframe_insert('rotation_euler', frame=PRE + f)

# ---------------- render ----------------
frames = ONLY or list(range(1, NF + 1))
for sf in range(1, PRE + max(frames) + 1):   # step every frame so the particle systems simulate in order
    sc.frame_set(sf); f = sf - PRE
    if f in frames:
        sc.render.filepath = f'{OUT}/f{f:04d}.png'
        bpy.ops.render.render(write_still=True)
        print('rendered', f, flush=True)
