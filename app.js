const app = document.getElementById('app');

const VERSION = '3.0.0';

const STORAGE = {
  profile: 'form-profile-v3',
  history: 'form-history-v3',
  current: 'form-current-v3',
  behavior: 'form-behavior-v3',
  legacyHistory: 'form-history-v2'
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const setupPresets = {
  bodyweight: {
    label: 'Bodyweight only',
    equipment: ['bodyweight']
  },
  dumbbells: {
    label: 'Dumbbells',
    equipment: ['bodyweight', 'dumbbells']
  },
  bands: {
    label: 'Resistance bands',
    equipment: ['bodyweight', 'bands']
  },
  home: {
    label: 'Home gym',
    equipment: ['bodyweight', 'dumbbells', 'bands', 'barbell', 'bench', 'cardio']
  },
  gym: {
    label: 'Full gym',
    equipment: ['bodyweight', 'dumbbells', 'bands', 'barbell', 'bench', 'cable', 'machine', 'cardio']
  },
  custom: {
    label: 'Custom equipment',
    equipment: ['bodyweight']
  }
};

const equipmentChoices = [
  ['dumbbells', 'Dumbbells'],
  ['bands', 'Resistance bands'],
  ['barbell', 'Barbell'],
  ['bench', 'Bench'],
  ['cable', 'Cable station'],
  ['machine', 'Machines'],
  ['cardio', 'Cardio equipment']
];

const limitationChoices = ['None', 'Knees', 'Lower back', 'Shoulders', 'Wrists'];
const priorityChoices = ['Glutes', 'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'];
const goalChoices = ['Lose fat / get leaner', 'Build muscle', 'Maintain', 'Get stronger', 'General fitness'];
const experienceChoices = ['Beginner', 'Intermediate', 'Advanced'];

const focusSections = [
  { title: 'Lower body', options: ['Glutes', 'Legs', 'Quads', 'Hamstrings', 'Calves'] },
  { title: 'Upper body', options: ['Back', 'Chest', 'Shoulders', 'Arms', 'Upper body'] },
  { title: 'Core + movement', options: ['Core', 'Full body', 'Cardio', 'Mobility + recovery', 'Pick for me'] }
];

const specialFocuses = ['Full body', 'Upper body', 'Pick for me'];

const splitDefinitions = {
  'Full Body': [
    { title: 'Full Body', focuses: ['Full body'] }
  ],
  'Upper / Lower': [
    { title: 'Upper Body', focuses: ['Upper body'] },
    { title: 'Lower Body + Glutes', focuses: ['Legs', 'Glutes'] }
  ],
  'Push / Pull / Legs': [
    { title: 'Push', focuses: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Pull', focuses: ['Back', 'Arms'] },
    { title: 'Legs + Glutes', focuses: ['Legs', 'Glutes'] }
  ],
  'Push / Pull / Legs repeated': [
    { title: 'Push', focuses: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Pull', focuses: ['Back', 'Arms'] },
    { title: 'Legs + Glutes', focuses: ['Legs', 'Glutes'] },
    { title: 'Push', focuses: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Pull', focuses: ['Back', 'Arms'] },
    { title: 'Legs + Glutes', focuses: ['Legs', 'Glutes'] }
  ],
  'Upper / Lower / Full Body': [
    { title: 'Upper Body', focuses: ['Upper body'] },
    { title: 'Lower Body + Glutes', focuses: ['Legs', 'Glutes'] },
    { title: 'Full Body', focuses: ['Full body'] }
  ],
  'Upper / Lower / Push / Pull / Legs': [
    { title: 'Upper Body', focuses: ['Upper body'] },
    { title: 'Lower Body + Glutes', focuses: ['Legs', 'Glutes'] },
    { title: 'Push', focuses: ['Chest', 'Shoulders', 'Arms'] },
    { title: 'Pull', focuses: ['Back', 'Arms'] },
    { title: 'Legs + Glutes', focuses: ['Legs', 'Glutes'] }
  ],
  'Glute-focused': [
    { title: 'Glutes + Hamstrings', focuses: ['Glutes', 'Hamstrings'] },
    { title: 'Upper Body', focuses: ['Upper body'] },
    { title: 'Glutes + Quads', focuses: ['Glutes', 'Quads'] },
    { title: 'Back + Core', focuses: ['Back', 'Core'] }
  ],
  'Strength-focused': [
    { title: 'Full-Body Strength A', focuses: ['Legs', 'Chest', 'Back'] },
    { title: 'Full-Body Strength B', focuses: ['Glutes', 'Shoulders', 'Back'] },
    { title: 'Full-Body Strength C', focuses: ['Legs', 'Chest', 'Core'] }
  ],
  'Traditional body-part split': [
    { title: 'Chest + Triceps', focuses: ['Chest', 'Arms'] },
    { title: 'Back + Biceps', focuses: ['Back', 'Arms'] },
    { title: 'Legs + Glutes', focuses: ['Legs', 'Glutes'] },
    { title: 'Shoulders + Core', focuses: ['Shoulders', 'Core'] }
  ]
};

function defaultProfile() {
  return {
    onboarded: false,
    firstName: '',
    lastName: '',
    goal: 'General fitness',
    experience: 'Beginner',
    daysPerWeek: 3,
    duration: 45,
    setup: 'home',
    equipment: [...setupPresets.home.equipment],
    limitations: ['None'],
    musclePriorities: [],
    dislikes: '',
    splitMode: 'form',
    splitName: 'Full Body',
    splitSequence: clone(splitDefinitions['Full Body']),
    splitIndex: 0,
    weightHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeGoal(goal) {
  if (goal === 'Support fat loss' || goal === 'Slim + tone') return 'Lose fat / get leaner';
  return goalChoices.includes(goal) ? goal : 'General fitness';
}

function normalizeProfile(raw) {
  const base = defaultProfile();
  if (!raw || typeof raw !== 'object') return base;
  const profile = { ...base, ...raw };
  profile.goal = normalizeGoal(profile.goal);
  profile.firstName = String(profile.firstName || '').trim();
  profile.lastName = String(profile.lastName || '').trim();
  profile.daysPerWeek = clampNumber(profile.daysPerWeek, 1, 6, 3);
  profile.duration = clampNumber(profile.duration, 15, 75, 45);
  profile.setup = setupPresets[profile.setup] ? profile.setup : 'home';
  profile.equipment = Array.isArray(profile.equipment) && profile.equipment.length
    ? [...new Set(['bodyweight', ...profile.equipment])]
    : [...setupPresets[profile.setup].equipment];
  profile.limitations = normalizeNoneArray(profile.limitations, limitationChoices);
  profile.musclePriorities = Array.isArray(profile.musclePriorities)
    ? profile.musclePriorities.filter(item => priorityChoices.includes(item)).slice(0, 3)
    : [];
  profile.weightHistory = Array.isArray(profile.weightHistory) ? profile.weightHistory : [];
  profile.splitMode = profile.splitMode === 'custom' ? 'custom' : 'form';
  const validSplit = splitDefinitions[profile.splitName] ? profile.splitName : recommendSplit(profile);
  profile.splitName = validSplit;
  profile.splitSequence = clone(splitDefinitions[validSplit]);
  profile.splitIndex = clampNumber(profile.splitIndex, 0, Math.max(0, profile.splitSequence.length - 1), 0);
  return profile;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function normalizeNoneArray(value, allowed) {
  const array = Array.isArray(value) ? value.filter(item => allowed.includes(item)) : ['None'];
  if (!array.length || array.includes('None')) return ['None'];
  return [...new Set(array)];
}

function loadHistory() {
  const current = safeLoad(STORAGE.history, null);
  if (Array.isArray(current)) return current;
  const legacy = safeLoad(STORAGE.legacyHistory, []);
  const migrated = Array.isArray(legacy)
    ? legacy.map((item, index) => ({
        id: item.id || `legacy-${Date.now()}-${index}`,
        date: item.date || new Date().toISOString(),
        title: item.title || 'Workout',
        minutes: Number(item.minutes) || 0,
        completedSets: Number(item.completedSets) || 0,
        exercises: Number(item.exercises) || item.details?.length || 0,
        focuses: Array.isArray(item.focuses) ? item.focuses : [],
        feedback: item.feedback || 'Not rated',
        source: 'legacy',
        details: Array.isArray(item.details)
          ? item.details.map(detail => ({
              id: detail.id || '',
              name: detail.name || 'Exercise',
              family: detail.family || '',
              muscle: detail.muscle || '',
              skipped: Boolean(detail.skipped),
              sets: Array.isArray(detail.sets) ? detail.sets : []
            }))
          : [],
        swaps: Array.isArray(item.swaps) ? item.swaps : [],
        skipped: Array.isArray(item.skipped) ? item.skipped : []
      }))
    : [];
  safeSave(STORAGE.history, migrated);
  return migrated;
}

function defaultBehavior() {
  return {
    exerciseRejects: {},
    familyRejects: {},
    exerciseSkips: {},
    completedExercises: {}
  };
}

function normalizeBehavior(raw) {
  return { ...defaultBehavior(), ...(raw || {}) };
}

function inferFamily(id) {
  if (/^(brisk-walk|low-impact-circuit|shadow-boxing|incline-walk|bike-intervals|rower-intervals|elliptical-intervals|jump-rope)$/.test(id)) return `cardio-${id}`;
  if (id === 'banded-lateral-walk') return 'hip-abduction';
  if (/hip-thrust|glute-bridge|frog-pump/.test(id)) return 'bridge-hip-extension';
  if (/rdl/.test(id)) return 'hip-hinge';
  if (/reverse-lunge|split-squat|step-up/.test(id)) return 'unilateral-knee-dominant';
  if (/squat|leg-press|wall-sit|leg-extension/.test(id)) return 'squat-knee-dominant';
  if (/hamstring-curl|leg-curl/.test(id)) return 'knee-flexion';
  if (/calf/.test(id)) return 'calf-raise';
  if (/pulldown|pullover/.test(id)) return 'vertical-pull';
  if (/row|reverse-snow|prone-w/.test(id)) return 'horizontal-pull';
  if (/shoulder-press|landmine-press/.test(id)) return 'vertical-push';
  if (/pushup|chest-press|floor-press|bench-press|squeeze-press/.test(id)) return 'horizontal-push';
  if (/lateral-raise|rear-delt|face-pull|pull-apart|wall-slide/.test(id)) return 'shoulder-accessory';
  if (/curl/.test(id) && !/hamstring|leg-curl/.test(id)) return 'elbow-flexion';
  if (/triceps|pressdown|kickback|close-grip/.test(id)) return 'elbow-extension';
  if (/dead-bug|heel-taps|reverse-crunch|hollow/.test(id)) return 'anterior-core';
  if (/plank/.test(id)) return 'plank-core';
  if (/bird-dog/.test(id)) return 'contralateral-core';
  if (/pallof/.test(id)) return 'anti-rotation-core';
  if (/9090|rotation|cat-cow|sweep|ankle-rock|stretch|child-pose|side-bend/.test(id)) return `mobility-${id}`;
  return id;
}

function inferPattern(id, focuses, kind) {
  if (kind === 'cardio') return 'conditioning';
  if (kind === 'mobility') return 'mobility';
  const family = inferFamily(id);
  const map = {
    'bridge-hip-extension': 'hip extension',
    'hip-hinge': 'hip hinge',
    'unilateral-knee-dominant': 'single-leg',
    'squat-knee-dominant': 'squat',
    'knee-flexion': 'knee flexion',
    'calf-raise': 'ankle extension',
    'vertical-pull': 'vertical pull',
    'horizontal-pull': 'horizontal pull',
    'vertical-push': 'vertical push',
    'horizontal-push': 'horizontal push',
    'shoulder-accessory': 'shoulder accessory',
    'elbow-flexion': 'arm isolation',
    'elbow-extension': 'arm isolation',
    'anterior-core': 'core control',
    'plank-core': 'core stability',
    'contralateral-core': 'core stability',
    'anti-rotation-core': 'anti-rotation'
  };
  return map[family] || focuses[0] || 'strength';
}

function inferRole(id, kind) {
  if (kind !== 'strength' && kind !== 'time') return kind;
  const compound = /hip-thrust|lunge|split-squat|step-up|squat|leg-press|rdl|row|pulldown|pushup|press|landmine|pallof/.test(id);
  return compound ? 'compound' : 'accessory';
}

function inferDifficulty(id) {
  if (/barbell-back-squat|single-leg-rdl|inverted-row|landmine-press|hollow-hold|jump-rope/.test(id)) return 'advanced';
  if (/bulgarian|split-squat|step-up|barbell-rdl|side-plank|pushup/.test(id)) return 'intermediate';
  return 'beginner';
}

function requiredEquipment(equipment) {
  if (equipment === 'bench') return ['dumbbells', 'bench'];
  return [equipment];
}

function ex(id, name, focuses, muscle, equipment, avoid, cue, kind = 'strength') {
  return {
    id,
    name,
    focuses,
    muscle,
    equipment,
    requires: requiredEquipment(equipment),
    avoid,
    cue,
    kind,
    family: inferFamily(id),
    pattern: inferPattern(id, focuses, kind),
    role: inferRole(id, kind),
    difficulty: inferDifficulty(id),
    video: null
  };
}

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


const savedCurrent = safeLoad(STORAGE.current, null);
const state = {
  view: 'home',
  profile: normalizeProfile(safeLoad(STORAGE.profile, null)),
  history: loadHistory(),
  behavior: normalizeBehavior(safeLoad(STORAGE.behavior, null)),
  workout: savedCurrent?.workout || null,
  answers: savedCurrent?.answers || null,
  activeIndex: savedCurrent?.activeIndex || 0,
  session: {
    active: Boolean(savedCurrent?.session?.active),
    startedAt: null,
    elapsedMs: savedCurrent?.session?.elapsedMs || 0
  },
  restUntil: null,
  timerId: null,
  focusNotice: '',
  onboarding: {
    step: 0,
    draft: null
  },
  settingsDraft: null,
  quickAdjustment: null,
  adjustmentReturn: 'home',
  lastCompletedId: null
};

function nav(active = state.view) {
  return `<nav class="nav" aria-label="Main navigation">
    <button class="${active === 'home' ? 'active' : ''}" onclick="goHome()">Home</button>
    <button class="${active === 'workout' || active === 'active' ? 'active' : ''}" onclick="openLatest()">Workout</button>
    <button class="${active === 'history' || active === 'history-detail' ? 'active' : ''}" onclick="showHistory()">History</button>
  </nav>`;
}

function renderInitial() {
  if (!state.profile.onboarded) {
    startOnboarding();
  } else {
    renderHome();
  }
}

function startOnboarding() {
  stopUiTimer();
  state.onboarding.step = 0;
  state.onboarding.draft = normalizeProfile(state.profile);
  renderOnboarding();
}

const onboardingSteps = ['name', 'goal', 'experience', 'schedule', 'equipment', 'limitations', 'priorities', 'plan'];

function renderOnboarding() {
  stopUiTimer();
  state.view = 'onboarding';
  const draft = state.onboarding.draft;
  const key = onboardingSteps[state.onboarding.step];
  const progress = ((state.onboarding.step + 1) / onboardingSteps.length) * 100;
  const content = onboardingContent(key, draft);
  const canContinue = onboardingCanContinue(key, draft);

  app.innerHTML = `
    <div class="step-header">
      ${state.onboarding.step > 0
        ? '<button class="icon-button" aria-label="Go back" onclick="onboardingBack()">←</button>'
        : '<div class="brand">FORM</div>'}
      <div class="step-meta">
        <span class="step-count">${state.onboarding.step + 1} of ${onboardingSteps.length}</span>
        <div class="progress-track" aria-label="Setup progress">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
    </div>
    ${content}
    <div class="builder-actions">
      <div class="footer-actions ${state.onboarding.step === 0 ? 'single' : ''}">
        ${state.onboarding.step > 0 ? '<button class="ghost-button" onclick="onboardingBack()">Back</button>' : ''}
        <button class="primary-button" ${canContinue ? '' : 'disabled'} onclick="onboardingNext()">
          ${state.onboarding.step === onboardingSteps.length - 1 ? 'Finish setup' : 'Continue'}
        </button>
      </div>
    </div>`;
}

function onboardingContent(key, draft) {
  if (key === 'name') {
    return `
      <section class="hero">
        <div class="eyebrow">Welcome to Form</div>
        <h1>Workouts without the planning.</h1>
        <p class="lede">A few one-time choices help Form make future workouts almost effortless.</p>
      </section>
      <section class="card">
        <label class="field-label" for="firstName">First name</label>
        <input id="firstName" class="text-input" autocomplete="given-name" value="${escapeHtml(draft.firstName)}" placeholder="First name" oninput="setOnboardingField('firstName', this.value)" />
      </section>`;
  }

  if (key === 'goal') {
    return questionLayout(
      'Your primary goal',
      'Form will use this to set the general training volume, rep range, and pace.',
      optionList(goalChoices, draft.goal, "setOnboardingField('goal', VALUE)")
    );
  }

  if (key === 'experience') {
    return questionLayout(
      'Training experience',
      'Choose the option that best matches your current comfort level.',
      optionList(experienceChoices, draft.experience, "setOnboardingField('experience', VALUE)", {
        Beginner: 'New or returning after a long break',
        Intermediate: 'Training consistently with basic movements',
        Advanced: 'Comfortable managing load and technique'
      })
    );
  }

  if (key === 'schedule') {
    return `
      <section class="hero">
        <h2 class="question-title">Your normal schedule</h2>
        <p class="question-copy">These become defaults. You can still shorten or adjust any individual workout.</p>
      </section>
      <section class="card">
        <div class="field-label">Days per week</div>
        <div class="chip-grid six">
          ${[1, 2, 3, 4, 5, 6].map(value => chipButton(
            `${value}`,
            draft.daysPerWeek === value,
            `setOnboardingNumber('daysPerWeek', ${value})`
          )).join('')}
        </div>
        <div class="field-label field-gap">Preferred workout length</div>
        <div class="chip-grid">
          ${[20, 30, 45, 60].map(value => chipButton(
            `${value} min`,
            draft.duration === value,
            `setOnboardingNumber('duration', ${value})`
          )).join('')}
        </div>
      </section>`;
  }

  if (key === 'equipment') {
    return questionLayout(
      'Where do you usually train?',
      'Choose the setup that best represents the equipment normally available.',
      Object.entries(setupPresets)
        .filter(([key]) => key !== 'custom')
        .map(([value, setup]) => optionButton(
          setup.label,
          draft.setup === value,
          `setOnboardingSetup('${value}')`
        )).join('')
    );
  }

  if (key === 'limitations') {
    return `
      <section class="hero">
        <h2 class="question-title">Anything to avoid?</h2>
        <p class="question-copy">Select all that apply. Form uses these as exercise filters, not as a medical screening.</p>
      </section>
      <div class="option-grid">
        ${limitationChoices.map(value => optionButton(
          value,
          draft.limitations.includes(value),
          `toggleOnboardingArray('limitations', '${escapeJs(value)}', true)`
        )).join('')}
      </div>
      <p class="helper">Stop if a movement causes pain. Form cannot diagnose an injury or replace qualified medical guidance.</p>`;
  }

  if (key === 'priorities') {
    return `
      <section class="hero">
        <h2 class="question-title">Any priorities?</h2>
        <p class="question-copy">Optional. Pick up to three areas Form should favor when it has room to choose.</p>
      </section>
      <div class="option-grid two-column">
        ${priorityChoices.map(value => optionButton(
          value,
          draft.musclePriorities.includes(value),
          `toggleOnboardingPriority('${escapeJs(value)}')`,
          true
        )).join('')}
      </div>
      <section class="card">
        <label class="field-label" for="dislikes">Exercises or movements you dislike <span>optional</span></label>
        <input id="dislikes" class="text-input" value="${escapeHtml(draft.dislikes)}" placeholder="Example: burpees, jumping, back squats" oninput="setOnboardingField('dislikes', this.value)" />
      </section>`;
  }

  const recommendation = recommendSplit(draft);
  const selectedSplit = draft.splitMode === 'form' ? recommendation : draft.splitName;
  return `
    <section class="hero">
      <h2 class="question-title">Choose a training plan</h2>
      <p class="question-copy">Form treats a split as a sequence. If you miss a day, the next unfinished workout still comes next.</p>
    </section>
    <div class="option-grid">
      ${optionButton(
        'Let Form choose for me',
        draft.splitMode === 'form',
        "setOnboardingSplitMode('form')",
        false,
        `Recommended: ${recommendation}`
      )}
    </div>
    <div class="focus-section">
      <h3 class="focus-section-title">Choose my split</h3>
      <div class="option-grid">
        ${availableSplits(draft.daysPerWeek).map(name => optionButton(
          name,
          draft.splitMode === 'custom' && selectedSplit === name,
          `chooseOnboardingSplit('${escapeJs(name)}')`,
          false,
          splitDescription(name)
        )).join('')}
      </div>
    </div>`;
}

function questionLayout(title, copy, body) {
  return `
    <section class="hero">
      <h2 class="question-title">${title}</h2>
      <p class="question-copy">${copy}</p>
    </section>
    <div class="option-grid">${body}</div>`;
}

function optionList(values, selected, handlerTemplate, descriptions = {}) {
  return values.map(value => optionButton(
    value,
    selected === value,
    handlerTemplate.replace('VALUE', `'${escapeJs(value)}'`),
    false,
    descriptions[value] || ''
  )).join('');
}

function optionButton(label, selected, onclick, compact = false, description = '') {
  return `<button class="option ${compact ? 'compact' : ''} ${selected ? 'selected' : ''}" aria-pressed="${selected}" onclick="${onclick}">
    <span>${label}${description ? `<small>${description}</small>` : ''}</span>
    <span class="check">✓</span>
  </button>`;
}

function chipButton(label, selected, onclick) {
  return `<button class="chip ${selected ? 'selected' : ''}" aria-pressed="${selected}" onclick="${onclick}">${label}</button>`;
}

function onboardingCanContinue(key, draft) {
  if (key === 'name') return draft.firstName.trim().length > 0;
  if (key === 'equipment') return Boolean(draft.setup);
  if (key === 'plan') return Boolean(draft.splitMode);
  return true;
}

function setOnboardingField(key, value) {
  state.onboarding.draft[key] = value;
  if (key !== 'firstName' && key !== 'dislikes') renderOnboarding();
  if (key === 'firstName') {
    const button = document.querySelector('.builder-actions .primary-button');
    if (button) button.disabled = !value.trim();
  }
}

function setOnboardingNumber(key, value) {
  state.onboarding.draft[key] = Number(value);
  if (key === 'daysPerWeek' && state.onboarding.draft.splitMode === 'form') {
    state.onboarding.draft.splitName = recommendSplit(state.onboarding.draft);
  }
  renderOnboarding();
}

function setOnboardingSetup(value) {
  state.onboarding.draft.setup = value;
  state.onboarding.draft.equipment = [...setupPresets[value].equipment];
  renderOnboarding();
}

function toggleOnboardingArray(key, value, supportsNone = false) {
  let array = [...state.onboarding.draft[key]];
  if (supportsNone) {
    if (value === 'None') {
      array = ['None'];
    } else {
      array = array.filter(item => item !== 'None');
      array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
      if (!array.length) array = ['None'];
    }
  } else {
    array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
  }
  state.onboarding.draft[key] = array;
  renderOnboarding();
}

function toggleOnboardingPriority(value) {
  const priorities = [...state.onboarding.draft.musclePriorities];
  if (priorities.includes(value)) {
    state.onboarding.draft.musclePriorities = priorities.filter(item => item !== value);
  } else if (priorities.length < 3) {
    state.onboarding.draft.musclePriorities = [...priorities, value];
  }
  renderOnboarding();
}

function setOnboardingSplitMode(mode) {
  state.onboarding.draft.splitMode = mode;
  if (mode === 'form') state.onboarding.draft.splitName = recommendSplit(state.onboarding.draft);
  renderOnboarding();
}

function chooseOnboardingSplit(name) {
  state.onboarding.draft.splitMode = 'custom';
  state.onboarding.draft.splitName = name;
  renderOnboarding();
}

function onboardingBack() {
  if (state.onboarding.step > 0) {
    state.onboarding.step -= 1;
    renderOnboarding();
  }
}

function onboardingNext() {
  const key = onboardingSteps[state.onboarding.step];
  if (!onboardingCanContinue(key, state.onboarding.draft)) return;

  if (state.onboarding.step < onboardingSteps.length - 1) {
    state.onboarding.step += 1;
    renderOnboarding();
    return;
  }

  const profile = normalizeProfile(state.onboarding.draft);
  profile.onboarded = true;
  profile.firstName = profile.firstName.trim();
  profile.splitName = profile.splitMode === 'form' ? recommendSplit(profile) : profile.splitName;
  profile.splitSequence = clone(splitDefinitions[profile.splitName]);
  profile.splitIndex = 0;
  profile.updatedAt = new Date().toISOString();
  state.profile = profile;
  safeSave(STORAGE.profile, profile);
  state.onboarding.draft = null;
  renderHome();
}

function availableSplits(days) {
  if (days <= 2) return ['Full Body', 'Upper / Lower', 'Strength-focused'];
  if (days === 3) return ['Full Body', 'Upper / Lower / Full Body', 'Push / Pull / Legs', 'Glute-focused', 'Strength-focused'];
  if (days === 4) return ['Upper / Lower', 'Glute-focused', 'Traditional body-part split', 'Strength-focused'];
  if (days === 5) return ['Upper / Lower / Push / Pull / Legs', 'Glute-focused', 'Traditional body-part split'];
  return ['Push / Pull / Legs repeated', 'Upper / Lower / Push / Pull / Legs', 'Glute-focused'];
}

function recommendSplit(profile) {
  const days = Number(profile.daysPerWeek) || 3;
  if (profile.musclePriorities?.includes('Glutes') && days >= 3) return 'Glute-focused';
  if (profile.goal === 'Get stronger' && days <= 4) return 'Strength-focused';
  if (days <= 2) return 'Full Body';
  if (days === 3) return 'Upper / Lower / Full Body';
  if (days === 4) return 'Upper / Lower';
  if (days === 5) return 'Upper / Lower / Push / Pull / Legs';
  return 'Push / Pull / Legs repeated';
}

function splitDescription(name) {
  const descriptions = {
    'Full Body': 'Train the whole body each session',
    'Upper / Lower': 'Alternate upper-body and lower-body sessions',
    'Push / Pull / Legs': 'Push: chest, shoulders and triceps · Pull: back and biceps',
    'Push / Pull / Legs repeated': 'A repeating six-workout push, pull and legs sequence',
    'Upper / Lower / Full Body': 'Upper, lower, then one full-body session',
    'Upper / Lower / Push / Pull / Legs': 'Five distinct sessions with balanced coverage',
    'Glute-focused': 'Two lower-body sessions with extra glute emphasis',
    'Strength-focused': 'Three full-body strength sessions',
    'Traditional body-part split': 'One main body-area focus per session'
  };
  return descriptions[name] || '';
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getNextPlanStep() {
  const sequence = state.profile.splitSequence?.length
    ? state.profile.splitSequence
    : clone(splitDefinitions[recommendSplit(state.profile)]);
  const index = state.profile.splitIndex % sequence.length;
  return { ...sequence[index], index };
}

function renderHome() {
  stopUiTimer();
  state.view = 'home';

  const total = state.history.length;
  const streak = calculateStreak();
  const totalMinutes = state.history.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
  const greeting = `${greetingForNow()}, ${escapeHtml(state.profile.firstName || 'there')}.`;
  const planStep = getNextPlanStep();
  const adjustedTime = state.quickAdjustment?.time || state.profile.duration;
  const estimate = estimateExerciseCount(adjustedTime, resolveFocuses(planStep.focuses));
  const currentCard = state.workout ? renderCurrentWorkoutCard() : '';

  app.innerHTML = `
    <div class="topbar">
      <div class="brand">FORM</div>
      <button class="icon-button" aria-label="Open menu" onclick="showMenu()">···</button>
    </div>
    <section class="hero home-hero">
      <div class="eyebrow">${greeting}</div>
      <h1>${state.workout ? 'Ready when you are.' : 'Today’s workout'}</h1>
    </section>
    ${currentCard || `
      <section class="card today-card">
        <div class="eyebrow">${escapeHtml(state.profile.splitName)}</div>
        <h2 class="today-title">${escapeHtml(planStep.title)}</h2>
        <p class="today-meta">${adjustedTime} min · about ${estimate} exercises</p>
        <button class="primary-button" onclick="startPlanWorkout()">Start workout</button>
        <button class="text-button centered" onclick="openAdjustment('home')">${state.quickAdjustment ? 'Edit adjustment' : 'Adjust workout'}</button>
      </section>
      <button class="choose-other" onclick="chooseSomethingElse()">Choose something else</button>
    `}
    <div class="quick-stats">
      <div class="stat"><strong>${total}</strong><span>workouts</span></div>
      <div class="stat"><strong>${streak}</strong><span>day streak</span></div>
      <div class="stat"><strong>${totalMinutes}</strong><span>minutes</span></div>
    </div>
    ${nav('home')}`;
}

function renderCurrentWorkoutCard() {
  const label = state.session.active ? 'In progress' : 'Ready when you are';
  const action = state.session.active ? 'resumeWorkout()' : 'showWorkout()';
  const button = state.session.active ? 'Continue workout' : 'Open workout';
  return `
    <section class="card today-card">
      <div class="eyebrow">${label}</div>
      <h2 class="today-title">${escapeHtml(state.workout.title)}</h2>
      <p class="today-meta">${state.workout.exercises.length} exercises · ${state.answers?.time || state.profile.duration} min</p>
      <button class="primary-button" onclick="${action}">${button}</button>
      ${state.session.active ? '' : '<button class="text-button centered" onclick="confirmDiscardWorkout()">Choose something else</button>'}
    </section>`;
}

function confirmDiscardWorkout() {
  showModal(
    'Choose something else?',
    'The workout currently prepared will be discarded.',
    `<div class="modal-actions">
      <button class="primary-button" onclick="closeCurrentModal(); discardCurrentAndChoose()">Choose something else</button>
      <button class="ghost-button" onclick="closeCurrentModal()">Keep this workout</button>
    </div>`
  );
}

function discardCurrentAndChoose() {
  state.workout = null;
  state.answers = null;
  state.activeIndex = 0;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.restUntil = null;
  safeRemove(STORAGE.current);
  chooseSomethingElse();
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

function estimateExerciseCount(minutes, focuses) {
  if (focuses.length === 1 && focuses[0] === 'Cardio') return minutes <= 25 ? 2 : 3;
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return minutes <= 25 ? 4 : 6;
  return minutes <= 20 ? 3 : minutes <= 30 ? 4 : minutes <= 45 ? 5 : minutes <= 60 ? 6 : 7;
}

function startPlanWorkout() {
  const step = getNextPlanStep();
  const adjustment = consumeAdjustment();
  state.answers = sessionAnswers(step.focuses, 'plan', adjustment);
  state.answers.planIndex = step.index;
  state.answers.planTitle = step.title;
  generateWorkout();
}

function chooseSomethingElse() {
  stopUiTimer();
  state.view = 'focus';
  state.focusNotice = '';
  state.answers = sessionAnswers([], 'custom', state.quickAdjustment || defaultAdjustment());
  renderFocusPicker();
}

function renderFocusPicker() {
  const selected = state.answers.focuses || [];
  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Back home" onclick="renderHome()">←</button>
      <div class="brand">FORM</div>
      <div style="width:44px"></div>
    </div>
    <section class="hero">
      <h2 class="question-title">What do you want to train?</h2>
      <p class="question-copy">Choose one area or combine up to four. Your normal goal, equipment, and preferences are already applied.</p>
    </section>
    <div class="selection-summary">${selected.length ? `${selected.length} selected` : 'Nothing selected yet'}</div>
    ${focusSections.map(section => `
      <section class="focus-section">
        <h3 class="focus-section-title">${section.title}</h3>
        <div class="option-grid two-column">
          ${section.options.map(option => focusOption(option, selected)).join('')}
        </div>
      </section>`).join('')}
    ${state.focusNotice ? `<p class="inline-note">${state.focusNotice}</p>` : ''}
    <div class="builder-actions">
      <button class="primary-button" ${selected.length ? '' : 'disabled'} onclick="buildCustomWorkout()">Build workout</button>
      <button class="text-button centered" onclick="openAdjustment('focus')">${adjustmentLabel()}</button>
    </div>`;
}

function focusOption(option, selected) {
  const active = selected.includes(option);
  return optionButton(option, active, `toggleFocus('${escapeJs(option)}')`, true);
}

function toggleFocus(option) {
  let selected = [...(state.answers.focuses || [])];
  state.focusNotice = '';

  if (selected.includes(option)) {
    selected = selected.filter(item => item !== option);
  } else if (specialFocuses.includes(option)) {
    selected = [option];
  } else {
    selected = selected.filter(item => !specialFocuses.includes(item));
    if (selected.length >= 4) {
      state.focusNotice = 'Choose up to four areas so every selection can be represented.';
      renderFocusPicker();
      return;
    }
    selected.push(option);
  }

  state.answers.focuses = selected;
  renderFocusPicker();
}

function buildCustomWorkout() {
  if (!state.answers.focuses?.length) return;
  const adjustment = consumeAdjustment();
  state.answers = sessionAnswers(state.answers.focuses, 'custom', adjustment);
  generateWorkout();
}

function defaultAdjustment() {
  return {
    time: state.profile.duration,
    intensity: 'Standard',
    temporaryAvoid: ['None']
  };
}

function sessionAnswers(focuses, source, adjustment) {
  const extraAvoid = adjustment?.temporaryAvoid || ['None'];
  const limitations = mergeLimitations(state.profile.limitations, extraAvoid);
  return {
    focuses: [...focuses],
    goal: state.profile.goal,
    time: adjustment?.time || state.profile.duration,
    equipment: [...state.profile.equipment],
    limitations,
    intensity: adjustment?.intensity || 'Standard',
    experience: state.profile.experience,
    source
  };
}

function mergeLimitations(base, extra) {
  const merged = [...new Set([
    ...(base || []).filter(item => item !== 'None'),
    ...(extra || []).filter(item => item !== 'None')
  ])];
  return merged.length ? merged : ['None'];
}

function openAdjustment(returnTo) {
  stopUiTimer();
  state.adjustmentReturn = returnTo;
  state.quickAdjustment = clone(state.quickAdjustment || defaultAdjustment());
  renderAdjustment();
}

function renderAdjustment() {
  state.view = 'adjust';
  const adjustment = state.quickAdjustment;
  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Go back" onclick="cancelAdjustment()">←</button>
      <div class="brand">FORM</div>
      <div style="width:44px"></div>
    </div>
    <section class="hero">
      <h2 class="question-title">Adjust workout</h2>
      <p class="question-copy">Only change what is different today.</p>
    </section>
    <section class="card">
      <div class="field-label">Time available</div>
      <div class="chip-grid">
        ${[15, 20, 30, 45, 60, 75].map(value => chipButton(
          `${value} min`,
          adjustment.time === value,
          `setAdjustmentTime(${value})`
        )).join('')}
      </div>
      <div class="field-label field-gap">Difficulty today</div>
      <div class="chip-grid three">
        ${['Easier', 'Standard', 'Harder'].map(value => chipButton(
          value,
          adjustment.intensity === value,
          `setAdjustmentIntensity('${value}')`
        )).join('')}
      </div>
    </section>
    <section class="card">
      <div class="field-label">Avoid today</div>
      <p class="helper" style="margin-top:0">Temporary selections apply only to the next workout.</p>
      <div class="option-grid">
        ${limitationChoices.map(value => optionButton(
          value,
          adjustment.temporaryAvoid.includes(value),
          `toggleAdjustmentAvoid('${escapeJs(value)}')`,
          true
        )).join('')}
      </div>
    </section>
    <div class="builder-actions">
      <button class="primary-button" onclick="saveAdjustment()">Save adjustment</button>
      <button class="text-button centered" onclick="resetAdjustment()">Reset to normal</button>
    </div>`;
}

function setAdjustmentTime(value) {
  state.quickAdjustment.time = Number(value);
  renderAdjustment();
}

function setAdjustmentIntensity(value) {
  state.quickAdjustment.intensity = value;
  renderAdjustment();
}

function toggleAdjustmentAvoid(value) {
  let array = [...state.quickAdjustment.temporaryAvoid];
  if (value === 'None') {
    array = ['None'];
  } else {
    array = array.filter(item => item !== 'None');
    array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
    if (!array.length) array = ['None'];
  }
  state.quickAdjustment.temporaryAvoid = array;
  renderAdjustment();
}

function saveAdjustment() {
  if (state.adjustmentReturn === 'focus') renderFocusPicker();
  else renderHome();
}

function cancelAdjustment() {
  if (state.adjustmentReturn === 'focus') renderFocusPicker();
  else renderHome();
}

function resetAdjustment() {
  state.quickAdjustment = null;
  if (state.adjustmentReturn === 'focus') renderFocusPicker();
  else renderHome();
}

function adjustmentLabel() {
  const adjustment = state.quickAdjustment;
  if (!adjustment) return `Adjust workout · ${state.profile.duration} min`;
  const parts = [`${adjustment.time} min`];
  if (adjustment.intensity !== 'Standard') parts.push(adjustment.intensity);
  if (!adjustment.temporaryAvoid.includes('None')) parts.push('temporary caution');
  return `Adjusted · ${parts.join(' · ')}`;
}

function consumeAdjustment() {
  const adjustment = clone(state.quickAdjustment || defaultAdjustment());
  state.quickAdjustment = null;
  return adjustment;
}

function resolveFocuses(selected) {
  if (selected.includes('Full body')) {
    return ['Legs', 'Chest', 'Back', 'Glutes', 'Core', 'Shoulders'];
  }
  if (selected.includes('Upper body')) {
    return ['Back', 'Chest', 'Shoulders', 'Arms'];
  }
  if (selected.includes('Pick for me')) {
    return pickFocusesFromHistory();
  }
  return [...selected];
}

function pickFocusesFromHistory() {
  const pool = ['Glutes', 'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'];
  const counts = Object.fromEntries(pool.map(focus => [focus, 0]));
  state.history.slice(0, 5).forEach((workout, index) => {
    const weight = 5 - index;
    (workout.focuses || []).forEach(focus => {
      if (counts[focus] !== undefined) counts[focus] += weight;
    });
  });
  state.profile.musclePriorities.forEach(focus => {
    if (counts[focus] !== undefined) counts[focus] -= 2;
  });
  const ranked = pool.sort((a, b) => counts[a] - counts[b]);
  return ranked.slice(0, state.answers.time <= 25 ? 2 : 3);
}

function generateWorkout() {
  const resolvedFocuses = resolveFocuses(state.answers.focuses);
  const eligible = exerciseLibrary.filter(item => isEligible(item, state.answers));
  const desiredCount = getExerciseCount(state.answers.time, resolvedFocuses);
  const selectedExercises = balancedPick(eligible, resolvedFocuses, desiredCount);

  if (!selectedExercises.length) {
    showModal(
      'No matching workout found',
      'The current equipment, caution areas, and exercise preferences removed every available option for this combination.',
      `<div class="modal-actions">
        <button class="primary-button" onclick="closeCurrentModal(); chooseSomethingElse()">Choose another focus</button>
        <button class="ghost-button" onclick="closeCurrentModal(); showEquipmentSettings()">Review equipment</button>
      </div>`
    );
    return;
  }

  const prescription = getBasePrescription();
  const exercises = selectedExercises.map((item, index) => prescribeExercise(item, prescription, index));
  const limitationNote = buildLimitationNote();
  const goalNote = state.answers.goal === 'Lose fat / get leaner'
    ? 'This workout supports fitness and energy expenditure. Fat loss cannot be targeted to one body area.'
    : '';

  state.workout = {
    id: `workout-${Date.now()}`,
    title: state.answers.planTitle || workoutTitle(state.answers.focuses),
    note: `${state.answers.goal} · ${equipmentSummary(state.answers.equipment)}`,
    focuses: [...state.answers.focuses],
    resolvedFocuses,
    source: state.answers.source,
    planIndex: state.answers.planIndex,
    warmup: state.answers.time <= 20 ? 3 : state.answers.time <= 35 ? 4 : 6,
    cooldown: resolvedFocuses.includes('Mobility + recovery') ? 5 : (state.answers.time <= 20 ? 2 : 3),
    guidance: [goalNote, limitationNote, buildTimeNote(resolvedFocuses)].filter(Boolean),
    exercises,
    swaps: [],
    skipped: [],
    rejectedFamilies: []
  };

  state.activeIndex = 0;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.restUntil = null;
  persistCurrent();
  showWorkout();
}

function equipmentSummary(equipment) {
  const matchingPreset = Object.entries(setupPresets)
    .find(([key, preset]) => key !== 'custom' && arraysEqualSets(preset.equipment, equipment));
  return matchingPreset ? matchingPreset[1].label : 'Custom equipment';
}

function arraysEqualSets(a, b) {
  const first = [...new Set(a)].sort();
  const second = [...new Set(b)].sort();
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function isEligible(item, answers) {
  if (!item.requires.every(required => answers.equipment.includes(required))) return false;

  const limitations = answers.limitations
    .filter(value => value !== 'None')
    .map(value => value.toLowerCase());

  if (item.avoid.some(area => limitations.includes(area))) return false;

  if (answers.experience === 'Beginner' && item.difficulty === 'advanced') return false;

  const dislikes = String(state.profile.dislikes || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);

  if (dislikes.some(dislike =>
    item.name.toLowerCase().includes(dislike) ||
    item.family.toLowerCase().includes(dislike) ||
    item.pattern.toLowerCase().includes(dislike)
  )) return false;

  return true;
}

function getExerciseCount(minutes, focuses) {
  if (focuses.length === 1 && focuses[0] === 'Cardio') return minutes <= 25 ? 2 : 3;
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return minutes <= 25 ? 4 : 6;

  let count = estimateExerciseCount(minutes, focuses);
  count = Math.max(count, Math.min(focuses.length, 4));

  const singleFocus = state.answers.focuses.length === 1 ? state.answers.focuses[0] : '';
  if (['Calves', 'Arms'].includes(singleFocus)) count = Math.min(count, 4);

  if (state.answers.intensity === 'Easier') count = Math.max(Math.min(focuses.length, 4), count - 1);
  if (state.answers.intensity === 'Harder' && minutes >= 40) count += 1;
  return Math.min(count, 8);
}

function buildTimeNote(resolvedFocuses) {
  if (state.answers.time <= 20 && resolvedFocuses.length >= 3) {
    return 'Form kept the highest-value movements and reduced working sets to fit the shorter session.';
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
    .map(item => ({ item, score: exercisePriority(item, focus) + Math.random() * 0.15 }))
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
    const remaining = eligible
      .filter(item => !used.has(item.id) && item.focuses.some(focus => focusSet.has(focus)))
      .sort((a, b) => exercisePriority(b, focuses[0]) - exercisePriority(a, focuses[0]));
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
  if (state.profile.musclePriorities.some(priority => item.focuses.includes(priority))) score += 1.25;
  if (recentExerciseIds().has(item.id)) score -= 1.25;
  score -= (state.behavior.exerciseRejects[item.id] || 0) * 1.5;
  score -= (state.behavior.familyRejects[item.family] || 0) * 0.4;
  score -= (state.behavior.exerciseSkips[item.id] || 0) * 0.8;
  return score;
}

function recentExerciseIds() {
  const ids = new Set();
  state.history.slice(0, 3).forEach(workout => {
    (workout.details || []).forEach(detail => {
      if (detail.id) ids.add(detail.id);
    });
  });
  return ids;
}

function getBasePrescription() {
  const base = {
    'Lose fat / get leaner': { sets: 3, reps: '10–15', rest: 45 },
    'Build muscle': { sets: 3, reps: '8–12', rest: 75 },
    'Maintain': { sets: 3, reps: '8–12', rest: 60 },
    'Get stronger': { sets: 4, reps: '5–8', rest: 120 },
    'General fitness': { sets: 3, reps: '8–12', rest: 60 }
  }[state.answers.goal];

  const result = { ...base };

  if (state.answers.time <= 20) {
    result.sets = state.answers.focuses.length >= 3 ? 1 : 2;
    result.rest = Math.min(result.rest, state.answers.goal === 'Get stronger' ? 90 : 60);
  } else if (state.answers.time <= 30) {
    result.sets = Math.min(result.sets, 3);
  }

  if (state.answers.experience === 'Beginner') result.sets = Math.min(result.sets, 3);
  if (state.answers.intensity === 'Easier') result.sets = Math.max(1, result.sets - 1);
  if (state.answers.intensity === 'Harder' && state.answers.time >= 40) result.sets += 1;

  return result;
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
  } else if (index > 2 && state.answers.time <= 30) {
    sets = Math.max(2, sets - 1);
  }

  const performance = getPreviousPerformance(item, reps);
  const prefillWeight = performance?.recommendedWeight ?? performance?.lastWeight ?? '';

  return {
    ...item,
    sets,
    reps,
    rest,
    previousPerformance: performance?.summary || '',
    recommendedWeight: performance?.recommendedWeight || '',
    setData: Array.from({ length: sets }, () => ({
      weight: item.kind === 'strength' ? String(prefillWeight || '') : '',
      reps: '',
      done: false
    }))
  };
}

function getPreviousPerformance(item, currentRepRange) {
  const record = findLastExerciseRecord(item.id, item.name);
  if (!record) return null;

  const completed = (record.detail.sets || []).filter(set => set.done);
  if (!completed.length) return null;

  const weighted = completed.filter(set => Number(set.weight) > 0);
  const lastWeighted = weighted.at(-1);
  const repValues = completed.map(set => Number(set.reps)).filter(Number.isFinite);
  const bestReps = repValues.length ? Math.max(...repValues) : null;
  const lastWeight = lastWeighted ? Number(lastWeighted.weight) : null;

  let summary = '';
  if (lastWeight && bestReps) summary = `${formatNumber(lastWeight)} lb × ${bestReps}`;
  else if (bestReps) summary = `${bestReps} reps`;
  else if (lastWeight) summary = `${formatNumber(lastWeight)} lb`;

  let recommendedWeight = null;
  const upper = repRangeUpper(currentRepRange);
  const allAtTop = upper && completed.length && completed.every(set => Number(set.reps) >= upper);
  const hardLastTime = record.workout.feedback === 'Too hard';

  if (lastWeight && allAtTop && !hardLastTime) {
    const increment = progressionIncrement(item);
    recommendedWeight = roundToIncrement(lastWeight + increment, increment);
  }

  return {
    summary,
    lastWeight,
    bestReps,
    recommendedWeight
  };
}

function findLastExerciseRecord(id, name) {
  for (const workout of state.history) {
    const detail = (workout.details || []).find(item =>
      (id && item.id === id) || (!item.id && item.name === name)
    );
    if (detail) return { workout, detail };
  }
  return null;
}

function repRangeUpper(value) {
  const numbers = String(value).match(/\d+/g);
  return numbers?.length ? Number(numbers.at(-1)) : null;
}

function progressionIncrement(item) {
  if (
    item.role === 'accessory' ||
    ['shoulder-accessory', 'elbow-flexion', 'elbow-extension', 'calf-raise'].includes(item.family)
  ) {
    return 2.5;
  }
  return 5;
}

function roundToIncrement(value, increment) {
  return Math.round(value / increment) * increment;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function buildLimitationNote() {
  const limits = state.answers.limitations.filter(item => item !== 'None');
  if (!limits.length) return '';
  return `Exercises tagged for ${formatList(limits).toLowerCase()} were removed. Stop if any movement causes pain.`;
}

function workoutTitle(selected) {
  if (selected.includes('Full body')) return 'Full Body';
  if (selected.includes('Upper body')) return 'Upper Body';
  if (selected.includes('Pick for me')) return 'Today’s Mix';
  if (selected.length === 1) {
    const single = selected[0];
    if (single === 'Mobility + recovery') return 'Mobility + Recovery';
    return `${single} Focus`;
  }
  return formatList(selected);
}

function formatList(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} + ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} + ${items.at(-1)}`;
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
        <h2>${escapeHtml(workout.title)}</h2>
        <div class="workout-meta">${escapeHtml(workout.note)} · ${state.answers.time} min</div>
      </div>
      <div class="badge">${workout.exercises.length} moves</div>
    </section>
    ${workout.guidance.map(note => `
      <section class="card" style="margin-bottom:14px">
        <div class="plan-note">
          <div class="plan-note-icon">i</div>
          <p class="helper" style="margin:2px 0 0">${escapeHtml(note)}</p>
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
      <div class="exercise-number">${String(index + 1).padStart(2, '0')} · ${escapeHtml(item.muscle)}</div>
      <div class="exercise-name">${escapeHtml(item.name)}</div>
      <div class="exercise-prescription">${item.sets} ${item.sets === 1 ? 'set' : 'sets'} · ${escapeHtml(item.reps)} · ${item.rest}s rest</div>
      ${item.previousPerformance ? `<div class="previous-line">Last time: ${escapeHtml(item.previousPerformance)}</div>` : ''}
      ${item.recommendedWeight ? `<div class="suggestion-line">Try ${escapeHtml(formatNumber(Number(item.recommendedWeight)))} lb today</div>` : ''}
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
  const rejectedFamilies = new Set(state.workout.rejectedFamilies || []);

  const candidates = exerciseLibrary
    .filter(item =>
      item.id !== current.id &&
      !usedIds.has(item.id) &&
      item.kind === current.kind &&
      item.family !== current.family &&
      !rejectedFamilies.has(item.family) &&
      item.focuses.some(focus => current.focuses.includes(focus)) &&
      isEligible(item, state.answers)
    )
    .map(item => {
      let score = 0;
      if (item.focuses[0] === current.focuses[0]) score += 4;
      if (item.role === current.role) score += 2;
      if (item.muscle === current.muscle) score += 2;
      score -= (state.behavior.exerciseRejects[item.id] || 0) * 2;
      score -= (state.behavior.familyRejects[item.family] || 0);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.item || null;
}

function replacementWithSamePrescription(replacement, current) {
  const performance = getPreviousPerformance(replacement, current.reps);
  const prefillWeight = performance?.recommendedWeight ?? performance?.lastWeight ?? '';
  return {
    ...replacement,
    sets: current.sets,
    reps: current.reps,
    rest: current.rest,
    previousPerformance: performance?.summary || '',
    recommendedWeight: performance?.recommendedWeight || '',
    setData: Array.from({ length: current.sets }, () => ({
      weight: replacement.kind === 'strength' ? String(prefillWeight || '') : '',
      reps: '',
      done: false
    }))
  };
}

function recordSwap(current, replacement) {
  state.workout.rejectedFamilies = [...new Set([...(state.workout.rejectedFamilies || []), current.family])];
  state.workout.swaps.push({
    fromId: current.id,
    from: current.name,
    fromFamily: current.family,
    toId: replacement.id,
    to: replacement.name,
    toFamily: replacement.family,
    at: new Date().toISOString()
  });
  state.behavior.exerciseRejects[current.id] = (state.behavior.exerciseRejects[current.id] || 0) + 1;
  state.behavior.familyRejects[current.family] = (state.behavior.familyRejects[current.family] || 0) + 1;
  safeSave(STORAGE.behavior, state.behavior);
}

function swapExercise(index) {
  const replacement = findSwap(index);
  if (!replacement) return;
  const current = state.workout.exercises[index];
  recordSwap(current, replacement);
  state.workout.exercises[index] = replacementWithSamePrescription(replacement, current);
  persistCurrent();
  showWorkout();
}

function showTip(index) {
  const item = state.workout.exercises[index];
  const cues = cueSteps(item.cue);
  showModal(
    item.name,
    '',
    `<ol class="cue-list">${cues.map(cue => `<li>${escapeHtml(cue)}</li>`).join('')}</ol>
     <div class="modal-actions">
       <button class="primary-button" onclick="closeCurrentModal()">Done</button>
     </div>`
  );
}

function cueSteps(cue) {
  const clean = String(cue).replace(/\.$/, '');
  const parts = clean.split(/,\s+|\s+and\s+/i).map(part => part.trim()).filter(Boolean);
  return parts.slice(0, 3).map(part => part.charAt(0).toUpperCase() + part.slice(1));
}

function confirmRegenerate() {
  const message = state.session.active
    ? 'Creating a new workout will discard the workout currently in progress.'
    : 'Create another workout using the same focus and preferences?';
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
  const completedCount = item.setData.filter(set => set.done).length;
  const advanceLabel = completedCount
    ? (state.activeIndex === state.workout.exercises.length - 1 ? 'Finish workout' : 'Next exercise')
    : (state.activeIndex === state.workout.exercises.length - 1 ? 'Finish and skip' : 'Skip exercise');

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
          <h2>${escapeHtml(item.name)}</h2>
          <p class="workout-meta">${escapeHtml(item.reps)} · ${item.rest}s rest</p>
        </div>
      </div>
      ${item.previousPerformance ? `<div class="previous-line">Last time: ${escapeHtml(item.previousPerformance)}</div>` : ''}
      ${item.recommendedWeight ? `<div class="suggestion-line">Suggested today: ${escapeHtml(formatNumber(Number(item.recommendedWeight)))} lb</div>` : ''}
      <div class="exercise-actions active-card-actions">
        <button class="pill-button" onclick="showTip(${state.activeIndex})">How to</button>
        <button class="pill-button" ${findSwap(state.activeIndex) ? '' : 'disabled'} onclick="swapActive()">Swap</button>
      </div>
      <div class="set-label-row">
        <span>Set</span><span>${item.kind === 'strength' ? 'Weight' : 'Level'}</span><span>${item.kind === 'time' || item.kind === 'cardio' ? 'Time' : 'Reps'}</span><span>Done</span>
      </div>
      <div>${item.setData.map((set, index) => setRow(index, set, item)).join('')}</div>
    </section>
    <div class="active-actions">
      <button class="${completedCount ? 'primary-button' : 'ghost-button'}" onclick="advanceExercise()">${advanceLabel}</button>
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
  } else if (!item.setData[setIndex].done) {
    state.restUntil = null;
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
  const strip = document.getElementById('restStrip');
  if (strip) strip.classList.add('hidden');
}

function swapActive() {
  pauseSessionClock();
  const replacement = findSwap(state.activeIndex);
  if (!replacement) {
    showModal('No different swap available', 'No other movement family fits the current target, equipment, and caution selections.');
    state.session.startedAt = Date.now();
    return;
  }
  const current = state.workout.exercises[state.activeIndex];
  recordSwap(current, replacement);
  state.workout.exercises[state.activeIndex] = replacementWithSamePrescription(replacement, current);
  state.session.startedAt = Date.now();
  persistCurrent();
  renderActive();
}

function advanceExercise() {
  const item = state.workout.exercises[state.activeIndex];
  const completed = item.setData.some(set => set.done);

  if (!completed && !state.workout.skipped.includes(item.id)) {
    state.workout.skipped.push(item.id);
    state.behavior.exerciseSkips[item.id] = (state.behavior.exerciseSkips[item.id] || 0) + 1;
    safeSave(STORAGE.behavior, state.behavior);
  }

  if (completed) {
    state.behavior.completedExercises[item.id] = (state.behavior.completedExercises[item.id] || 0) + 1;
    safeSave(STORAGE.behavior, state.behavior);
  }

  if (state.activeIndex < state.workout.exercises.length - 1) {
    state.activeIndex += 1;
    state.restUntil = null;
    persistCurrent();
    renderActive();
  } else {
    finishWorkout();
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

function finishWorkout() {
  pauseSessionClock();
  stopUiTimer();

  const completedSets = state.workout.exercises.reduce(
    (sum, item) => sum + item.setData.filter(set => set.done).length,
    0
  );

  const record = {
    id: `history-${Date.now()}`,
    date: new Date().toISOString(),
    title: state.workout.title,
    minutes: Math.max(1, Math.round(state.session.elapsedMs / 60000)),
    exercises: state.workout.exercises.length,
    completedSets,
    focuses: [...state.workout.focuses],
    source: state.workout.source,
    feedback: 'Not rated',
    swaps: clone(state.workout.swaps || []),
    skipped: [...(state.workout.skipped || [])],
    details: state.workout.exercises.map(item => ({
      id: item.id,
      name: item.name,
      family: item.family,
      pattern: item.pattern,
      muscle: item.muscle,
      kind: item.kind,
      prescription: {
        sets: item.sets,
        reps: item.reps,
        rest: item.rest
      },
      skipped: state.workout.skipped.includes(item.id),
      sets: item.setData.map(set => ({ ...set }))
    }))
  };

  state.history.unshift(record);
  safeSave(STORAGE.history, state.history);

  if (
    state.workout.source === 'plan' &&
    Number(state.workout.planIndex) === Number(state.profile.splitIndex)
  ) {
    state.profile.splitIndex = (state.profile.splitIndex + 1) % state.profile.splitSequence.length;
    state.profile.updatedAt = new Date().toISOString();
    safeSave(STORAGE.profile, state.profile);
  }

  state.lastCompletedId = record.id;
  state.workout = null;
  state.answers = null;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.activeIndex = 0;
  state.restUntil = null;
  safeRemove(STORAGE.current);
  renderCompletion(record.id);
}

function renderCompletion(id) {
  state.view = 'completion';
  const record = state.history.find(item => item.id === id);
  if (!record) {
    renderHome();
    return;
  }

  app.innerHTML = `
    <div class="topbar">
      <div class="brand">FORM</div>
      <button class="text-button" onclick="renderHome()">Done</button>
    </div>
    <section class="hero">
      <div class="eyebrow">Complete</div>
      <h1>Nicely done.</h1>
      <p class="lede">${record.minutes} minutes · ${record.completedSets} completed sets</p>
    </section>
    <section class="card">
      <h2 class="question-title" style="font-size:28px">How did that feel?</h2>
      <p class="question-copy">Optional. This helps the workout history reflect how the session actually felt.</p>
      <div class="chip-grid three">
        ${['Too easy', 'Just right', 'Too hard'].map(value => chipButton(
          value,
          record.feedback === value,
          `setCompletionFeedback('${escapeJs(id)}', '${escapeJs(value)}')`
        )).join('')}
      </div>
      <button class="primary-button field-gap" onclick="renderHome()">Done</button>
      <button class="text-button centered" onclick="shareFeedback()">Send beta feedback</button>
    </section>`;
}

function setCompletionFeedback(id, feedback) {
  const record = state.history.find(item => item.id === id);
  if (!record) return;
  record.feedback = feedback;
  safeSave(STORAGE.history, state.history);
  renderCompletion(id);
}

function persistCurrent() {
  if (!state.workout) {
    safeRemove(STORAGE.current);
    return;
  }

  safeSave(STORAGE.current, {
    answers: state.answers,
    workout: state.workout,
    activeIndex: state.activeIndex,
    session: {
      active: state.session.active,
      elapsedMs: getElapsedMs()
    }
  });
}

function showHistory() {
  stopUiTimer();
  state.view = 'history';
  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Back home" onclick="renderHome()">←</button>
      <div class="brand">FORM</div>
      <div style="width:44px"></div>
    </div>
    <section class="hero">
      <div class="eyebrow">Progress</div>
      <h2 class="question-title">Workout history</h2>
      <p class="question-copy">Open a workout to review the exercises, sets, reps, weights, swaps, and skips.</p>
    </section>
    <section class="card history-card">
      ${state.history.length
        ? state.history.map(historyItem).join('')
        : '<div class="empty">Completed workouts will appear here.</div>'}
    </section>
    ${nav('history')}`;
}

function historyItem(item) {
  const focusText = item.focuses?.length ? formatList(item.focuses) : item.title;
  return `<button class="history-item-button" onclick="showHistoryDetail('${escapeJs(item.id)}')">
    <span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${escapeHtml(focusText)}</small>
    </span>
    <span class="history-right">
      <strong>${item.minutes} min</strong>
      <small>${item.feedback || `${item.exercises} moves`}</small>
    </span>
  </button>`;
}

function showHistoryDetail(id) {
  stopUiTimer();
  state.view = 'history-detail';
  const workout = state.history.find(item => item.id === id);
  if (!workout) {
    showHistory();
    return;
  }

  app.innerHTML = `
    <div class="topbar">
      <button class="icon-button" aria-label="Back to history" onclick="showHistory()">←</button>
      <div class="brand">FORM</div>
      <div style="width:44px"></div>
    </div>
    <section class="workout-head">
      <div>
        <div class="eyebrow">${new Date(workout.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <h2>${escapeHtml(workout.title)}</h2>
        <div class="workout-meta">${workout.minutes} min · ${workout.completedSets || 0} completed sets · ${escapeHtml(workout.feedback || 'Not rated')}</div>
      </div>
    </section>
    <section class="exercise-list">
      ${(workout.details || []).map((detail, index) => historyExercise(detail, index)).join('')}
    </section>
    ${(workout.swaps || []).length ? `
      <section class="card">
        <div class="eyebrow">Swaps</div>
        ${(workout.swaps || []).map(swap => `<p class="history-note">${escapeHtml(swap.from)} → ${escapeHtml(swap.to)}</p>`).join('')}
      </section>` : ''}
    ${nav('history-detail')}`;
}

function historyExercise(detail, index) {
  const completed = (detail.sets || []).filter(set => set.done);
  return `<article class="exercise-card">
    <div class="exercise-main">
      <div class="exercise-number">${String(index + 1).padStart(2, '0')} · ${escapeHtml(detail.muscle || detail.pattern || '')}</div>
      <div class="exercise-name">${escapeHtml(detail.name)}</div>
      ${detail.skipped ? '<div class="skip-label">Skipped</div>' : ''}
      ${completed.length
        ? `<div class="set-summary-list">${completed.map((set, setIndex) => {
            const pieces = [];
            if (set.weight) pieces.push(`${escapeHtml(set.weight)} lb`);
            if (set.reps) pieces.push(`${escapeHtml(set.reps)} reps`);
            return `<div><span>Set ${setIndex + 1}</span><strong>${pieces.join(' × ') || 'Completed'}</strong></div>`;
          }).join('')}</div>`
        : '<p class="helper">No completed sets recorded.</p>'}
    </div>
  </article>`;
}

function showMenu() {
  showModal(
    'Form',
    '',
    `<div class="menu-list">
      ${menuItem('Profile', 'Name, experience and body-weight history', 'showProfileSettings()')}
      ${menuItem('Training Plan', 'Days per week and workout sequence', 'showTrainingPlanSettings()')}
      ${menuItem('Equipment', 'What Form can use', 'showEquipmentSettings()')}
      ${menuItem('Preferences', 'Goal, duration, limitations and priorities', 'showPreferencesSettings()')}
      ${menuItem('History', 'Review completed workouts', 'showHistory()')}
      ${menuItem('About Me', 'Why Form was created', 'showAboutMe()')}
      ${menuItem('Help / Send Feedback', 'Share a beta bug or suggestion', 'showHelp()')}
    </div>`
  );
}

function menuItem(title, subtitle, action) {
  return `<button class="menu-item" onclick="closeCurrentModal(); ${action}">
    <span><strong>${title}</strong><small>${subtitle}</small></span><span>›</span>
  </button>`;
}

function startSettings(section) {
  stopUiTimer();
  state.view = `settings-${section}`;
  state.settingsDraft = clone(state.profile);
}

function settingsHeader(title, backAction = 'renderHome()') {
  return `<div class="topbar">
    <button class="icon-button" aria-label="Go back" onclick="${backAction}">←</button>
    <div class="brand">${title}</div>
    <div style="width:44px"></div>
  </div>`;
}

function showProfileSettings() {
  startSettings('profile');
  renderProfileSettings();
}

function renderProfileSettings() {
  const draft = state.settingsDraft;
  const latestWeight = draft.weightHistory.at(-1)?.weight || '';

  app.innerHTML = `
    ${settingsHeader('Profile')}
    <section class="hero">
      <h2 class="question-title">Profile</h2>
      <p class="question-copy">Edit the information Form uses to personalize the experience.</p>
    </section>
    <section class="card">
      <label class="field-label" for="profileFirst">First name</label>
      <input id="profileFirst" class="text-input" value="${escapeHtml(draft.firstName)}" oninput="setSettingsField('firstName', this.value)" />
      <div class="field-label field-gap">Training experience</div>
      <div class="chip-grid three">
        ${experienceChoices.map(value => chipButton(value, draft.experience === value, `setSettingsFieldAndRender('experience', '${value}', 'profile')`)).join('')}
      </div>
    </section>
    <section class="card">
      <label class="field-label" for="bodyWeight">Current body weight <span>optional</span></label>
      <input id="bodyWeight" class="text-input" inputmode="decimal" value="${escapeHtml(draft.pendingWeight ?? latestWeight)}" placeholder="Weight in lb" oninput="setSettingsField('pendingWeight', this.value)" />
      <p class="helper">New entries are added to your private on-device history instead of replacing older entries.</p>
      ${draft.weightHistory.length ? `<div class="weight-history">${draft.weightHistory.slice(-3).reverse().map(entry =>
        `<div><span>${new Date(entry.date).toLocaleDateString()}</span><strong>${escapeHtml(entry.weight)} lb</strong></div>`
      ).join('')}</div>` : ''}
    </section>
    ${settingsSaveBar("saveSettings('profile')")}`;
}

function showTrainingPlanSettings() {
  startSettings('plan');
  renderTrainingPlanSettings();
}

function renderTrainingPlanSettings() {
  const draft = state.settingsDraft;
  const recommendation = recommendSplit(draft);
  app.innerHTML = `
    ${settingsHeader('Training Plan')}
    <section class="hero">
      <h2 class="question-title">Training plan</h2>
      <p class="question-copy">Completed workouts advance the sequence. Missed days do not skip ahead.</p>
    </section>
    <section class="card">
      <div class="field-label">Days per week</div>
      <div class="chip-grid six">
        ${[1, 2, 3, 4, 5, 6].map(value => chipButton(value, draft.daysPerWeek === value, `setPlanDays(${value})`)).join('')}
      </div>
    </section>
    <div class="option-grid">
      ${optionButton('Let Form choose for me', draft.splitMode === 'form', "setPlanMode('form')", false, `Recommended: ${recommendation}`)}
    </div>
    <div class="focus-section">
      <h3 class="focus-section-title">Choose my split</h3>
      <div class="option-grid">
        ${availableSplits(draft.daysPerWeek).map(name => optionButton(
          name,
          draft.splitMode === 'custom' && draft.splitName === name,
          `setPlanName('${escapeJs(name)}')`,
          false,
          splitDescription(name)
        )).join('')}
      </div>
    </div>
    ${settingsSaveBar("saveSettings('plan')")}`;
}

function setPlanDays(value) {
  state.settingsDraft.daysPerWeek = Number(value);
  if (state.settingsDraft.splitMode === 'form') state.settingsDraft.splitName = recommendSplit(state.settingsDraft);
  renderTrainingPlanSettings();
}

function setPlanMode(mode) {
  state.settingsDraft.splitMode = mode;
  if (mode === 'form') state.settingsDraft.splitName = recommendSplit(state.settingsDraft);
  renderTrainingPlanSettings();
}

function setPlanName(name) {
  state.settingsDraft.splitMode = 'custom';
  state.settingsDraft.splitName = name;
  renderTrainingPlanSettings();
}

function showEquipmentSettings() {
  startSettings('equipment');
  renderEquipmentSettings();
}

function renderEquipmentSettings() {
  const draft = state.settingsDraft;
  app.innerHTML = `
    ${settingsHeader('Equipment')}
    <section class="hero">
      <h2 class="question-title">Available equipment</h2>
      <p class="question-copy">Choose a common setup or fine-tune the list below.</p>
    </section>
    <div class="option-grid">
      ${Object.entries(setupPresets).filter(([key]) => key !== 'custom').map(([key, preset]) =>
        optionButton(preset.label, draft.setup === key, `setSettingsSetup('${key}')`)
      ).join('')}
    </div>
    <section class="card">
      <div class="field-label">Fine-tune equipment</div>
      <div class="option-grid two-column">
        ${equipmentChoices.map(([value, label]) => optionButton(
          label,
          draft.equipment.includes(value),
          `toggleSettingsEquipment('${value}')`,
          true
        )).join('')}
      </div>
      <p class="helper">Bodyweight movements are always available.</p>
    </section>
    ${settingsSaveBar("saveSettings('equipment')")}`;
}

function setSettingsSetup(value) {
  state.settingsDraft.setup = value;
  state.settingsDraft.equipment = [...setupPresets[value].equipment];
  renderEquipmentSettings();
}

function toggleSettingsEquipment(value) {
  const equipment = [...state.settingsDraft.equipment];
  state.settingsDraft.equipment = equipment.includes(value)
    ? equipment.filter(item => item !== value)
    : [...equipment, value];
  state.settingsDraft.equipment = [...new Set(['bodyweight', ...state.settingsDraft.equipment])];
  state.settingsDraft.setup = findMatchingSetup(state.settingsDraft.equipment) || 'custom';
  renderEquipmentSettings();
}

function findMatchingSetup(equipment) {
  return Object.entries(setupPresets)
    .filter(([key]) => key !== 'custom')
    .find(([, preset]) => arraysEqualSets(preset.equipment, equipment))?.[0] || null;
}

function showPreferencesSettings() {
  startSettings('preferences');
  renderPreferencesSettings();
}

function renderPreferencesSettings() {
  const draft = state.settingsDraft;
  app.innerHTML = `
    ${settingsHeader('Preferences')}
    <section class="hero">
      <h2 class="question-title">Preferences</h2>
      <p class="question-copy">Changes affect future workouts. Completed history stays exactly as recorded.</p>
    </section>
    <section class="card">
      <div class="field-label">Primary goal</div>
      <div class="option-grid">
        ${goalChoices.map(value => optionButton(value, draft.goal === value, `setSettingsFieldAndRender('goal', '${escapeJs(value)}', 'preferences')`, true)).join('')}
      </div>
      <div class="field-label field-gap">Normal workout length</div>
      <div class="chip-grid">
        ${[20, 30, 45, 60].map(value => chipButton(`${value} min`, draft.duration === value, `setSettingsNumberAndRender('duration', ${value}, 'preferences')`)).join('')}
      </div>
    </section>
    <section class="card">
      <div class="field-label">Limitations</div>
      <div class="option-grid">
        ${limitationChoices.map(value => optionButton(
          value,
          draft.limitations.includes(value),
          `toggleSettingsArray('limitations', '${escapeJs(value)}', true, 'preferences')`,
          true
        )).join('')}
      </div>
    </section>
    <section class="card">
      <div class="field-label">Muscle priorities <span>up to three</span></div>
      <div class="option-grid two-column">
        ${priorityChoices.map(value => optionButton(
          value,
          draft.musclePriorities.includes(value),
          `toggleSettingsPriority('${escapeJs(value)}')`,
          true
        )).join('')}
      </div>
      <label class="field-label field-gap" for="preferenceDislikes">Exercise dislikes <span>optional</span></label>
      <input id="preferenceDislikes" class="text-input" value="${escapeHtml(draft.dislikes)}" placeholder="Comma separated" oninput="setSettingsField('dislikes', this.value)" />
    </section>
    ${settingsSaveBar("saveSettings('preferences')")}`;
}

function settingsSaveBar(action) {
  return `<div class="builder-actions">
    <div class="footer-actions">
      <button class="ghost-button" onclick="renderHome()">Cancel</button>
      <button class="primary-button" onclick="${action}">Save changes</button>
    </div>
  </div>`;
}

function setSettingsField(key, value) {
  state.settingsDraft[key] = value;
}

function setSettingsFieldAndRender(key, value, section) {
  state.settingsDraft[key] = value;
  if (section === 'profile') renderProfileSettings();
  if (section === 'preferences') renderPreferencesSettings();
}

function setSettingsNumberAndRender(key, value, section) {
  state.settingsDraft[key] = Number(value);
  if (section === 'preferences') renderPreferencesSettings();
}

function toggleSettingsArray(key, value, supportsNone, section) {
  let array = [...state.settingsDraft[key]];
  if (supportsNone) {
    if (value === 'None') array = ['None'];
    else {
      array = array.filter(item => item !== 'None');
      array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
      if (!array.length) array = ['None'];
    }
  } else {
    array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
  }
  state.settingsDraft[key] = array;
  if (section === 'preferences') renderPreferencesSettings();
}

function toggleSettingsPriority(value) {
  const priorities = [...state.settingsDraft.musclePriorities];
  if (priorities.includes(value)) {
    state.settingsDraft.musclePriorities = priorities.filter(item => item !== value);
  } else if (priorities.length < 3) {
    state.settingsDraft.musclePriorities = [...priorities, value];
  }
  renderPreferencesSettings();
}

function saveSettings(section) {
  const previousSplit = state.profile.splitName;
  const draft = normalizeProfile(state.settingsDraft);

  if (section === 'profile') {
    draft.firstName = String(state.settingsDraft.firstName || '').trim() || state.profile.firstName;
    const pendingWeight = Number(state.settingsDraft.pendingWeight);
    const latest = Number(draft.weightHistory.at(-1)?.weight);
    if (Number.isFinite(pendingWeight) && pendingWeight > 0 && pendingWeight !== latest) {
      draft.weightHistory.push({ date: new Date().toISOString(), weight: formatNumber(pendingWeight) });
    }
  }

  if (section === 'plan') {
    draft.splitName = draft.splitMode === 'form' ? recommendSplit(draft) : draft.splitName;
    draft.splitSequence = clone(splitDefinitions[draft.splitName]);
    if (draft.splitName !== previousSplit) draft.splitIndex = 0;
  } else if (section === 'preferences' && state.profile.splitMode === 'form') {
    draft.splitMode = 'form';
    draft.splitName = recommendSplit(draft);
    draft.splitSequence = clone(splitDefinitions[draft.splitName]);
    draft.splitIndex = draft.splitName === previousSplit ? state.profile.splitIndex : 0;
  } else {
    draft.splitName = state.profile.splitName;
    draft.splitMode = state.profile.splitMode;
    draft.splitSequence = clone(state.profile.splitSequence);
    draft.splitIndex = state.profile.splitIndex;
  }

  draft.onboarded = true;
  draft.updatedAt = new Date().toISOString();
  state.profile = draft;
  safeSave(STORAGE.profile, state.profile);
  state.settingsDraft = null;
  renderHome();
}

function showAboutMe() {
  stopUiTimer();
  state.view = 'about';
  app.innerHTML = `
    ${settingsHeader('About Me')}
    <section class="hero">
      <div class="eyebrow">About Me</div>
      <h2 class="question-title">Hi, I’m Kollin, the creator of Form.</h2>
    </section>
    <section class="card about-copy">
      <p>I built Form around a simple idea: working out should not require a bunch of planning before you can even start. Fitness apps have become crowded with menus, charts, settings, and decisions that can make something simple feel complicated.</p>
      <p>Form was built to strip away that clutter.</p>
      <p>The goal is to give you a personalized, evidence-informed workout without making you think about every exercise, set, rep, or progression on your own. You tell Form what matters to you, and Form handles the rest.</p>
      <strong>Simple on the surface. Thoughtful underneath.</strong>
      <p>That’s what Form is meant to be.</p>
    </section>
    ${nav('about')}`;
}

function showHelp() {
  stopUiTimer();
  state.view = 'help';
  app.innerHTML = `
    ${settingsHeader('Help')}
    <section class="hero">
      <h2 class="question-title">Help improve Form</h2>
      <p class="question-copy">Share a bug, confusing behavior, feature suggestion, or general beta feedback.</p>
    </section>
    <section class="card">
      <div class="settings-row">
        <strong>Before sending</strong>
        <span>Include what you tapped, what you expected, and what happened instead.</span>
      </div>
      <button class="primary-button field-gap" onclick="shareFeedback()">Share feedback</button>
      <button class="secondary-button field-gap-small" onclick="copyFeedbackTemplate()">Copy feedback template</button>
      <p class="helper" id="feedbackStatus"></p>
    </section>
    <section class="card">
      <div class="eyebrow">Privacy</div>
      <p class="helper" style="margin:0">This beta stores profile, workout, and history data in this browser. It does not currently use accounts, advertising, analytics, or cloud sync.</p>
    </section>
    ${nav('help')}`;
}

function feedbackTemplate() {
  return `Form beta feedback

What I was doing:

What I expected:

What happened:

Device/browser:

Form version: ${VERSION}`;
}

async function shareFeedback() {
  const text = feedbackTemplate();
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Form beta feedback', text });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  await copyText(text);
  showFeedbackStatus('Feedback template copied.');
}

async function copyFeedbackTemplate() {
  await copyText(feedbackTemplate());
  showFeedbackStatus('Feedback template copied.');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function showFeedbackStatus(message) {
  const status = document.getElementById('feedbackStatus');
  if (status) status.textContent = message;
}

function showModal(title, text, customContent = '') {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="modal" onclick="closeModalFromBackdrop(event)">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <h3 id="modalTitle">${escapeHtml(title)}</h3>
        ${text ? `<p>${escapeHtml(text)}</p>` : ''}
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
    startPlanWorkout();
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeJs(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

window.addEventListener('beforeunload', () => {
  if (state.session.active) pauseSessionClock();
  persistCurrent();
});

if (location.protocol === 'https:' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

renderInitial();
