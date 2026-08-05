const app = document.getElementById('app');

const STORAGE = {
  history: 'form-history-v2',
  current: 'form-current-v2'
};

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

const savedCurrent = safeLoad(STORAGE.current, null);

const state = {
  view: 'home',
  step: 0,
  focusNotice: '',
  answers: savedCurrent?.answers || {
    focuses: [],
    goal: 'Build muscle',
    time: 45,
    setup: 'home',
    energy: 'Good',
    limitations: ['None']
  },
  workout: savedCurrent?.workout || null,
  activeIndex: savedCurrent?.activeIndex || 0,
  session: {
    active: Boolean(savedCurrent?.session?.active),
    startedAt: null,
    elapsedMs: savedCurrent?.session?.elapsedMs || 0
  },
  restUntil: null,
  timerId: null,
  pendingSummary: null,
  history: safeLoad(STORAGE.history, [])
};

const focusSections = [
  { title: 'Lower body', options: ['Glutes', 'Legs', 'Quads', 'Hamstrings', 'Calves'] },
  { title: 'Upper body', options: ['Back', 'Chest', 'Shoulders', 'Arms'] },
  { title: 'Core + movement', options: ['Core', 'Full body', 'Cardio', 'Mobility + recovery', 'Surprise me'] }
];

const specialFocuses = ['Full body', 'Surprise me'];

const steps = [
  { key: 'focuses', title: 'What do you want to train?', copy: 'Choose one area or combine up to four.' },
  {
    key: 'goal',
    title: 'What is the goal?',
    copy: 'This changes the volume, rep range, and pace.',
    options: ['Build muscle', 'Get stronger', 'Support fat loss', 'Maintain', 'General fitness']
  },
  { key: 'time', title: 'How much time do you have?', copy: 'The workout will stay inside this window.', range: true },
  {
    key: 'setup',
    title: 'What equipment is available?',
    copy: 'Form will only choose movements that fit your setup.',
    options: [
      ['bodyweight', 'Bodyweight only'],
      ['dumbbells', 'Dumbbells'],
      ['bands', 'Resistance bands'],
      ['home', 'Home gym'],
      ['gym', 'Full gym']
    ]
  },
  {
    key: 'energy',
    title: 'How is your energy?',
    copy: 'The best session is the one that fits today.',
    options: ['Low', 'Good', 'High']
  },
  {
    key: 'limitations',
    title: 'Anything to be cautious with?',
    copy: 'Select all that apply. This is not a medical screening.',
    options: ['None', 'Knees', 'Lower back', 'Shoulders', 'Wrists']
  }
];

const setups = {
  bodyweight: { label: 'Bodyweight only', allowed: ['bodyweight'] },
  dumbbells: { label: 'Dumbbells', allowed: ['bodyweight', 'dumbbells'] },
  bands: { label: 'Resistance bands', allowed: ['bodyweight', 'bands'] },
  home: { label: 'Home gym', allowed: ['bodyweight', 'dumbbells', 'bands', 'barbell', 'bench', 'cardio'] },
  gym: { label: 'Full gym', allowed: ['bodyweight', 'dumbbells', 'bands', 'barbell', 'bench', 'cable', 'machine', 'cardio'] }
};

