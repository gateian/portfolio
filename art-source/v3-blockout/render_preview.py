import bpy
s = bpy.context.scene
s.render.engine = 'BLENDER_WORKBENCH'
s.render.resolution_x = 1280
s.render.resolution_y = 720
s.render.resolution_percentage = 100
s.render.image_settings.media_type = 'VIDEO' if hasattr(s.render.image_settings, 'media_type') else None
try:
    s.render.image_settings.file_format = 'FFMPEG'
except Exception as e:
    print('fmt', e)
f = s.render.ffmpeg
f.format = 'MPEG4'
f.codec = 'H264'
f.constant_rate_factor = 'MEDIUM'
f.audio_codec = 'AAC'
f.audio_bitrate = 192
s.render.filepath = '//render/blockout_v01_preview.mp4'
s.render.use_file_extension = False
bpy.ops.render.render(animation=True)
print('RENDER_DONE')
