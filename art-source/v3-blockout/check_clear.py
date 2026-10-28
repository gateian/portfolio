# v05 clearance: per frame min distance camera->any mesh surface, camera->character, occlusion, char in 9:16 strip
import bpy, sys
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view as w2c
s = bpy.context.scene; dg = bpy.context.evaluated_depsgraph_get()
a = sys.argv[sys.argv.index("--")+1:]; f0, f1 = int(a[0]), int(a[1]); step = int(a[2]) if len(a)>2 else 1; TH = float(a[3]) if len(a)>3 else 1.0
meshes = [o for o in s.objects if o.type=="MESH" and not o.name.startswith(("CHAR_","GUIDE","SKY_","FX_","DBG"))]
char = [o for o in s.objects if o.type=="MESH" and o.name.startswith("CHAR_")]
piv = bpy.data.objects["CHAR_PIVOT"]
worst=[]; occl=[]; out=[]; cc=[]
for f in range(f0, f1+1, step):
    s.frame_set(f); cam = s.camera; cp = cam.matrix_world.translation.copy()
    best=(1e9,None)
    for o in meshes:
        if o.hide_render or o.hide_get(): continue
        oe=o.evaluated_get(dg); mw=oe.matrix_world
        bb=[mw@Vector(c) for c in oe.bound_box]; cen=sum(bb,Vector())/8; r=max((b-cen).length for b in bb)
        if (cp-cen).length - r > TH + 2.0: continue
        ok,loc,n,i = oe.closest_point_on_mesh(mw.inverted()@cp)
        if ok:
            d=(mw@loc-cp).length
            if d<best[0]: best=(d,o.name)
    if best[0]<TH: worst.append((f,round(best[0],2),best[1]))
    dch=1e9
    for o in char:
        oe=o.evaluated_get(dg); mw=oe.matrix_world
        ok,loc,n,i=oe.closest_point_on_mesh(mw.inverted()@cp)
        if ok: dch=min(dch,(mw@loc-cp).length)
    if dch<0.8: cc.append((f,round(dch,2)))
    t=piv.matrix_world.translation; d=t-cp
    hit,loc,nrm,idx,ob,m = s.ray_cast(dg,cp,d.normalized(),distance=max(0.01,d.length-0.6))
    if hit and not ob.name.startswith("CHAR_"): occl.append((f,ob.name))
    v=w2c(s,cam,t)
    if not (0.3418 <= v.x <= 0.6582) or not (0.05<=v.y<=0.95) or v.z<0:
        out.append((f,round(v.x,2),round(v.y,2)))
print("CLEAR cam<%.1fm to mesh:" % TH,len(worst),[w for w in worst if not w[2].startswith("ROOF")][:40], "roof min", min([w[1] for w in worst if w[2].startswith("ROOF")] or [99]))
print("CLEAR cam<0.8m to char:",len(cc),cc[:20])
print("CLEAR occluded:",len(occl),occl[:40])
print("CLEAR char outside 9:16 strip:",len(out),out[:60])
