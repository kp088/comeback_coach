"""Compress the real browser recording and burn in short explanatory captions."""
import json
import subprocess
from pathlib import Path

ROOT = Path('/app/artifacts/comeback-coach')
PUBLIC = Path('/app/frontend/public/downloads')
PUBLIC.mkdir(parents=True, exist_ok=True)
recording = json.loads((ROOT / 'recording.json').read_text())

def stamp(seconds):
    cs = round(seconds * 100)
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'

header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Liberation Sans,25,&H00FFFFFF,&H00FFFFFF,&H00162239,&H00162239,-1,0,0,0,100,100,0,0,1,0,0,2,50,50,40,1
Style: Detail,Liberation Sans,18,&H00E6E9EF,&H00FFFFFF,&H00162239,&H00162239,0,0,0,0,100,100,0,0,1,0,0,2,50,50,13,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
lines = [header]
scenes = recording['scenes']
for index, scene in enumerate(scenes):
    end = scenes[index + 1]['time'] if index + 1 < len(scenes) else recording['duration']
    for style, key in [('Title', 'text'), ('Detail', 'detail')]:
        lines.append(f'Dialogue: 0,{stamp(scene["time"])},{stamp(end)},{style},,0,0,0,,{{\\fad(140,100)}}{scene[key]}\n')
subtitle_path = ROOT / 'captions.ass'
subtitle_path.write_text(''.join(lines))
output = PUBLIC / 'comeback-coach-walkthrough.mp4'
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y',
    '-ss', str(recording['trimStart']), '-i', recording['rawPath'],
    '-t', str(recording['duration']),
    '-vf', f'fps=24,scale=1152:648:flags=lanczos,pad=1280:720:64:0:color=0xfaf8f5,drawbox=x=0:y=648:w=1280:h=72:color=0x162239:t=fill,subtitles={subtitle_path}',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart',
    '-metadata', 'title=Comeback Coach — Live App Walkthrough',
    '-metadata', 'comment=Recorded from the published application; sample exercises use keyword checks, not Python execution.',
    str(output),
], check=True)
result = subprocess.run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(output)], capture_output=True, text=True, check=True)
probe = json.loads(result.stdout)
duration = float(probe['format']['duration'])
size = int(probe['format']['size'])
stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
assert 45 <= duration <= 60, duration
assert size < 15_000_000, size
assert stream['codec_name'] == 'h264'
assert (stream['width'], stream['height']) == (1280, 720)
metadata = {'file': str(output), 'duration_seconds': duration, 'bytes': size, 'megabytes': round(size / 1_000_000, 2), 'resolution': '1280x720', 'codec': stream['codec_name'], 'fps': stream['avg_frame_rate'], 'audio': False}
(ROOT / 'delivery.json').write_text(json.dumps(metadata, indent=2))
print(json.dumps(metadata, indent=2))