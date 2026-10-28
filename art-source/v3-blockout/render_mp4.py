import bpy, sys, os
out = sys.argv[sys.argv.index("--") + 1]
s = bpy.context.scene
r = s.render
r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, 100
r.fps = 30
if hasattr(r.image_settings, "media_type"):
    r.image_settings.media_type = "VIDEO"   # Blender 5.x: pick video before FFMPEG
r.image_settings.file_format = "FFMPEG"
r.ffmpeg.format = "MPEG4"
r.ffmpeg.codec = "H264"
r.ffmpeg.constant_rate_factor = "MEDIUM"
r.ffmpeg.audio_codec = "AAC"
r.ffmpeg.audio_bitrate = 192
r.ffmpeg.audio_channels = "STEREO"
r.filepath = out
bpy.ops.render.render(animation=True)
