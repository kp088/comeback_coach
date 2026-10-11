# Comeback Coach walkthrough

- User requested a 45–60 second lightweight screen recording of the published app, and approved silent captions plus changing the live demo learner's goal and saving a completion.
- Recorded real browser interactions at `https://restart-coach.emergent.host`: landing, dashboard, goal switch from Python basics to Working with data, dictionary exercise, hint, Make It Easier, incorrect input and feedback, corrected input and passing keyword check, completion, history, updated dashboard.
- Live completion saved: `e6e739e9-206b-4210-9f05-1959ee51c90f`, exercise `db-1`, variant `easier`. The live goal remains Working with data. No production code deployment or data reset was performed.
- Final video: `/app/frontend/public/downloads/comeback-coach-walkthrough.mp4` — 57.834 seconds, 1,139,016 bytes (1.14 MB), 1280×720, H.264/yuv420p, 24 fps, silent, burned-in captions.
- Verified download: `https://restart-coach.preview.emergentagent.com/public/downloads/comeback-coach-walkthrough.mp4`. HTTP 200, `video/mp4`, downloaded SHA-256 matches the original, and FFmpeg decoded every frame without errors.
- The preview's `/downloads/...` path returned the SPA because new public assets were not picked up with watching disabled; `/public/downloads/...` works without changing HMR or restarting services. Use the verified URL above.
- Headless Chromium in the screenshot tool has no H.264 support (`canPlayType` returns an empty string); its native-player failure is a test-browser codec limitation. The MP4 itself passed full software decoding. Do not claim browser playback was verified in this runner.
- Recording had zero console/HTTP errors and one full page load, with no reloads during typing. No comprehensive app test suite was run for this media-only task.
- All Python feedback is real app keyword validation, not Python execution. Sample content is not AI-generated, and the video explicitly discloses this.
- Recording/encoding scripts, scene metadata, proof screenshots, and contact sheet are in `/app/artifacts/comeback-coach/`.