const exerciseLibrary = [
  // Glutes
  ex('barbell-hip-thrust', 'Barbell hip thrust', ['Glutes'], 'Glutes', 'barbell', [], 'Drive through the heels, keep the ribs down, and pause when the hips are fully extended.'),
  ex('dumbbell-glute-bridge', 'Dumbbell glute bridge', ['Glutes'], 'Glutes', 'dumbbells', [], 'Keep the chin tucked and squeeze the glutes without arching the lower back.'),
  ex('bodyweight-glute-bridge', 'Bodyweight glute bridge', ['Glutes'], 'Glutes', 'bodyweight', [], 'Press through the full foot and hold the top position for one controlled second.'),
  ex('single-leg-glute-bridge', 'Single-leg glute bridge', ['Glutes'], 'Glutes', 'bodyweight', [], 'Keep the hips level and use a smaller range if the pelvis begins to rotate.'),
  ex('cable-kickback', 'Cable kickback', ['Glutes'], 'Glutes', 'cable', [], 'Keep the torso still and move from the hip rather than swinging the leg.'),
  ex('banded-lateral-walk', 'Banded lateral walk', ['Glutes'], 'Outer glutes', 'bands', ['knees'], 'Keep light tension on the band and take short, controlled steps without rocking.'),
  ex('frog-pump', 'Frog pump', ['Glutes'], 'Glutes', 'bodyweight', [], 'Bring the soles together, keep the range controlled, and squeeze at the top.'),
  ex('reverse-lunge', 'Reverse lunge', ['Glutes', 'Legs', 'Quads'], 'Glutes + legs', 'bodyweight', ['knees'], 'Step back far enough to keep the front foot planted and drive through the front heel.'),
  ex('dumbbell-reverse-lunge', 'Dumbbell reverse lunge', ['Glutes', 'Legs', 'Quads'], 'Glutes + legs', 'dumbbells', ['knees'], 'Stay tall, step back softly, and keep the front knee tracking over the toes.'),
  ex('step-up', 'Step-up', ['Glutes', 'Legs', 'Quads'], 'Glutes + quads', 'bodyweight', ['knees'], 'Use a stable step, place the full foot on it, and avoid pushing off the trailing leg.'),

  // Legs and quads
  ex('bodyweight-squat', 'Bodyweight squat', ['Legs', 'Quads'], 'Quads + glutes', 'bodyweight', ['knees'], 'Sit between the hips, keep the feet planted, and let the knees track with the toes.'),
  ex('goblet-squat', 'Goblet squat', ['Legs', 'Quads'], 'Quads + glutes', 'dumbbells', ['knees'], 'Hold the weight close, brace the torso, and keep pressure through the whole foot.'),
  ex('barbell-back-squat', 'Barbell back squat', ['Legs', 'Quads'], 'Legs', 'barbell', ['knees', 'lower back'], 'Brace before descending and use a depth that allows steady control and a neutral spine.'),
  ex('leg-press', 'Leg press', ['Legs', 'Quads'], 'Quads + glutes', 'machine', ['knees'], 'Keep the hips against the pad and stop before the lower back begins to round.'),
  ex('leg-extension', 'Leg extension', ['Quads'], 'Quads', 'machine', ['knees'], 'Lift smoothly, pause briefly near the top, and avoid snapping the knees straight.'),
  ex('wall-sit', 'Wall sit', ['Legs', 'Quads'], 'Quads', 'bodyweight', ['knees'], 'Keep the back supported and choose a knee angle that feels controlled and pain-free.', 'time'),
  ex('heel-elevated-squat', 'Heel-elevated squat', ['Quads'], 'Quads', 'bodyweight', ['knees'], 'Stay upright, move slowly, and keep the knees aligned with the toes.'),
  ex('split-squat', 'Split squat', ['Legs', 'Quads', 'Glutes'], 'Quads + glutes', 'bodyweight', ['knees'], 'Use a stable stance and lower straight down rather than drifting forward.'),
  ex('dumbbell-split-squat', 'Dumbbell split squat', ['Legs', 'Quads', 'Glutes'], 'Quads + glutes', 'dumbbells', ['knees'], 'Keep the front foot flat and use the rear leg mainly for balance.'),

  // Hamstrings
  ex('dumbbell-rdl', 'Dumbbell Romanian deadlift', ['Hamstrings', 'Glutes', 'Legs'], 'Hamstrings + glutes', 'dumbbells', ['lower back'], 'Push the hips back, keep the weights close, and stop when the hamstrings are fully loaded.'),
  ex('barbell-rdl', 'Barbell Romanian deadlift', ['Hamstrings', 'Glutes', 'Legs'], 'Hamstrings + glutes', 'barbell', ['lower back'], 'Keep the bar close to the legs and hinge without rounding or reaching for extra depth.'),
  ex('slider-hamstring-curl', 'Slider hamstring curl', ['Hamstrings'], 'Hamstrings', 'bodyweight', [], 'Keep the hips lifted and slide the heels slowly without losing trunk position.'),
  ex('stability-ball-curl', 'Stability-ball hamstring curl', ['Hamstrings'], 'Hamstrings', 'bodyweight', [], 'Keep the hips elevated while pulling the ball in with controlled heel pressure.'),
  ex('lying-leg-curl', 'Lying leg curl', ['Hamstrings'], 'Hamstrings', 'machine', [], 'Keep the hips down and curl through a smooth range without kicking.'),
  ex('seated-leg-curl', 'Seated leg curl', ['Hamstrings'], 'Hamstrings', 'machine', [], 'Stay against the pad and control both the curl and the return.'),
  ex('single-leg-rdl', 'Single-leg Romanian deadlift', ['Hamstrings', 'Glutes'], 'Hamstrings + glutes', 'bodyweight', ['lower back'], 'Keep the hips square and reach the free leg back as the torso tips forward.'),

  // Calves
  ex('standing-calf-raise', 'Standing calf raise', ['Calves'], 'Calves', 'bodyweight', [], 'Use a full comfortable range and pause at both the top and bottom.'),
  ex('single-leg-calf-raise', 'Single-leg calf raise', ['Calves'], 'Calves', 'bodyweight', [], 'Use light support for balance and keep the ankle moving straight up and down.'),
  ex('dumbbell-calf-raise', 'Dumbbell calf raise', ['Calves'], 'Calves', 'dumbbells', [], 'Stay tall and avoid bouncing through the bottom of the repetition.'),
  ex('seated-calf-raise', 'Seated calf raise', ['Calves'], 'Calves', 'machine', [], 'Keep pressure over the ball of the foot and pause at the top.'),
  ex('leg-press-calf-raise', 'Leg-press calf raise', ['Calves'], 'Calves', 'machine', [], 'Move only at the ankles and keep a slight bend in the knees.'),

  // Back
  ex('reverse-snow-angel', 'Reverse snow angel', ['Back'], 'Upper back', 'bodyweight', ['shoulders'], 'Lie face down, keep the movement small, and sweep the arms slowly without shrugging.'),
  ex('prone-w-raise', 'Prone W raise', ['Back', 'Shoulders'], 'Upper back', 'bodyweight', ['shoulders'], 'Lift the elbows and hands only slightly while drawing the shoulder blades gently together.'),
  ex('one-arm-row', 'One-arm dumbbell row', ['Back'], 'Back', 'dumbbells', [], 'Brace on a stable surface and pull the elbow toward the back pocket without twisting.'),
  ex('chest-supported-row', 'Chest-supported dumbbell row', ['Back'], 'Back', 'dumbbells', [], 'Keep the chest supported and pull with the elbows rather than shrugging.'),
  ex('band-row', 'Resistance-band row', ['Back'], 'Back', 'bands', [], 'Keep the ribs stacked and squeeze the shoulder blades without leaning back.'),
  ex('band-pulldown', 'Resistance-band pulldown', ['Back'], 'Lats', 'bands', ['shoulders'], 'Pull the elbows toward the ribs and avoid arching to create extra range.'),
  ex('lat-pulldown', 'Lat pulldown', ['Back'], 'Lats', 'machine', ['shoulders'], 'Lead with the elbows, keep the torso quiet, and stop near the upper chest.'),
  ex('seated-cable-row', 'Seated cable row', ['Back'], 'Mid back', 'cable', [], 'Stay tall and finish the pull without leaning far behind the hips.'),
  ex('machine-row', 'Chest-supported machine row', ['Back'], 'Back', 'machine', [], 'Keep the chest on the pad and control the return until the arms are long.'),
  ex('inverted-row', 'Inverted row', ['Back'], 'Back', 'barbell', ['shoulders', 'wrists'], 'Keep the body in one line and pull the chest toward the bar.'),
  ex('dumbbell-pullover', 'Dumbbell pullover', ['Back', 'Chest'], 'Lats + chest', 'dumbbells', ['shoulders'], 'Keep the ribs down and use only the shoulder range you can control.'),

  // Chest
  ex('incline-pushup', 'Incline push-up', ['Chest'], 'Chest + triceps', 'bodyweight', ['shoulders', 'wrists'], 'Keep the body straight and lower the chest toward the support with elbows angled back.'),
  ex('pushup', 'Push-up', ['Chest'], 'Chest + triceps', 'bodyweight', ['shoulders', 'wrists'], 'Brace the body as one unit and keep the elbows at a comfortable angle.'),
  ex('dumbbell-floor-press', 'Dumbbell floor press', ['Chest', 'Arms'], 'Chest + triceps', 'dumbbells', ['shoulders'], 'Keep the wrists stacked and pause gently when the upper arms meet the floor.'),
  ex('dumbbell-bench-press', 'Dumbbell bench press', ['Chest', 'Arms'], 'Chest + triceps', 'bench', ['shoulders'], 'Keep the feet planted and lower the weights with the forearms nearly vertical.'),
  ex('machine-chest-press', 'Machine chest press', ['Chest', 'Arms'], 'Chest + triceps', 'machine', ['shoulders'], 'Set the handles near mid-chest and press without letting the shoulders roll forward.'),
  ex('band-chest-press', 'Resistance-band chest press', ['Chest', 'Arms'], 'Chest + triceps', 'bands', ['shoulders'], 'Stand stable, keep the ribs down, and press forward without shrugging.'),
  ex('dumbbell-squeeze-press', 'Dumbbell squeeze press', ['Chest', 'Arms'], 'Chest + triceps', 'dumbbells', ['shoulders'], 'Press the dumbbells together throughout the repetition and move slowly.'),

  // Shoulders
  ex('seated-shoulder-press', 'Seated dumbbell shoulder press', ['Shoulders', 'Arms'], 'Shoulders + triceps', 'dumbbells', ['shoulders'], 'Keep the ribs down and press only through a comfortable overhead range.'),
  ex('lateral-raise', 'Dumbbell lateral raise', ['Shoulders'], 'Side delts', 'dumbbells', ['shoulders'], 'Use light weight, lead with the elbows, and stop near shoulder height.'),
  ex('band-lateral-raise', 'Band lateral raise', ['Shoulders'], 'Side delts', 'bands', ['shoulders'], 'Keep the neck relaxed and raise with steady band tension.'),
  ex('rear-delt-fly', 'Rear-delt fly', ['Shoulders', 'Back'], 'Rear delts', 'dumbbells', ['lower back', 'shoulders'], 'Use a supported position when possible and move the arms without shrugging.'),
  ex('face-pull', 'Cable face pull', ['Shoulders', 'Back'], 'Rear delts + upper back', 'cable', ['shoulders'], 'Pull toward eye level and finish with the hands apart without arching.'),
  ex('band-pull-apart', 'Band pull-apart', ['Shoulders', 'Back'], 'Rear delts + upper back', 'bands', ['shoulders'], 'Keep the ribs down and spread the band without lifting the shoulders.'),
  ex('wall-slide', 'Scapular wall slide', ['Shoulders', 'Mobility + recovery'], 'Shoulder control', 'bodyweight', [], 'Move only through a pain-free range and keep the ribs from flaring.', 'mobility'),
  ex('landmine-press', 'Half-kneeling landmine press', ['Shoulders', 'Arms'], 'Shoulders + triceps', 'barbell', ['shoulders', 'knees'], 'Stay tall and press forward and up without rotating the torso.'),

  // Arms
  ex('dumbbell-curl', 'Dumbbell biceps curl', ['Arms'], 'Biceps', 'dumbbells', [], 'Keep the elbows near the ribs and control the weight all the way down.'),
  ex('hammer-curl', 'Hammer curl', ['Arms'], 'Biceps + forearms', 'dumbbells', [], 'Keep the wrists neutral and avoid swinging the torso.'),
  ex('band-curl', 'Resistance-band curl', ['Arms'], 'Biceps', 'bands', [], 'Stand on the band securely and keep steady tension through the full range.'),
  ex('concentration-curl', 'Concentration curl', ['Arms'], 'Biceps', 'dumbbells', [], 'Brace the upper arm and curl without letting the shoulder roll forward.'),
  ex('triceps-kickback', 'Dumbbell triceps kickback', ['Arms'], 'Triceps', 'dumbbells', ['lower back'], 'Keep the upper arm still and straighten the elbow without swinging.'),
  ex('overhead-triceps-extension', 'Overhead triceps extension', ['Arms'], 'Triceps', 'dumbbells', ['shoulders'], 'Keep the ribs down and use a comfortable shoulder position.'),
  ex('band-pressdown', 'Resistance-band pressdown', ['Arms'], 'Triceps', 'bands', [], 'Pin the elbows near the sides and finish by straightening the arms.'),
  ex('cable-pressdown', 'Cable triceps pressdown', ['Arms'], 'Triceps', 'cable', [], 'Keep the elbows still and avoid leaning body weight into the handle.'),
  ex('close-grip-pushup', 'Close-grip incline push-up', ['Arms', 'Chest'], 'Triceps + chest', 'bodyweight', ['shoulders', 'wrists'], 'Use an incline that allows control and keep the elbows close to the torso.'),

  // Core
  ex('dead-bug', 'Dead bug', ['Core'], 'Deep core', 'bodyweight', [], 'Keep the lower back gently supported and move only as far as you can stay braced.'),
  ex('heel-taps', 'Heel taps', ['Core'], 'Core', 'bodyweight', [], 'Keep the ribs down and alternate sides without letting the back arch.'),
  ex('reverse-crunch', 'Reverse crunch', ['Core'], 'Lower abs', 'bodyweight', [], 'Curl the pelvis gently rather than swinging the legs for momentum.'),
  ex('bird-dog', 'Bird dog', ['Core'], 'Core + stability', 'bodyweight', ['wrists'], 'Keep the hips square and reach long without arching the lower back.'),
  ex('forearm-plank', 'Forearm plank', ['Core'], 'Core', 'bodyweight', ['shoulders', 'lower back'], 'Squeeze the glutes, keep the ribs down, and stop before the back sags.', 'time'),
  ex('side-plank', 'Side plank', ['Core'], 'Obliques', 'bodyweight', ['shoulders'], 'Keep the body long and use the lower knee for support when needed.', 'time'),
  ex('pallof-press', 'Pallof press', ['Core'], 'Core + anti-rotation', 'cable', [], 'Stay square to the anchor and resist rotation as the hands press away.'),
  ex('band-pallof-press', 'Band Pallof press', ['Core'], 'Core + anti-rotation', 'bands', [], 'Stand tall and keep the torso still as the band pulls sideways.'),
  ex('hollow-hold', 'Hollow-body hold', ['Core'], 'Core', 'bodyweight', ['lower back'], 'Use a bent-knee version and shorten the lever if the lower back lifts.', 'time'),

  // Cardio
  ex('brisk-walk', 'Brisk walk', ['Cardio'], 'Conditioning', 'bodyweight', [], 'Use a pace that raises the breathing rate while still allowing short sentences.', 'cardio'),
  ex('low-impact-circuit', 'Low-impact cardio circuit', ['Cardio'], 'Conditioning', 'bodyweight', ['knees'], 'Rotate through marching, side steps, and controlled reaches without jumping.', 'cardio'),
  ex('shadow-boxing', 'Shadow boxing intervals', ['Cardio'], 'Conditioning', 'bodyweight', ['shoulders'], 'Stay light on the feet and keep the punches controlled rather than locked out.', 'cardio'),
  ex('incline-walk', 'Incline treadmill walk', ['Cardio'], 'Conditioning', 'cardio', ['knees'], 'Use an incline and pace that feel challenging without holding the rails.', 'cardio'),
  ex('bike-intervals', 'Bike intervals', ['Cardio'], 'Conditioning', 'cardio', ['knees'], 'Keep the resistance smooth and alternate controlled hard efforts with easy pedaling.', 'cardio'),
  ex('rower-intervals', 'Rowing intervals', ['Cardio'], 'Conditioning', 'cardio', ['lower back'], 'Drive with the legs first and keep the handle path level and controlled.', 'cardio'),
  ex('elliptical-intervals', 'Elliptical intervals', ['Cardio'], 'Conditioning', 'cardio', ['knees'], 'Use steady posture and change resistance before adding speed.', 'cardio'),
  ex('jump-rope', 'Jump-rope intervals', ['Cardio'], 'Conditioning', 'bodyweight', ['knees'], 'Keep the jumps low and quiet and stop before form becomes heavy.', 'cardio'),

  // Mobility
  ex('hip-9090', '90/90 hip switches', ['Mobility + recovery'], 'Hip mobility', 'bodyweight', [], 'Move slowly between sides and use the hands for support as needed.', 'mobility'),
  ex('thoracic-rotation', 'Open-book rotation', ['Mobility + recovery'], 'Upper-back mobility', 'bodyweight', ['shoulders'], 'Keep the knees stacked and rotate through a comfortable upper-back range.', 'mobility'),
  ex('cat-cow', 'Cat-cow', ['Mobility + recovery'], 'Spine mobility', 'bodyweight', ['wrists'], 'Move gently with the breath and avoid forcing either end position.', 'mobility'),
  ex('hamstring-sweep', 'Standing hamstring sweep', ['Mobility + recovery'], 'Hamstring mobility', 'bodyweight', [], 'Keep the movement easy and sweep the hands toward the toes without bouncing.', 'mobility'),
  ex('ankle-rock', 'Ankle rocks', ['Mobility + recovery'], 'Ankle mobility', 'bodyweight', ['knees'], 'Keep the heel down and guide the knee forward in a comfortable line.', 'mobility'),
  ex('hip-flexor-stretch', 'Half-kneeling hip-flexor stretch', ['Mobility + recovery'], 'Hip mobility', 'bodyweight', ['knees'], 'Tuck the pelvis gently and shift forward without arching the back.', 'mobility'),
  ex('child-pose-reach', 'Child’s-pose side reach', ['Mobility + recovery'], 'Back + shoulders', 'bodyweight', ['knees', 'shoulders'], 'Sit back only as far as comfortable and breathe into the side of the rib cage.', 'mobility'),
  ex('standing-side-bend', 'Standing side bend', ['Mobility + recovery'], 'Torso mobility', 'bodyweight', [], 'Stay tall and reach gently without twisting or collapsing forward.', 'mobility')
];

