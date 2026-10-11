// Records real interactions on the published app. Only pointer annotations are injected.
const { chromium } = require('/app/tests/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = '/app/artifacts/comeback-coach';
const BASE = 'https://restart-coach.emergent.host';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  fs.mkdirSync(path.join(ROOT, 'raw'), { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: path.join(ROOT, 'raw'), size: { width: 1280, height: 720 } },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const pointer = document.createElement('div');
      pointer.id = 'walkthrough-pointer';
      pointer.setAttribute('aria-hidden', 'true');
      pointer.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:24px;height:30px;transform:translate(-50px,-50px);filter:drop-shadow(0 2px 2px #0004)';
      pointer.innerHTML = '<svg width="24" height="30" viewBox="0 0 24 30"><path d="M3 2L3 23L9 18L14 28L18 26L13 16L22 15Z" fill="#182844" stroke="white" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      document.body.appendChild(pointer);
      window.addEventListener('mousemove', event => {
        pointer.style.transform = `translate(${event.clientX}px,${event.clientY}px)`;
      });
      window.addEventListener('mousedown', event => {
        const ring = document.createElement('div');
        ring.style.cssText = `position:fixed;left:${event.clientX - 19}px;top:${event.clientY - 19}px;width:38px;height:38px;border:3px solid #dd7159;border-radius:50%;background:#dd715926;pointer-events:none;z-index:2147483646`;
        document.body.appendChild(ring);
        ring.animate([{ opacity: 1, transform: 'scale(.5)' }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 550 }).onfinish = () => ring.remove();
      });
    });
  });
  const clockOrigin = performance.now();
  const page = await context.newPage();
  const video = page.video();
  const errors = [];
  const responses = [];
  let mainFrameLoads = 0;
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (response.url().includes('/api/')) responses.push({ status: response.status(), url: response.url(), method: response.request().method() });
  });
  page.on('load', () => mainFrameLoads++);
  const scenes = [];
  let start;
  const elapsed = () => (performance.now() - start) / 1000;
  const at = async seconds => { const wait = seconds * 1000 - (performance.now() - start); if (wait > 0) await sleep(wait); };
  const scene = (name, text, detail) => {
    const s = { name, time: Number(elapsed().toFixed(3)), text, detail };
    scenes.push(s);
    console.log('SCENE', JSON.stringify(s));
  };
  const click = async locator => {
    await locator.waitFor({ state: 'visible' });
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error('No bounding box for click');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
    await sleep(200);
    await locator.click();
  };
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(1070, 590);
    await sleep(500);
    start = performance.now();
    const trimStart = (start - clockOrigin) / 1000;
    scene('landing', 'Comeback Coach', 'A live walkthrough • restart-coach.emergent.host');

    await at(4);
    await click(page.getByRole('link', { name: 'Start Learning Again', exact: true }).first());
    await page.getByTestId('goal-switcher-select').waitFor();
    scene('dashboard', 'Start from where you are', 'Your goal, recent progress, and one suggested session');
    await at(8);
    await click(page.getByTestId('goal-switcher-select'));
    await sleep(900);
    const goalChanged = page.waitForResponse(r => r.url().endsWith('/api/learner/goal') && r.request().method() === 'PUT');
    await click(page.getByRole('option', { name: 'Working with data', exact: true }));
    const goalResponse = await goalChanged;
    if (!goalResponse.ok()) throw new Error('Goal change failed');
    await page.getByTestId('start-next-session-button').filter({ hasText: 'Start session' }).waitFor();
    scene('goal', 'Switch your learning goal', 'Python basics → Working with data');
    await at(13);
    const sessionLink = page.getByTestId('start-next-session-button');
    const href = await sessionLink.getAttribute('href');
    if (href !== '/session/db-1') throw new Error(`Expected dictionary exercise, got ${href}; no completion was submitted`);
    await click(sessionLink);
    await page.getByTestId('make-it-easier-button').waitFor();
    scene('exercise', 'One short Python exercise', 'Sample content • build a dictionary and read a value');
    await at(17);
    await click(page.getByTestId('hint-toggle-button'));
    scene('hint', 'A hint when you need one', 'Get a useful nudge, without a penalty');
    await at(20.5);
    await click(page.getByTestId('hint-toggle-button'));
    await at(21.5);
    await click(page.getByTestId('make-it-easier-button'));
    await page.getByText('Smaller step, same direction.', { exact: true }).waitFor();
    const editor = page.getByRole('textbox', { name: 'Python code editor' });
    const starter = await editor.inputValue();
    if (!starter.includes('scores = {')) throw new Error('Simpler exercise did not replace the starter code');
    scene('easier', 'Make It Easier', 'A ready-made dictionary. One smaller task. About 2 minutes');
    await page.screenshot({ path: path.join(ROOT, 'easier-proof.png') });

    await at(27);
    await click(editor);
    await editor.press('Control+End');
    await editor.pressSequentially('print(scores["tue"])', { delay: 75 });
    scene('input', 'Try an answer', 'Real sample input, checked by the app');
    await at(31);
    const failedCheck = page.waitForResponse(r => r.url().endsWith('/api/exercises/db-1/check'));
    await click(page.getByTestId('check-code-button'));
    const feedback = await (await failedCheck).json();
    if (feedback.passed !== false) throw new Error('Expected feedback for the incorrect dictionary key');
    scene('feedback', 'Helpful feedback, not pressure', 'The task asks for "mon" — correct the dictionary key');
    await page.screenshot({ path: path.join(ROOT, 'feedback-proof.png') });

    await at(35);
    await click(editor);
    await editor.press('Control+End');
    await editor.press('Home');
    await editor.press('Shift+End');
    await editor.pressSequentially('print(scores["mon"])', { delay: 80 });
    await at(38.5);
    const passedCheck = page.waitForResponse(r => r.url().endsWith('/api/exercises/db-1/check'));
    await click(page.getByTestId('check-code-button'));
    const passed = await (await passedCheck).json();
    if (passed.passed !== true) throw new Error('Correct answer did not pass');
    scene('passed', 'The corrected answer passes', 'Prototype: keyword validation, not Python execution');
    await page.screenshot({ path: path.join(ROOT, 'passed-proof.png') });

    await at(43.5);
    const savedResponse = page.waitForResponse(r => r.url().endsWith('/api/completions') && r.request().method() === 'POST');
    await click(page.getByTestId('complete-session-button'));
    const saved = await savedResponse;
    const completion = await saved.json();
    if (saved.status() !== 201 || completion.exercise_id !== 'db-1' || completion.variant !== 'easier') throw new Error(`Completion failed: ${JSON.stringify(completion)}`);
    scene('completion', 'Complete your session', 'The smaller version counts, too');

    await at(47);
    await click(page.getByTestId('nav-history-link'));
    await page.getByText('Look something up', { exact: true }).first().waitFor();
    scene('history', 'See your progress history', 'Your new dictionary session is saved as Simplified');
    await page.screenshot({ path: path.join(ROOT, 'history-proof.png') });

    await at(52);
    await click(page.getByTestId('nav-dashboard-link'));
    await page.getByTestId('goal-switcher-select').waitFor();
    scene('next', 'You just have to start again', 'Progress saved. Your next small step is ready');
    await page.mouse.move(1150, 690, { steps: 18 });
    await at(58);
    const endTime = elapsed();
    await page.screenshot({ path: path.join(ROOT, 'final-proof.png') });
    const finalDashboardText = await page.locator('body').innerText();
    const finalCode = 'scores = {"mon": 2, "tue": 3}\n# print the value for "mon"\nprint(scores["mon"])';
    const metadata = { base: BASE, trimStart, duration: 58, recordedDuration: endTime, scenes, errors, mainFrameLoads, completion, finalCode, feedback, passed, finalDashboardText, responses };
    await context.close();
    const rawPath = await video.path();
    metadata.rawPath = rawPath;
    fs.writeFileSync(path.join(ROOT, 'recording.json'), JSON.stringify(metadata, null, 2));
    console.log('RECORDING_RESULT', JSON.stringify({rawPath, trimStart, duration: 58, errors, mainFrameLoads, completionId: completion.id}));
    await browser.close();
    if (errors.length) process.exitCode = 2;
    if (mainFrameLoads !== 1) throw new Error(`Unexpected full page reloads: ${mainFrameLoads}`);
  } catch (error) {
    console.error(error);
    await page.screenshot({ path: path.join(ROOT, 'recording-error.png') }).catch(() => {});
    fs.writeFileSync(path.join(ROOT, 'recording-error.json'), JSON.stringify({error: String(error), errors, scenes, responses}, null, 2));
    await context.close().catch(() => {});
    await browser.close();
    process.exitCode = 1;
  }
})();