function ex(id, name, focuses, muscle, equipment, avoid, cue, kind = 'strength') {
  return { id, name, focuses, muscle, equipment, avoid, cue, kind };
}

function nav(active = state.view) {
  return `<nav class="nav" aria-label="Main navigation">
    <button class="${active === 'home' ? 'active' : ''}" onclick="goHome()">Home</button>
    <button class="${active === 'workout' || active === 'active' ? 'active' : ''}" onclick="openLatest()">Workout</button>
    <button class="${active === 'history' ? 'active' : ''}" onclick="showHistory()">History</button>
  </nav>`;
}

function renderHome() {
  stopUiTimer();
  state.view = 'home';
  const total = state.history.length;
  const streak = calculateStreak();
  const totalMinutes = state.history.reduce((sum, item) => sum + (item.minutes || 0), 0);
  const currentLabel = state.session.active ? 'Continue workout' : 'Open workout';

  app.innerHTML = `
    <div class="topbar">
      <div class="brand">FORM</div>
      <button class="icon-button" aria-label="Settings" onclick="showSettings()">···</button>
    </div>
    <section class="hero">
      <div class="eyebrow">Your workout, simplified</div>
      <h1>What feels good today?</h1>
      <p class="lede">Choose what you want to train. Form handles the exercises, sets, reps, and pacing.</p>
    </section>
    <section class="card">
      <button class="primary-button" onclick="startBuilder()">Build my workout</button>
      <div class="quick-stats">
        <div class="stat"><strong>${total}</strong><span>workouts</span></div>
        <div class="stat"><strong>${streak}</strong><span>day streak</span></div>
        <div class="stat"><strong>${totalMinutes}</strong><span>minutes</span></div>
      </div>
    </section>
    ${state.workout ? `
      <section class="card">
        <div class="eyebrow">${state.session.active ? 'In progress' : 'Ready when you are'}</div>
        <h2 style="margin:0 0 8px;font-size:27px;letter-spacing:-.045em">${state.workout.title}</h2>
        <p class="question-copy">${state.workout.exercises.length} movements · ${state.answers.time} min</p>
        <button class="secondary-button" onclick="${state.session.active ? 'resumeWorkout()' : 'showWorkout()'}">${currentLabel}</button>
      </section>` : ''}
    ${nav('home')}`;
}

function calculateStreak() {
  if (!state.history.length) return 0;
  const dayKeys = [...new Set(state.history.map(item => dateKey(new Date(item.date))))];
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!dayKeys.includes(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.includes(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (dayKeys.includes(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function startBuilder() {
  state.step = 0;
  state.focusNotice = '';
  renderBuilder();
}

function renderBuilder() {
  stopUiTimer();
  state.view = 'builder';
  const step = steps[state.step];
  const progress = ((state.step + 1) / steps.length) * 100;

  let body = '';
  if (step.key === 'focuses') {
    const count = state.answers.focuses.length;
    body = `
      <div class="selection-summary">${count ? `${count} selected` : 'Nothing selected yet'}</div>
      ${focusSections.map(section => `
        <section class="focus-section">
          <h3 class="focus-section-title">${section.title}</h3>
          <div class="option-grid two-column">
            ${section.options.map(option => focusOption(option)).join('')}
          </div>
        </section>`).join('')}
      ${state.focusNotice ? `<p class="inline-note">${state.focusNotice}</p>` : ''}`;
  } else if (step.range) {
    body = `
      <div class="range-wrap">
        <div class="range-value"><span id="timeValueBig">${state.answers.time}</span><span>min</span></div>
        <input aria-label="Workout duration" type="range" min="15" max="75" step="5" value="${state.answers.time}" oninput="updateTime(this.value)" />
        <div class="range-labels"><span>15</span><span>45</span><span>75</span></div>
      </div>`;
  } else if (step.key === 'setup') {
    body = `<div class="option-grid">${step.options.map(([value, label]) => choiceOption(step.key, value, label)).join('')}</div>`;
  } else if (step.key === 'limitations') {
    body = `<div class="option-grid">${step.options.map(option => limitationOption(option)).join('')}</div>
      <p class="helper">Form removes exercises commonly associated with the areas selected, but it cannot diagnose pain or replace professional guidance.</p>`;
  } else {
    body = `<div class="option-grid">${step.options.map(option => choiceOption(step.key, option, option)).join('')}</div>`;
  }

  const continueDisabled = step.key === 'focuses' && state.answers.focuses.length === 0;

  app.innerHTML = `
    <div class="step-header">
      <button class="icon-button" aria-label="Go back" onclick="builderBack()">←</button>
      <div class="step-meta">
        <span class="step-count">${state.step + 1} of ${steps.length}</span>
        <div class="progress-track" aria-label="Builder progress">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
    </div>
    <section class="hero">
      <h2 class="question-title">${step.title}</h2>
      <p class="question-copy">${step.copy}</p>
    </section>
    ${body}
    <div class="builder-actions">
      <div class="footer-actions ${state.step === 0 ? 'single' : ''}">
        ${state.step > 0 ? '<button class="ghost-button" onclick="builderBack()">Back</button>' : ''}
        <button class="primary-button" ${continueDisabled ? 'disabled' : ''} onclick="builderNext()">${state.step === steps.length - 1 ? 'Create workout' : 'Continue'}</button>
      </div>
    </div>`;
}

function focusOption(option) {
  const selected = state.answers.focuses.includes(option);
  return `<button class="option compact ${selected ? 'selected' : ''}" aria-pressed="${selected}" onclick="toggleFocus('${escapeJs(option)}')">
    <span>${option}</span><span class="check">✓</span>
  </button>`;
}

function choiceOption(key, value, label) {
  const selected = state.answers[key] === value;
  return `<button class="option ${selected ? 'selected' : ''}" aria-pressed="${selected}" onclick="choose('${key}', '${escapeJs(value)}')">
    <span>${label}${optionSubtext(value)}</span><span class="check">✓</span>
  </button>`;
}

function limitationOption(option) {
  const selected = state.answers.limitations.includes(option);
  return `<button class="option ${selected ? 'selected' : ''}" aria-pressed="${selected}" onclick="toggleLimitation('${escapeJs(option)}')">
    <span>${option}</span><span class="check">✓</span>
  </button>`;
}

function optionSubtext(value) {
  const descriptions = {
    'Build muscle': 'Moderate reps with progressive overload',
    'Get stronger': 'Lower reps and longer rest',
    'Support fat loss': 'Moderate reps with shorter rests',
    'Maintain': 'Balanced volume and intensity',
    'General fitness': 'A straightforward, well-rounded session',
    'Low': 'Reduced volume with no guilt',
    'Good': 'Balanced and productive',
    'High': 'A little more challenge'
  };
  return descriptions[value] ? `<small>${descriptions[value]}</small>` : '';
}

function escapeJs(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function toggleFocus(option) {
  let selected = [...state.answers.focuses];
  state.focusNotice = '';

  if (selected.includes(option)) {
    selected = selected.filter(item => item !== option);
  } else if (specialFocuses.includes(option)) {
    selected = [option];
  } else {
    selected = selected.filter(item => !specialFocuses.includes(item));
    if (selected.length >= 4) {
      state.focusNotice = 'Choose up to four areas so every selection can be represented.';
      renderBuilder();
      return;
    }
    selected.push(option);
  }

  state.answers.focuses = selected;
  renderBuilder();
}

function toggleLimitation(option) {
  let selected = [...state.answers.limitations];

  if (option === 'None') {
    selected = ['None'];
  } else {
    selected = selected.filter(item => item !== 'None');
    if (selected.includes(option)) {
      selected = selected.filter(item => item !== option);
    } else {
      selected.push(option);
    }
    if (!selected.length) selected = ['None'];
  }

  state.answers.limitations = selected;
  renderBuilder();
}

function choose(key, value) {
  state.answers[key] = value;
  renderBuilder();
}

function updateTime(value) {
  state.answers.time = Number(value);
  const display = document.getElementById('timeValueBig');
  if (display) display.textContent = value;
}

function builderBack() {
  if (state.step === 0) {
    renderHome();
  } else {
    state.step -= 1;
    renderBuilder();
  }
}

function builderNext() {
  if (steps[state.step].key === 'focuses' && state.answers.focuses.length === 0) return;
  if (state.step < steps.length - 1) {
    state.step += 1;
    renderBuilder();
  } else {
    generateWorkout();
  }
}

function generateWorkout() {
  const resolvedFocuses = resolveFocuses(state.answers.focuses);
  const eligible = exerciseLibrary.filter(isEligible);
  const desiredCount = getExerciseCount(state.answers.time, resolvedFocuses);
  const selectedExercises = balancedPick(eligible, resolvedFocuses, desiredCount);

  if (!selectedExercises.length) {
    showModal(
      'No safe match found',
      'The selected equipment and caution areas removed every available exercise for this combination. Go back and change the setup, selected areas, or caution areas.',
      '<button class="primary-button" onclick="closeCurrentModal(); startBuilder()">Edit choices</button>'
    );
    return;
  }

  const prescription = getBasePrescription(state.answers.goal, state.answers.energy);
  const exercises = selectedExercises.map((item, index) => prescribeExercise(item, prescription, index));
  const limitationNote = buildLimitationNote();
  const goalNote = state.answers.goal === 'Support fat loss'
    ? 'This session supports calorie expenditure and fitness. Fat loss still depends on overall activity and nutrition, and it cannot be targeted to one body area.'
    : '';

  state.workout = {
    id: `workout-${Date.now()}`,
    title: workoutTitle(state.answers.focuses),
    note: `${state.answers.goal} · ${setups[state.answers.setup].label}`,
    focuses: [...state.answers.focuses],
    resolvedFocuses,
    warmup: state.answers.time <= 20 ? 3 : state.answers.time <= 35 ? 4 : (state.answers.energy === 'Low' ? 4 : 6),
    cooldown: resolvedFocuses.includes('Mobility + recovery') ? 5 : (state.answers.time <= 20 ? 2 : 3),
    guidance: [goalNote, limitationNote, buildTimeNote(resolvedFocuses)].filter(Boolean),
    exercises
  };

  state.activeIndex = 0;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.restUntil = null;
  persistCurrent();
  showWorkout();
}

function resolveFocuses(selected) {
  if (selected.includes('Full body')) {
    return ['Legs', 'Chest', 'Back', 'Glutes', 'Core', 'Shoulders'];
  }
  if (selected.includes('Surprise me')) {
    const pool = ['Glutes', 'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio'];
    return shuffle(pool).slice(0, state.answers.time <= 25 ? 2 : 3);
  }
  return [...selected];
}

function isEligible(item) {
  const allowedEquipment = setups[state.answers.setup].allowed;
  if (!allowedEquipment.includes(item.equipment)) return false;

  const limitations = state.answers.limitations
    .filter(item => item !== 'None')
    .map(item => item.toLowerCase());

  return !item.avoid.some(area => limitations.includes(area));
}

function getExerciseCount(minutes, focuses) {
  if (focuses.length === 1 && focuses[0] === 'Cardio') return minutes <= 25 ? 2 : 3;
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return minutes <= 25 ? 4 : 6;

  let count = minutes <= 20 ? 3 : minutes <= 30 ? 4 : minutes <= 45 ? 5 : minutes <= 60 ? 6 : 7;
  count = Math.max(count, Math.min(focuses.length, 4));

  const singleFocus = state.answers.focuses.length === 1 ? state.answers.focuses[0] : '';
  if (['Calves', 'Arms'].includes(singleFocus)) count = Math.min(count, 4);

  if (state.answers.energy === 'Low') count = Math.max(Math.min(focuses.length, 4), count - 1);
  if (state.answers.energy === 'High' && minutes >= 40) count += 1;
  return Math.min(count, 8);
}

function buildTimeNote(resolvedFocuses) {
  if (state.answers.time <= 20 && resolvedFocuses.length >= 3) {
    return 'Because several areas were selected in a short time window, this is a brief circuit with fewer working sets per movement.';
  }
  return '';
}

const compoundExerciseIds = new Set([
  'barbell-hip-thrust', 'reverse-lunge', 'dumbbell-reverse-lunge', 'step-up',
  'goblet-squat', 'barbell-back-squat', 'leg-press', 'split-squat',
  'dumbbell-split-squat', 'dumbbell-rdl', 'barbell-rdl', 'one-arm-row',
  'chest-supported-row', 'lat-pulldown', 'seated-cable-row', 'pushup',
  'dumbbell-floor-press', 'dumbbell-bench-press', 'machine-chest-press',
  'seated-shoulder-press', 'landmine-press', 'pallof-press', 'band-pallof-press'
]);

function rankedForFocus(items, focus) {
  return items
    .filter(item => item.focuses.includes(focus))
    .map(item => ({ item, score: exercisePriority(item, focus) + Math.random() * 0.2 }))
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item);
}

function balancedPick(eligible, focuses, desiredCount) {
  const selected = [];
  const used = new Set();
  const queues = focuses.map(focus => ({
    focus,
    items: rankedForFocus(eligible, focus)
  }));

  let madeProgress = true;
  while (selected.length < desiredCount && madeProgress) {
    madeProgress = false;
    for (const queue of queues) {
      const next = queue.items.find(item => !used.has(item.id));
      if (next && selected.length < desiredCount) {
        selected.push(next);
        used.add(next.id);
        madeProgress = true;
      }
    }
  }

  if (selected.length < desiredCount) {
    const focusSet = new Set(focuses);
    const remaining = shuffle(eligible.filter(item =>
      !used.has(item.id) && item.focuses.some(focus => focusSet.has(focus))
    ));
    for (const item of remaining) {
      selected.push(item);
      used.add(item.id);
      if (selected.length >= desiredCount) break;
    }
  }

  return selected.slice(0, desiredCount);
}

function exercisePriority(item, focus) {
  let score = 0;
  if (item.focuses[0] === focus) score += 3;
  if (item.kind === 'strength') score += 2;
  if (compoundExerciseIds.has(item.id)) score += 4;
  if (item.equipment === 'bodyweight') score += 0.25;
  return score;
}

function getBasePrescription(goal, energy) {
  const base = {
    'Build muscle': { sets: 3, reps: '8–12', rest: 75 },
    'Get stronger': { sets: 4, reps: '5–8', rest: 120 },
    'Support fat loss': { sets: 3, reps: '10–15', rest: 45 },
    'Maintain': { sets: 3, reps: '8–12', rest: 60 },
    'General fitness': { sets: 3, reps: '8–12', rest: 60 }
  }[goal];

  if (state.answers.time <= 20) {
    const manyFocuses = state.answers.focuses.length >= 3;
    return {
      ...base,
      sets: manyFocuses ? 1 : 2,
      rest: Math.min(base.rest, goal === 'Get stronger' ? 90 : 60)
    };
  }
  if (state.answers.time <= 30) {
    base.sets = Math.min(base.sets, 3);
  }
  if (energy === 'Low') return { ...base, sets: Math.max(2, base.sets - 1) };
  return base;
}

function prescribeExercise(item, base, index) {
  let sets = base.sets;
  let reps = base.reps;
  let rest = base.rest;

  if (item.kind === 'mobility') {
    sets = 2;
    reps = '6–8 / side';
    rest = 20;
  } else if (item.kind === 'cardio') {
    sets = state.answers.time <= 25 ? 5 : 7;
    reps = '40 sec';
    rest = 30;
  } else if (item.kind === 'time') {
    reps = state.answers.goal === 'Get stronger' ? '30–45 sec' : '25–40 sec';
  } else if (state.answers.energy === 'High' && index === 0 && state.answers.time >= 40) {
    sets += 1;
  }

  return {
    ...item,
    sets,
    reps,
    rest,
    setData: Array.from({ length: sets }, () => ({ weight: '', reps: '', done: false }))
  };
}

function buildLimitationNote() {
  const limits = state.answers.limitations.filter(item => item !== 'None');
  if (!limits.length) return '';
  return `Exercises commonly associated with ${formatList(limits).toLowerCase()} were removed. Stop if any movement causes pain.`;
}

function workoutTitle(selected) {
  if (selected.includes('Full body')) return 'Full-body session';
  if (selected.includes('Surprise me')) return 'Today’s mix';
  if (selected.length === 1) {
    const single = selected[0];
    if (single === 'Mobility + recovery') return 'Mobility + recovery';
    return `${single} focus`;
  }
  return formatList(selected);
}

function formatList(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} + ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} + ${items.at(-1)}`;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showWorkout() {
  stopUiTimer();
  if (!state.workout) {
    renderHome();
    return;
  }

  state.view = 'workout';
  const workout = state.workout;
  const actionLabel = state.session.active ? 'Resume workout' : 'Start workout';

  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Back home" onclick="renderHome()">←</button>
      <div class="brand">FORM</div>
      <button class="icon-button" aria-label="Create a different workout" onclick="confirmRegenerate()">↻</button>
    </div>
    <section class="workout-head">
      <div>
        <div class="eyebrow">Today</div>
        <h2>${workout.title}</h2>
        <div class="workout-meta">${workout.note} · ${state.answers.time} min</div>
      </div>
      <div class="badge">${workout.exercises.length} moves</div>
    </section>
    ${workout.guidance.map(note => `
      <section class="card" style="margin-bottom:14px">
        <div class="plan-note">
          <div class="plan-note-icon">i</div>
          <p class="helper" style="margin:2px 0 0">${note}</p>
        </div>
      </section>`).join('')}
    <section class="card" style="margin-bottom:14px">
      <div class="eyebrow">Warm up</div>
      <strong>${workout.warmup} minutes</strong>
      <p class="helper">Start with easy movement, then complete one light practice set of the first loaded exercise.</p>
    </section>
    <section class="exercise-list">${workout.exercises.map((item, index) => exercisePreview(item, index)).join('')}</section>
    <section class="card">
      <div class="eyebrow">Cool down</div>
      <strong>${workout.cooldown} minutes</strong>
      <p class="helper">Let the breathing settle and use gentle, comfortable movement rather than forcing a stretch.</p>
    </section>
    <div class="builder-actions">
      <button class="primary-button" onclick="${state.session.active ? 'resumeWorkout()' : 'startWorkout()'}">${actionLabel}</button>
    </div>
    ${nav('workout')}`;
}

function exercisePreview(item, index) {
  const swapAvailable = findSwap(index);
  return `<article class="exercise-card">
    <div class="exercise-main">
      <div class="exercise-number">${String(index + 1).padStart(2, '0')} · ${item.muscle}</div>
      <div class="exercise-name">${item.name}</div>
      <div class="exercise-prescription">${item.sets} ${item.sets === 1 ? 'set' : 'sets'} · ${item.reps} · ${item.rest}s rest</div>
    </div>
    <div class="exercise-actions">
      <button class="pill-button" onclick="showTip(${index})">How to</button>
      <button class="pill-button" ${swapAvailable ? '' : 'disabled'} onclick="swapExercise(${index})">Swap</button>
    </div>
  </article>`;
}

function findSwap(index) {
  if (!state.workout) return null;
  const current = state.workout.exercises[index];
  const usedIds = new Set(state.workout.exercises.map(item => item.id));
  const candidates = exerciseLibrary.filter(item =>
    item.id !== current.id &&
    !usedIds.has(item.id) &&
    item.focuses.some(focus => current.focuses.includes(focus)) &&
    isEligible(item) &&
    item.kind === current.kind
  );
  return candidates[0] || null;
}

function replacementWithSamePrescription(replacement, current) {
  return {
    ...replacement,
    sets: current.sets,
    reps: current.reps,
    rest: current.rest,
    setData: Array.from({ length: current.sets }, () => ({ weight: '', reps: '', done: false }))
  };
}

function swapExercise(index) {
  const replacement = findSwap(index);
  if (!replacement) return;
  const current = state.workout.exercises[index];
  state.workout.exercises[index] = replacementWithSamePrescription(replacement, current);
  persistCurrent();
  showWorkout();
}

function showTip(index) {
  const item = state.workout.exercises[index];
  showModal(item.name, item.cue);
}

function confirmRegenerate() {
  const message = state.session.active
    ? 'Creating a new workout will discard the workout currently in progress.'
    : 'Create a different workout using the same choices?';
  showModal(
    'Create another workout?',
    message,
    `<div class="modal-actions">
      <button class="primary-button" onclick="closeCurrentModal(); regenerate()">Create another</button>
      <button class="ghost-button" onclick="closeCurrentModal()">Keep this workout</button>
    </div>`
  );
}

function regenerate() {
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.restUntil = null;
  generateWorkout();
}

function startWorkout() {
  if (!state.workout) return;
  state.session.active = true;
  state.session.startedAt = Date.now();
  state.session.elapsedMs = 0;
  state.activeIndex = 0;
  persistCurrent();
  renderActive();
}

function resumeWorkout() {
  if (!state.workout) return;
  state.session.active = true;
  if (!state.session.startedAt) state.session.startedAt = Date.now();
  renderActive();
}

function renderActive() {
  if (!state.workout) {
    renderHome();
    return;
  }

  state.view = 'active';
  const item = state.workout.exercises[state.activeIndex];

  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Pause workout" onclick="pauseWorkout()">←</button>
      <div class="brand">FORM</div>
      <div class="timer" id="workoutTimer">00:00</div>
    </div>
    <div class="rest-strip hidden" id="restStrip">
      <span>Rest</span>
      <strong id="restTimer">0:00</strong>
      <button onclick="skipRest()">Skip</button>
    </div>
    <section class="card active-card">
      <div class="active-top">
        <div>
          <div class="eyebrow">Exercise ${state.activeIndex + 1} of ${state.workout.exercises.length}</div>
          <h2>${item.name}</h2>
          <p class="workout-meta">${item.reps} · ${item.rest}s rest</p>
        </div>
      </div>
      <p class="helper">${item.cue}</p>
      <div class="set-label-row">
        <span>Set</span><span>${item.kind === 'strength' ? 'Weight' : 'Level'}</span><span>${item.kind === 'time' || item.kind === 'cardio' ? 'Time' : 'Reps'}</span><span>Done</span>
      </div>
      <div>${item.setData.map((set, index) => setRow(index, set, item)).join('')}</div>
    </section>
    <div class="active-actions">
      <div class="footer-actions">
        <button class="ghost-button" onclick="swapActive()">Swap</button>
        <button class="primary-button" onclick="nextExercise()">${state.activeIndex === state.workout.exercises.length - 1 ? 'Finish workout' : 'Next exercise'}</button>
      </div>
    </div>`;

  startUiTimer();
  updateTimers();
}

function setRow(index, set, item) {
  return `<div class="set-row">
    <div style="font-weight:780;text-align:center">${index + 1}</div>
    <input
      inputmode="decimal"
      value="${escapeHtml(set.weight)}"
      placeholder="${item.kind === 'strength' ? 'lb' : 'Easy'}"
      aria-label="${item.kind === 'strength' ? 'Weight' : 'Effort level'} for set ${index + 1}"
      oninput="updateSetValue(${index}, 'weight', this.value)"
    />
    <input
      inputmode="${item.kind === 'strength' ? 'numeric' : 'text'}"
      value="${escapeHtml(set.reps)}"
      placeholder="${item.kind === 'strength' ? 'Reps' : item.reps}"
      aria-label="${item.kind === 'strength' ? 'Repetitions' : 'Time'} for set ${index + 1}"
      oninput="updateSetValue(${index}, 'reps', this.value)"
    />
    <button class="set-check ${set.done ? 'done' : ''}" aria-label="${set.done ? 'Mark set incomplete' : 'Mark set complete'}" onclick="toggleSet(${index})">${set.done ? '✓' : '○'}</button>
  </div>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function updateSetValue(setIndex, field, value) {
  const item = state.workout.exercises[state.activeIndex];
  item.setData[setIndex][field] = value;
  persistCurrent();
}

function toggleSet(setIndex) {
  const item = state.workout.exercises[state.activeIndex];
  item.setData[setIndex].done = !item.setData[setIndex].done;
  if (item.setData[setIndex].done && item.rest > 0) {
    state.restUntil = Date.now() + (item.rest * 1000);
  }
  persistCurrent();
  renderActive();
}

function updateTimers() {
  const workoutTimer = document.getElementById('workoutTimer');
  if (workoutTimer) {
    const totalSeconds = Math.floor(getElapsedMs() / 1000);
    workoutTimer.textContent = formatClock(totalSeconds);
  }

  const strip = document.getElementById('restStrip');
  const restTimer = document.getElementById('restTimer');
  if (strip && restTimer && state.restUntil) {
    const remaining = Math.max(0, Math.ceil((state.restUntil - Date.now()) / 1000));
    if (remaining > 0) {
      strip.classList.remove('hidden');
      restTimer.textContent = formatClock(remaining);
    } else {
      strip.classList.add('hidden');
      state.restUntil = null;
    }
  }
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getElapsedMs() {
  return state.session.elapsedMs + (state.session.startedAt ? Date.now() - state.session.startedAt : 0);
}

function startUiTimer() {
  stopUiTimer();
  state.timerId = setInterval(updateTimers, 1000);
}

function stopUiTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

function skipRest() {
  state.restUntil = null;
  updateTimers();
}

function swapActive() {
  pauseSessionClock();
  const replacement = findSwap(state.activeIndex);
  if (!replacement) {
    showModal('No swap available', 'No other matching exercise fits the current equipment and caution selections.');
    state.session.startedAt = Date.now();
    return;
  }
  const current = state.workout.exercises[state.activeIndex];
  state.workout.exercises[state.activeIndex] = replacementWithSamePrescription(replacement, current);
  state.session.startedAt = Date.now();
  persistCurrent();
  renderActive();
}

function nextExercise() {
  if (state.activeIndex < state.workout.exercises.length - 1) {
    state.activeIndex += 1;
    state.restUntil = null;
    persistCurrent();
    renderActive();
  } else {
    prepareCompletion();
  }
}

function pauseSessionClock() {
  if (state.session.startedAt) {
    state.session.elapsedMs += Date.now() - state.session.startedAt;
    state.session.startedAt = null;
  }
}

function pauseWorkout() {
  pauseSessionClock();
  stopUiTimer();
  persistCurrent();
  showWorkout();
}

function prepareCompletion() {
  pauseSessionClock();
  stopUiTimer();
  const completedSets = state.workout.exercises.reduce(
    (sum, item) => sum + item.setData.filter(set => set.done).length,
    0
  );
  state.pendingSummary = {
    date: new Date().toISOString(),
    title: state.workout.title,
    minutes: Math.max(1, Math.round(state.session.elapsedMs / 60000)),
    exercises: state.workout.exercises.length,
    completedSets,
    focuses: [...state.workout.focuses],
    details: state.workout.exercises.map(item => ({
      name: item.name,
      sets: item.setData.map(set => ({ ...set }))
    }))
  };
  renderCompletion();
}

function renderCompletion() {
  const summary = state.pendingSummary;
  app.innerHTML = `
    <div class="topbar"><div class="brand">FORM</div></div>
    <section class="hero">
      <div class="eyebrow">Complete</div>
      <h1>Nicely done.</h1>
      <p class="lede">${summary.minutes} minutes · ${summary.completedSets} completed sets</p>
    </section>
    <section class="card">
      <h2 class="question-title" style="font-size:28px">How did that feel?</h2>
      <p class="question-copy">Your answer is saved with the workout so your history reflects how the session actually felt.</p>
      <div class="feedback">
        <button class="secondary-button" onclick="saveCompletion('Too easy')">Too easy</button>
        <button class="primary-button" onclick="saveCompletion('Just right')">Just right</button>
        <button class="secondary-button" onclick="saveCompletion('Too hard')">Too hard</button>
        <button class="text-button" onclick="saveCompletion('Not rated')">Skip</button>
      </div>
    </section>`;
}

function saveCompletion(feedback) {
  if (!state.pendingSummary) return;
  state.history.unshift({ ...state.pendingSummary, feedback });
  safeSave(STORAGE.history, state.history);
  state.pendingSummary = null;
  state.workout = null;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.activeIndex = 0;
  state.restUntil = null;
  safeRemove(STORAGE.current);
  renderHome();
}

function persistCurrent() {
  if (!state.workout) {
    safeRemove(STORAGE.current);
    return;
  }
  const elapsedMs = getElapsedMs();
  safeSave(STORAGE.current, {
    answers: state.answers,
    workout: state.workout,
    activeIndex: state.activeIndex,
    session: {
      active: state.session.active,
      elapsedMs
    }
  });
}

function showHistory() {
  stopUiTimer();
  state.view = 'history';
  app.innerHTML = `
    <div class="topbar"><div class="brand">FORM</div></div>
    <section class="hero">
      <div class="eyebrow">Progress</div>
      <h2 class="question-title">Workout history</h2>
      <p class="question-copy">Simple proof that you showed up.</p>
    </section>
    <section class="card">
      ${state.history.length ? state.history.map(historyItem).join('') : '<div class="empty">Completed workouts will appear here.</div>'}
    </section>
    ${nav('history')}`;
}

function historyItem(item) {
  const focusText = item.focuses?.length ? formatList(item.focuses) : item.title;
  return `<div class="history-item">
    <div>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${escapeHtml(focusText)}</span>
    </div>
    <div style="text-align:right">
      <strong>${item.minutes} min</strong>
      <span>${item.feedback || `${item.exercises} moves`}</span>
    </div>
  </div>`;
}

function showSettings() {
  const historyLabel = state.history.length === 1 ? '1 completed workout' : `${state.history.length} completed workouts`;
  showModal(
    'About Form',
    '',
    `<div class="settings-row">
      <strong>Simple by design</strong>
      <span>Form asks only what it needs to create one focused workout at a time.</span>
    </div>
    <div class="settings-row">
      <strong>Private on this device</strong>
      <span>Workout history is stored in this browser. This version has no account, advertising, analytics, or cloud sync.</span>
    </div>
    <div class="settings-row">
      <strong>Safety</strong>
      <span>Form provides general fitness information, not medical advice. Stop if a movement causes pain. People with an injury, pregnancy, chronic condition, or symptoms should obtain guidance from a qualified professional.</span>
    </div>
    <div class="settings-row">
      <strong>Version 2.1</strong>
      <span>${historyLabel} saved locally.</span>
    </div>
    <div class="modal-actions">
      ${state.history.length ? '<button class="danger-button" onclick="confirmClearHistory()">Clear history</button>' : ''}
      <button class="primary-button" onclick="closeCurrentModal()">Done</button>
    </div>`
  );
}

function confirmClearHistory() {
  closeCurrentModal();
  showModal(
    'Clear workout history?',
    'This permanently removes completed workouts saved in this browser.',
    `<div class="modal-actions">
      <button class="danger-button" onclick="clearHistory()">Clear history</button>
      <button class="ghost-button" onclick="closeCurrentModal()">Cancel</button>
    </div>`
  );
}

function clearHistory() {
  state.history = [];
  safeSave(STORAGE.history, []);
  closeCurrentModal();
  renderHome();
}

function showModal(title, text, customContent = '') {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="modal" onclick="closeModalFromBackdrop(event)">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <h3 id="modalTitle">${title}</h3>
        ${text ? `<p>${text}</p>` : ''}
        ${customContent || '<div class="modal-actions"><button class="primary-button" onclick="closeCurrentModal()">Got it</button></div>'}
      </div>
    </div>`);
}

function closeModalFromBackdrop(event) {
  if (event.target.id === 'modal') event.target.remove();
}

function closeCurrentModal() {
  document.getElementById('modal')?.remove();
}

function openLatest() {
  if (!state.workout) {
    startBuilder();
  } else if (state.session.active) {
    resumeWorkout();
  } else {
    showWorkout();
  }
}

function goHome() {
  if (state.session.active) pauseSessionClock();
  persistCurrent();
  renderHome();
}

window.addEventListener('beforeunload', () => {
  if (state.session.active) pauseSessionClock();
  persistCurrent();
});

if (location.protocol === 'https:' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

renderHome();
