const app = document.getElementById('app');

const VERSION = '3.2.1';

const STORAGE = {
  profile: 'form-profile-v3',
  history: 'form-history-v3',
  current: 'form-current-v3',
  behavior: 'form-behavior-v3',
  preImport: 'form-preimport-backup-v3',
  legacyHistory: 'form-history-v2'
};

let storageIssue = false;

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    storageIssue = true;
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    storageIssue = true;
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    storageIssue = true;
    return false;
  }
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

const setupDetailChoices = [
  ['floor', 'Clear floor space'],
  ['wall', 'Wall'],
  ['chair', 'Chair / seat'],
  ['step', 'Step / box'],
  ['sliders', 'Sliders'],
  ['stabilityBall', 'Stability ball'],
  ['jumpRope', 'Jump rope']
];

const strengthSetupChoices = [
  ['rack', 'Squat rack / uprights'],
  ['landmine', 'Landmine setup']
];

const bandSetupChoices = [
  ['bandAnchorHigh', 'High band anchor'],
  ['bandAnchorMid', 'Mid-height band anchor']
];

const cableSetupChoices = [
  ['dualCable', 'Dual cable towers'],
  ['cableRowStation', 'Seated row station'],
  ['ankleCuff', 'Ankle cuff']
];

const machineSetupChoices = [
  ['legPress', 'Leg press'],
  ['hackSquat', 'Hack squat'],
  ['legExtension', 'Leg extension'],
  ['lyingLegCurl', 'Lying leg curl'],
  ['seatedLegCurl', 'Seated leg curl'],
  ['hipAbduction', 'Hip-abduction machine'],
  ['seatedCalfRaise', 'Seated calf raise'],
  ['latPulldown', 'Lat pulldown'],
  ['rowMachine', 'Row machine'],
  ['pecDeck', 'Pec deck'],
  ['chestPress', 'Chest press'],
  ['shoulderPress', 'Shoulder press']
];

const cardioSetupChoices = [
  ['treadmill', 'Treadmill'],
  ['bike', 'Stationary bike'],
  ['rower', 'Rower'],
  ['elliptical', 'Elliptical']
];

function defaultEquipmentDetails(setup, equipment = []) {
  const details = {
    floor: true,
    wall: true,
    bench: equipment.includes('bench'),
    chair: false,
    step: false,
    sliders: false,
    stabilityBall: false,
    jumpRope: false,
    rack: false,
    landmine: false,
    bandAnchorHigh: false,
    bandAnchorMid: false,
    dualCable: false,
    cableRowStation: false,
    ankleCuff: false,
    treadmill: false,
    bike: false,
    rower: false,
    elliptical: false,
    legPress: false,
    hackSquat: false,
    legExtension: false,
    lyingLegCurl: false,
    seatedLegCurl: false,
    hipAbduction: false,
    seatedCalfRaise: false,
    latPulldown: false,
    rowMachine: false,
    pecDeck: false,
    chestPress: false,
    shoulderPress: false
  };

  if (setup === 'gym') {
    ['chair','step','rack','landmine','bandAnchorHigh','bandAnchorMid','dualCable','cableRowStation','ankleCuff',
      'treadmill','bike','rower','elliptical','legPress','hackSquat','legExtension','lyingLegCurl','seatedLegCurl',
      'hipAbduction','seatedCalfRaise','latPulldown','rowMachine','pecDeck','chestPress','shoulderPress']
      .forEach(key => { details[key] = true; });
  }

  return details;
}

function normalizeEquipmentDetails(raw, setup, equipment) {
  const base = defaultEquipmentDetails(setup, equipment);
  if (!raw || typeof raw !== 'object') return base;
  Object.keys(base).forEach(key => {
    if (typeof raw[key] === 'boolean') base[key] = raw[key];
  });
  base.bench = equipment.includes('bench') ? base.bench !== false : false;
  return base;
}

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
    equipmentDetails: defaultEquipmentDetails('home', setupPresets.home.equipment),
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
  profile.equipmentDetails = normalizeEquipmentDetails(raw.equipmentDetails, profile.setup, profile.equipment);
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

function validHistoryRecord(item) {
  return item && typeof item === 'object' && typeof item.id === 'string' && Array.isArray(item.details || []);
}

function loadHistory() {
  const current = safeLoad(STORAGE.history, null);
  if (Array.isArray(current)) return current.filter(validHistoryRecord);
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
  if (/hip-abduction|banded-lateral-walk/.test(id)) return 'hip-abduction';
  if (/hip-thrust|glute-bridge|frog-pump/.test(id)) return 'bridge-hip-extension';
  if (/rdl|deadlift|pull-through/.test(id)) return 'hip-hinge';
  if (/reverse-lunge|split-squat|step-up/.test(id)) return 'unilateral-knee-dominant';
  if (/squat|leg-press|wall-sit|leg-extension/.test(id)) return 'squat-knee-dominant';
  if (/hamstring-curl|leg-curl/.test(id)) return 'knee-flexion';
  if (/calf/.test(id)) return 'calf-raise';
  if (/pulldown|pullover/.test(id)) return 'vertical-pull';
  if (/row|reverse-snow|prone-w/.test(id)) return 'horizontal-pull';
  if (/shoulder-press|landmine-press/.test(id)) return 'vertical-push';
  if (/chest-fly|pec-deck/.test(id)) return 'chest-fly';
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
    'hip-abduction': 'hip abduction',
    'hip-hinge': 'hip hinge',
    'unilateral-knee-dominant': 'single-leg',
    'squat-knee-dominant': 'squat',
    'knee-flexion': 'knee flexion',
    'calf-raise': 'ankle extension',
    'vertical-pull': 'vertical pull',
    'horizontal-pull': 'horizontal pull',
    'vertical-push': 'vertical push',
    'horizontal-push': 'horizontal push',
    'chest-fly': 'horizontal adduction',
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
  const family = inferFamily(id);
  if (['hip-hinge', 'unilateral-knee-dominant', 'squat-knee-dominant', 'vertical-push', 'horizontal-push'].includes(family)) return 'compound';
  if (family === 'horizontal-pull') return /row/.test(id) ? 'compound' : 'accessory';
  if (family === 'vertical-pull') return /pulldown/.test(id) && !/straight-arm/.test(id) ? 'compound' : 'accessory';
  if (family === 'bridge-hip-extension' && /hip-thrust/.test(id)) return 'compound';
  return 'accessory';
}

function inferDifficulty(id) {
  if (/barbell-back-squat|conventional-deadlift|single-leg-rdl|inverted-row|landmine-press|hollow-hold|jump-rope/.test(id)) return 'advanced';
  if (/bulgarian|split-squat|step-up|barbell-rdl|barbell-bench-press|side-plank|pushup/.test(id)) return 'intermediate';
  return 'beginner';
}

function requiredEquipment(equipment, id = '') {
  if (id === 'barbell-bench-press') return ['barbell', 'bench'];
  if (equipment === 'bench') return ['dumbbells', 'bench'];
  return [equipment];
}

function inferTracking(requires, kind) {
  if (kind === 'cardio') return 'effort';
  if (kind === 'mobility') return 'none';
  if (requires.some(item => ['dumbbells', 'barbell', 'machine', 'cable'].includes(item))) return 'weight';
  if (requires.includes('bands')) return 'band';
  return 'bodyweight';
}

function inferUnilateral(id) {
  return /single-leg|one-arm|reverse-lunge|split-squat|step-up|kickback|side-plank|concentration-curl|pallof|landmine-press/.test(id);
}

const exerciseAuditMeta = {
  "barbell-hip-thrust": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Total bar plus plates",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bench",
        "floor"
      ],
      "needsAny": [],
      "postures": [],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-glute-bridge": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "One dumbbell total",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "bodyweight-glute-bridge": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "single-leg-glute-bridge": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per side; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "cable-kickback": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Displayed cable setting for one working leg",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "ankleCuff"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "banded-lateral-walk": {
    "pattern": "hip abduction",
    "family": "hip-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Steps each direction; specify both directions per set",
    "loadBasis": "Named loop band and placement",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "frog-pump": {
    "pattern": "hip extension",
    "family": "hip-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "reverse-lunge": {
    "pattern": "lunge",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-reverse-lunge": {
    "pattern": "lunge",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "step-up": {
    "pattern": "step",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [
        "step"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "dumbbell-bulgarian-split-squat": {
    "pattern": "split squat",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "step",
          "bench"
        ]
      ],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "machine-hip-abduction": {
    "pattern": "hip abduction",
    "family": "hip-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:hipAbduction"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "bodyweight-squat": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "goblet-squat": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "One dumbbell total",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "barbell-back-squat": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Total bar plus plates",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "rack"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "leg-press": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed load on this exact machine",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:legPress"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "hack-squat": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed machine load; identify model",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:hackSquat"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "leg-extension": {
    "pattern": "knee extension",
    "family": "knee-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps for defined bilateral variant",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:legExtension"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "wall-sit": {
    "pattern": "squat isometric",
    "family": "knee-dominant-squat",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Seconds per bilateral hold",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Timed hold",
    "requirements": {
      "needs": [
        "wall"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "heel-elevated-squat": {
    "pattern": "squat",
    "family": "knee-dominant-squat",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [
        "step"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "split-squat": {
    "pattern": "split squat",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-split-squat": {
    "pattern": "split squat",
    "family": "unilateral-knee-dominant",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-rdl": {
    "pattern": "hinge",
    "family": "hip-hinge",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "barbell-rdl": {
    "pattern": "hinge",
    "family": "hip-hinge",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Total bar plus plates",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "conventional-deadlift": {
    "pattern": "hinge from floor",
    "family": "hip-hinge",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Total bar plus plates",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "high",
      "spaceClass": "normal"
    }
  },
  "cable-pull-through": {
    "pattern": "hinge",
    "family": "hip-hinge",
    "role": "compound",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "large"
    }
  },
  "slider-hamstring-curl": {
    "pattern": "knee flexion",
    "family": "knee-flexion",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "floor",
        "sliders"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "stability-ball-curl": {
    "pattern": "knee flexion",
    "family": "knee-flexion",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "floor",
        "stabilityBall"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "lying-leg-curl": {
    "pattern": "knee flexion",
    "family": "knee-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:lyingLegCurl"
      ],
      "needsAny": [],
      "postures": [
        "prone"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "seated-leg-curl": {
    "pattern": "knee flexion",
    "family": "knee-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:seatedLegCurl"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "single-leg-rdl": {
    "pattern": "hinge",
    "family": "hip-hinge",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "standing-calf-raise": {
    "pattern": "plantar flexion",
    "family": "plantar-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "single-leg-calf-raise": {
    "pattern": "plantar flexion",
    "family": "plantar-flexion",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per leg; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "wall",
          "chair",
          "bench"
        ]
      ],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-calf-raise": {
    "pattern": "plantar flexion",
    "family": "plantar-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "seated-calf-raise": {
    "pattern": "plantar flexion",
    "family": "plantar-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed machine load",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:seatedCalfRaise"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "leg-press-calf-raise": {
    "pattern": "plantar flexion",
    "family": "plantar-flexion",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed load on this leg-press machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:legPress"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "reverse-snow-angel": {
    "pattern": "shoulder control",
    "family": "shoulder-control",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral controlled reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Shoulder control",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "prone"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "prone-w-raise": {
    "pattern": "shoulder control",
    "family": "shoulder-control",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral controlled reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Shoulder control",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "prone"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "one-arm-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per arm; both sides make one set",
    "loadBasis": "One working-hand dumbbell",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "bench",
          "chair"
        ]
      ],
      "postures": [
        "standing",
        "kneeling"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "chest-supported-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bench"
      ],
      "needsAny": [],
      "postures": [
        "prone"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "band-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named long band, length and anchor setup",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bandAnchorMid"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "band-pulldown": {
    "pattern": "vertical pull",
    "family": "vertical-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named long band and anchor setup",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bandAnchorHigh"
      ],
      "needsAny": [],
      "postures": [
        "standing",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "lat-pulldown": {
    "pattern": "vertical pull",
    "family": "vertical-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:latPulldown"
      ],
      "needsAny": [],
      "postures": [
        "seated",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "seated-cable-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this station",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "cableRowStation"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "machine-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:rowMachine"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "inverted-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight; record body angle and support height",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "rack"
      ],
      "needsAny": [],
      "postures": [],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "dumbbell-pullover": {
    "pattern": "shoulder extension",
    "family": "shoulder-extension",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "One dumbbell held with both hands",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "bench"
      ],
      "needsAny": [],
      "postures": [
        "supine",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "straight-arm-pulldown": {
    "pattern": "shoulder extension",
    "family": "shoulder-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "incline-pushup": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight; record support height",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "bench",
          "step"
        ]
      ],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "pushup": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-floor-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-bench-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bench"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "barbell-bench-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Total bar plus plates",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "bench",
        "rack"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "cable-chest-fly": {
    "pattern": "horizontal adduction",
    "family": "horizontal-adduction",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Setting per cable stack; record dual-stack basis",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "dualCable"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "large"
    }
  },
  "pec-deck": {
    "pattern": "horizontal adduction",
    "family": "horizontal-adduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "machine:pecDeck"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "machine-chest-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:chestPress"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "band-chest-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named band and anchor setup",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dumbbell-squeeze-press": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "seated-shoulder-press": {
    "pattern": "vertical push",
    "family": "vertical-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "chair",
          "bench"
        ]
      ],
      "postures": [
        "seated",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "machine-shoulder-press": {
    "pattern": "vertical push",
    "family": "vertical-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed setting on this machine",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "machine:shoulderPress"
      ],
      "needsAny": [],
      "postures": [
        "seated",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "cable-lateral-raise": {
    "pattern": "shoulder abduction",
    "family": "shoulder-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per arm; both sides make one set",
    "loadBasis": "Displayed setting for one working arm",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "lateral-raise": {
    "pattern": "shoulder abduction",
    "family": "shoulder-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "band-lateral-raise": {
    "pattern": "shoulder abduction",
    "family": "shoulder-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps for defined two-arm version",
    "loadBasis": "Named long band and stance width",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "rear-delt-fly": {
    "pattern": "horizontal abduction",
    "family": "horizontal-abduction",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "face-pull": {
    "pattern": "horizontal pull accessory",
    "family": "horizontal-pull-accessory",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "large"
    }
  },
  "band-pull-apart": {
    "pattern": "horizontal abduction",
    "family": "horizontal-abduction",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named band and grip width",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "wall-slide": {
    "pattern": "shoulder mobility",
    "family": "shoulder-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral controlled reps",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [
        "wall"
      ],
      "needsAny": [],
      "postures": [
        "standing",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "landmine-press": {
    "pattern": "angled push",
    "family": "angled-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per arm; both sides make one set",
    "loadBasis": "Plates added to free end plus bar type recorded",
    "prescriptionClass": "Loaded compound",
    "requirements": {
      "needs": [
        "floor",
        "landmine"
      ],
      "needsAny": [],
      "postures": [
        "kneeling"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "large"
    }
  },
  "dumbbell-curl": {
    "pattern": "elbow flexion",
    "family": "elbow-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps for simultaneous version",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "hammer-curl": {
    "pattern": "elbow flexion",
    "family": "elbow-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps for simultaneous version",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "band-curl": {
    "pattern": "elbow flexion",
    "family": "elbow-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named long band and stance setup",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "cable-curl": {
    "pattern": "elbow flexion",
    "family": "elbow-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps for bar-handle version",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "concentration-curl": {
    "pattern": "elbow flexion",
    "family": "elbow-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per arm; both sides make one set",
    "loadBasis": "One working-hand dumbbell",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "chair",
          "bench"
        ]
      ],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "triceps-kickback": {
    "pattern": "elbow extension",
    "family": "elbow-extension",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Reps per arm; both sides make one set",
    "loadBasis": "One working-hand dumbbell",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "overhead-triceps-extension": {
    "pattern": "elbow extension overhead",
    "family": "elbow-extension-overhead",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps with one weight",
    "loadBasis": "One dumbbell held with both hands",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "band-pressdown": {
    "pattern": "elbow extension",
    "family": "elbow-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Named long band and anchor setup",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [
        "bandAnchorHigh"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "cable-pressdown": {
    "pattern": "elbow extension",
    "family": "elbow-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "overhead-cable-triceps-extension": {
    "pattern": "elbow extension overhead",
    "family": "elbow-extension-overhead",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Accessory",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "large"
    }
  },
  "close-grip-pushup": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight; record support height",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {
      "needs": [],
      "needsAny": [
        [
          "bench",
          "step"
        ]
      ],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "dead-bug": {
    "pattern": "anti extension",
    "family": "anti-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side; one controlled extension equals one side rep",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "heel-taps": {
    "pattern": "anti extension",
    "family": "anti-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side for defined tabletop heel tap",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "reverse-crunch": {
    "pattern": "trunk flexion",
    "family": "trunk-flexion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "bird-dog": {
    "pattern": "anti rotation and extension",
    "family": "anti-rotation-and-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "kneeling",
        "wristSupport"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "forearm-plank": {
    "pattern": "anti extension",
    "family": "anti-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Seconds per bilateral hold",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Timed hold",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "prone"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "side-plank": {
    "pattern": "anti lateral flexion",
    "family": "anti-lateral-flexion",
    "role": "accessory",
    "difficulty": "intermediate",
    "unilateral": true,
    "sideBasis": "Seconds per side; both sides make one set",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Timed hold",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "sideLying"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "pallof-press": {
    "pattern": "anti rotation",
    "family": "anti-rotation",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Reps each orientation; both directions make one set",
    "loadBasis": "Displayed cable setting",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "band-pallof-press": {
    "pattern": "anti rotation",
    "family": "anti-rotation",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Reps each orientation; both directions make one set",
    "loadBasis": "Named band and anchor distance",
    "prescriptionClass": "Core repetitions",
    "requirements": {
      "needs": [
        "bandAnchorMid"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "hollow-hold": {
    "pattern": "anti extension",
    "family": "anti-extension",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Seconds per bilateral hold",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Timed hold",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "supine",
        "overhead"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "brisk-walk": {
    "pattern": "locomotion",
    "family": "locomotion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Minutes continuous; optional effort",
    "loadBasis": "No external load",
    "prescriptionClass": "Continuous cardio",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "large"
    }
  },
  "low-impact-circuit": {
    "pattern": "conditioning circuit",
    "family": "conditioning-circuit",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Minutes with named stages; no strength-set volume credit",
    "loadBasis": "No external load",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "shadow-boxing": {
    "pattern": "conditioning intervals",
    "family": "conditioning-intervals",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Timed work and easy-recovery rounds",
    "loadBasis": "No external load",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "incline-walk": {
    "pattern": "locomotion",
    "family": "locomotion",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Minutes continuous; record pace and incline if desired",
    "loadBasis": "Treadmill settings, not external load",
    "prescriptionClass": "Continuous cardio",
    "requirements": {
      "needs": [
        "cardio:treadmill"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "high",
      "spaceClass": "normal"
    }
  },
  "bike-intervals": {
    "pattern": "cycling intervals",
    "family": "cycling-intervals",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Timed work and easy-recovery rounds",
    "loadBasis": "Bike resistance setting; optional cadence",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [
        "cardio:bike"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "rower-intervals": {
    "pattern": "rowing intervals",
    "family": "rowing-intervals",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Timed work and easy-recovery rounds",
    "loadBasis": "Rower setting and effort, not strength load",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [
        "cardio:rower"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "high",
      "spaceClass": "normal"
    }
  },
  "elliptical-intervals": {
    "pattern": "elliptical intervals",
    "family": "elliptical-intervals",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Timed work and easy-recovery rounds",
    "loadBasis": "Machine resistance and incline settings",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [
        "cardio:elliptical"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "medium",
      "spaceClass": "normal"
    }
  },
  "jump-rope": {
    "pattern": "jumping intervals",
    "family": "jumping-intervals",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Timed work and recovery rounds",
    "loadBasis": "No external load",
    "prescriptionClass": "Cardio intervals",
    "requirements": {
      "needs": [
        "jumpRope"
      ],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": true,
      "noiseLevel": "high",
      "spaceClass": "large"
    }
  },
  "hip-9090": {
    "pattern": "hip mobility",
    "family": "hip-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Alternating switches total; define a full left-right cycle",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "seated"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "thoracic-rotation": {
    "pattern": "thoracic mobility",
    "family": "thoracic-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "sideLying"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "cat-cow": {
    "pattern": "spinal mobility",
    "family": "spinal-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Slow flexion-extension cycles",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "kneeling",
        "wristSupport"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "hamstring-sweep": {
    "pattern": "posterior chain mobility",
    "family": "posterior-chain-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "ankle-rock": {
    "pattern": "ankle mobility",
    "family": "ankle-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "hip-flexor-stretch": {
    "pattern": "hip mobility hold",
    "family": "hip-mobility-hold",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Seconds per side",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility hold",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "kneeling"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "child-pose-reach": {
    "pattern": "trunk mobility hold",
    "family": "trunk-mobility-hold",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Seconds per side for side-reaching hold",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility hold",
    "requirements": {
      "needs": [
        "floor"
      ],
      "needsAny": [],
      "postures": [
        "kneeling",
        "overhead"
      ],
      "floorContact": true,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  },
  "standing-side-bend": {
    "pattern": "lateral trunk mobility",
    "family": "lateral-trunk-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Reps per side for dynamic version",
    "loadBasis": "No external load",
    "prescriptionClass": "Mobility repetitions",
    "requirements": {
      "needs": [],
      "needsAny": [],
      "postures": [
        "standing",
        "overhead"
      ],
      "floorContact": false,
      "jumping": false,
      "noiseLevel": "low",
      "spaceClass": "normal"
    }
  }
  ,
  "standing-dumbbell-row": {
    "pattern": "horizontal pull",
    "family": "horizontal-pull",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {"needs": [], "needsAny": [], "postures": ["standing"], "floorContact": false, "jumping": false, "noiseLevel": "low", "spaceClass": "normal"}
  },
  "standing-dumbbell-press": {
    "pattern": "vertical push",
    "family": "vertical-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Weight per hand for matched pair",
    "prescriptionClass": "Loaded compound",
    "requirements": {"needs": [], "needsAny": [], "postures": ["standing", "overhead"], "floorContact": false, "jumping": false, "noiseLevel": "low", "spaceClass": "normal"}
  },
  "wall-pushup": {
    "pattern": "horizontal push",
    "family": "horizontal-push",
    "role": "compound",
    "difficulty": "beginner",
    "unilateral": false,
    "sideBasis": "Total bilateral reps",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Bodyweight compound",
    "requirements": {"needs": ["wall"], "needsAny": [], "postures": ["standing"], "floorContact": false, "jumping": false, "noiseLevel": "low", "spaceClass": "normal"}
  },
  "standing-hip-flexor-mobility": {
    "pattern": "hip mobility",
    "family": "hip-mobility",
    "role": "accessory",
    "difficulty": "beginner",
    "unilateral": true,
    "sideBasis": "Time per side",
    "loadBasis": "Bodyweight",
    "prescriptionClass": "Mobility",
    "requirements": {"needs": [], "needsAny": [], "postures": ["standing"], "floorContact": false, "jumping": false, "noiseLevel": "low", "spaceClass": "normal"}
  }
};

function ex(id, name, focuses, muscle, equipment, avoid, cue, kind = 'strength') {
  const requires = requiredEquipment(equipment, id);
  const audited = exerciseAuditMeta[id] || {};
  return {
    id,
    name,
    focuses,
    muscle,
    equipment,
    requires,
    avoid,
    cue,
    kind,
    family: audited.family || inferFamily(id),
    pattern: audited.pattern || inferPattern(id, focuses, kind),
    role: audited.role || inferRole(id, kind),
    difficulty: audited.difficulty || inferDifficulty(id),
    tracking: inferTracking(requires, kind),
    unilateral: typeof audited.unilateral === 'boolean' ? audited.unilateral : inferUnilateral(id),
    sideBasis: audited.sideBasis || '',
    loadBasis: audited.loadBasis || '',
    prescriptionClass: audited.prescriptionClass || '',
    requirements: audited.requirements || { needs: [], needsAny: [], postures: [], floorContact: false, jumping: false, noiseLevel: 'low', spaceClass: 'normal' },
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
  ex('dumbbell-bulgarian-split-squat', 'Dumbbell Bulgarian split squat', ['Glutes', 'Legs', 'Quads'], 'Glutes + quads', 'dumbbells', ['knees'], 'Set the front foot far enough forward to stay balanced, lower under control, and drive through the front foot.'),
  ex('machine-hip-abduction', 'Hip-abduction machine', ['Glutes'], 'Outer glutes', 'machine', [], 'Keep the pelvis steady, move through a comfortable range, and control the return.'),

  // Legs and quads
  ex('bodyweight-squat', 'Bodyweight squat', ['Legs', 'Quads'], 'Quads + glutes', 'bodyweight', ['knees'], 'Sit between the hips, keep the feet planted, and let the knees track with the toes.'),
  ex('goblet-squat', 'Goblet squat', ['Legs', 'Quads'], 'Quads + glutes', 'dumbbells', ['knees'], 'Hold the weight close, brace the torso, and keep pressure through the whole foot.'),
  ex('barbell-back-squat', 'Barbell back squat', ['Legs', 'Quads'], 'Legs', 'barbell', ['knees', 'lower back'], 'Brace before descending and use a depth that allows steady control and a neutral spine.'),
  ex('leg-press', 'Leg press', ['Legs', 'Quads'], 'Quads + glutes', 'machine', ['knees'], 'Keep the hips against the pad and stop before the lower back begins to round.'),
  ex('hack-squat', 'Hack squat', ['Legs', 'Quads'], 'Quads + glutes', 'machine', ['knees'], 'Keep the feet planted, let the knees track with the toes, and use a depth you can control.'),
  ex('leg-extension', 'Leg extension', ['Quads'], 'Quads', 'machine', ['knees'], 'Lift smoothly, pause briefly near the top, and avoid snapping the knees straight.'),
  ex('wall-sit', 'Wall sit', ['Legs', 'Quads'], 'Quads', 'bodyweight', ['knees'], 'Keep the back supported and choose a knee angle that feels controlled and pain-free.', 'time'),
  ex('heel-elevated-squat', 'Heel-elevated squat', ['Quads'], 'Quads', 'bodyweight', ['knees'], 'Stay upright, move slowly, and keep the knees aligned with the toes.'),
  ex('split-squat', 'Split squat', ['Legs', 'Quads', 'Glutes'], 'Quads + glutes', 'bodyweight', ['knees'], 'Use a stable stance and lower straight down rather than drifting forward.'),
  ex('dumbbell-split-squat', 'Dumbbell split squat', ['Legs', 'Quads', 'Glutes'], 'Quads + glutes', 'dumbbells', ['knees'], 'Keep the front foot flat and use the rear leg mainly for balance.'),

  // Hamstrings
  ex('dumbbell-rdl', 'Dumbbell Romanian deadlift', ['Hamstrings', 'Glutes', 'Legs'], 'Hamstrings + glutes', 'dumbbells', ['lower back'], 'Push the hips back, keep the weights close, and stop when the hamstrings are fully loaded.'),
  ex('barbell-rdl', 'Barbell Romanian deadlift', ['Hamstrings', 'Glutes', 'Legs'], 'Hamstrings + glutes', 'barbell', ['lower back'], 'Keep the bar close to the legs and hinge without rounding or reaching for extra depth.'),
  ex('conventional-deadlift', 'Conventional deadlift', ['Hamstrings', 'Glutes', 'Legs', 'Back'], 'Posterior chain', 'barbell', ['lower back'], 'Brace before the pull, keep the bar close, and stand tall without leaning back at the top.'),
  ex('cable-pull-through', 'Cable pull-through', ['Hamstrings', 'Glutes'], 'Hamstrings + glutes', 'cable', ['lower back'], 'Step forward for cable tension, push the hips back, and finish by squeezing the glutes.'),
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
  ex('standing-dumbbell-row', 'Standing dumbbell row', ['Back'], 'Back', 'dumbbells', ['lower back'], 'Hinge with a braced torso, row both dumbbells toward the hips, and lower them under control.'),
  ex('chest-supported-row', 'Chest-supported dumbbell row', ['Back'], 'Back', 'dumbbells', [], 'Keep the chest supported and pull with the elbows rather than shrugging.'),
  ex('band-row', 'Resistance-band row', ['Back'], 'Back', 'bands', [], 'Keep the ribs stacked and squeeze the shoulder blades without leaning back.'),
  ex('band-pulldown', 'Resistance-band pulldown', ['Back'], 'Lats', 'bands', ['shoulders'], 'Pull the elbows toward the ribs and avoid arching to create extra range.'),
  ex('lat-pulldown', 'Lat pulldown', ['Back'], 'Lats', 'machine', ['shoulders'], 'Lead with the elbows, keep the torso quiet, and stop near the upper chest.'),
  ex('seated-cable-row', 'Seated cable row', ['Back'], 'Mid back', 'cable', [], 'Stay tall and finish the pull without leaning far behind the hips.'),
  ex('machine-row', 'Chest-supported machine row', ['Back'], 'Back', 'machine', [], 'Keep the chest on the pad and control the return until the arms are long.'),
  ex('inverted-row', 'Inverted row', ['Back'], 'Back', 'barbell', ['shoulders', 'wrists'], 'Keep the body in one line and pull the chest toward the bar.'),
  ex('dumbbell-pullover', 'Dumbbell pullover', ['Back', 'Chest'], 'Lats + chest', 'dumbbells', ['shoulders'], 'Keep the ribs down and use only the shoulder range you can control.'),
  ex('straight-arm-pulldown', 'Straight-arm cable pulldown', ['Back'], 'Lats', 'cable', ['shoulders'], 'Keep a soft elbow bend, pull the handle toward the thighs, and avoid turning it into a triceps movement.'),

  // Chest
  ex('wall-pushup', 'Wall push-up', ['Chest', 'Arms'], 'Chest + triceps', 'bodyweight', ['shoulders', 'wrists'], 'Keep the body long, lower toward the wall under control, and press away without shrugging.'),
  ex('incline-pushup', 'Incline push-up', ['Chest'], 'Chest + triceps', 'bodyweight', ['shoulders', 'wrists'], 'Keep the body straight and lower the chest toward the support with elbows angled back.'),
  ex('pushup', 'Push-up', ['Chest'], 'Chest + triceps', 'bodyweight', ['shoulders', 'wrists'], 'Brace the body as one unit and keep the elbows at a comfortable angle.'),
  ex('dumbbell-floor-press', 'Dumbbell floor press', ['Chest', 'Arms'], 'Chest + triceps', 'dumbbells', ['shoulders'], 'Keep the wrists stacked and pause gently when the upper arms meet the floor.'),
  ex('dumbbell-bench-press', 'Dumbbell bench press', ['Chest', 'Arms'], 'Chest + triceps', 'bench', ['shoulders'], 'Keep the feet planted and lower the weights with the forearms nearly vertical.'),
  ex('barbell-bench-press', 'Barbell bench press', ['Chest', 'Arms'], 'Chest + triceps', 'barbell', ['shoulders'], 'Plant the feet, keep the shoulder blades set, and lower the bar with the forearms nearly vertical.'),
  ex('cable-chest-fly', 'Cable chest fly', ['Chest'], 'Chest', 'cable', ['shoulders'], 'Keep a soft elbow bend and bring the hands together without letting the shoulders roll forward.'),
  ex('pec-deck', 'Pec deck', ['Chest'], 'Chest', 'machine', ['shoulders'], 'Keep the upper back against the pad and bring the arms together through a comfortable range.'),
  ex('machine-chest-press', 'Machine chest press', ['Chest', 'Arms'], 'Chest + triceps', 'machine', ['shoulders'], 'Set the handles near mid-chest and press without letting the shoulders roll forward.'),
  ex('band-chest-press', 'Resistance-band chest press', ['Chest', 'Arms'], 'Chest + triceps', 'bands', ['shoulders'], 'Stand stable, keep the ribs down, and press forward without shrugging.'),
  ex('dumbbell-squeeze-press', 'Dumbbell squeeze press', ['Chest', 'Arms'], 'Chest + triceps', 'dumbbells', ['shoulders'], 'Press the dumbbells together throughout the repetition and move slowly.'),

  // Shoulders
  ex('standing-dumbbell-press', 'Standing dumbbell shoulder press', ['Shoulders'], 'Shoulders', 'dumbbells', ['shoulders', 'lower back'], 'Brace the torso, press the dumbbells overhead through a comfortable path, and avoid leaning back.'),
  ex('seated-shoulder-press', 'Seated dumbbell shoulder press', ['Shoulders', 'Arms'], 'Shoulders + triceps', 'dumbbells', ['shoulders'], 'Keep the ribs down and press only through a comfortable overhead range.'),
  ex('machine-shoulder-press', 'Machine shoulder press', ['Shoulders', 'Arms'], 'Shoulders + triceps', 'machine', ['shoulders'], 'Set the seat so the handles start around shoulder height and press without shrugging.'),
  ex('cable-lateral-raise', 'Cable lateral raise', ['Shoulders'], 'Side delts', 'cable', ['shoulders'], 'Lead with the elbow, keep the torso quiet, and stop around shoulder height.'),
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
  ex('cable-curl', 'Cable biceps curl', ['Arms'], 'Biceps', 'cable', [], 'Keep the elbows near the ribs and curl without letting the shoulders drift forward.'),
  ex('concentration-curl', 'Concentration curl', ['Arms'], 'Biceps', 'dumbbells', [], 'Brace the upper arm and curl without letting the shoulder roll forward.'),
  ex('triceps-kickback', 'Dumbbell triceps kickback', ['Arms'], 'Triceps', 'dumbbells', ['lower back'], 'Keep the upper arm still and straighten the elbow without swinging.'),
  ex('overhead-triceps-extension', 'Overhead triceps extension', ['Arms'], 'Triceps', 'dumbbells', ['shoulders'], 'Keep the ribs down and use a comfortable shoulder position.'),
  ex('band-pressdown', 'Resistance-band pressdown', ['Arms'], 'Triceps', 'bands', [], 'Pin the elbows near the sides and finish by straightening the arms.'),
  ex('cable-pressdown', 'Cable triceps pressdown', ['Arms'], 'Triceps', 'cable', [], 'Keep the elbows still and avoid leaning body weight into the handle.'),
  ex('overhead-cable-triceps-extension', 'Overhead cable triceps extension', ['Arms'], 'Triceps', 'cable', ['shoulders'], 'Keep the upper arms steady and extend the elbows without arching the lower back.'),
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
  ex('standing-hip-flexor-mobility', 'Standing hip-flexor mobility', ['Mobility + recovery'], 'Hip mobility', 'bodyweight', [], 'Use a split stance, tuck the pelvis gently, and shift forward without arching the lower back.', 'mobility'),
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
  restUntil: savedCurrent?.restUntil || null,
  timerId: null,
  focusNotice: '',
  onboarding: {
    step: 0,
    draft: null
  },
  settingsDraft: null,
  quickAdjustment: null,
  adjustmentDraft: null,
  adjustmentReturn: 'home',
  lastCompletedId: null
};

if (state.workout) {
  state.workout.completedSegments = Array.isArray(state.workout.completedSegments) ? state.workout.completedSegments : [];
  if (state.workout.source === 'plan' && !state.workout.planName) state.workout.planName = state.profile.splitName;
}
if (state.answers) {
  state.answers.constraints = Array.isArray(state.answers.constraints) ? state.answers.constraints : [];
  state.answers.equipmentDetails = normalizeEquipmentDetails(state.answers.equipmentDetails || state.profile.equipmentDetails, state.profile.setup, state.answers.equipment || state.profile.equipment);
}

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
  state.onboarding.draft.equipmentDetails = defaultEquipmentDetails(value, state.onboarding.draft.equipment);
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
  if (focuses.length === 1 && focuses[0] === 'Cardio') return 1;
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return minutes <= 20 ? 6 : 8;
  return minutes <= 20 ? 3 : minutes <= 30 ? 4 : minutes <= 45 ? 5 : minutes <= 60 ? 6 : 7;
}

function startPlanWorkout() {
  const step = getNextPlanStep();
  const adjustment = consumeAdjustment();
  state.answers = sessionAnswers(step.focuses, 'plan', adjustment);
  state.answers.planIndex = step.index;
  state.answers.planTitle = step.title;
  state.answers.planName = state.profile.splitName;
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
    temporaryAvoid: ['None'],
    constraints: []
  };
}

const todayConstraintChoices = [
  ['dumbbells-only', 'Dumbbells only'],
  ['no-bench', 'No bench'],
  ['no-floor', 'No floor'],
  ['standing-only', 'Standing only'],
  ['no-jumping', 'No jumping'],
  ['quiet', 'Quiet workout'],
  ['small-space', 'Small space'],
  ['no-kneeling', 'No kneeling'],
  ['no-overhead', 'No overhead'],
  ['no-band-anchor', 'No band anchor'],
  ['no-cable', 'No cable'],
  ['no-machines', 'No machines'],
  ['no-leg-press', 'No leg press'],
  ['no-hack-squat', 'No hack squat']
];

function sessionAnswers(focuses, source, adjustment) {
  const extraAvoid = adjustment?.temporaryAvoid || ['None'];
  const limitations = mergeLimitations(state.profile.limitations, extraAvoid);
  const constraints = [...new Set(adjustment?.constraints || [])];
  let equipment = [...state.profile.equipment];
  if (constraints.includes('dumbbells-only')) equipment = ['bodyweight', 'dumbbells'];
  if (constraints.includes('no-cable')) equipment = equipment.filter(item => item !== 'cable');
  if (constraints.includes('no-machines')) equipment = equipment.filter(item => item !== 'machine');

  return {
    focuses: [...focuses],
    goal: state.profile.goal,
    time: adjustment?.time || state.profile.duration,
    equipment,
    equipmentDetails: clone(state.profile.equipmentDetails || defaultEquipmentDetails(state.profile.setup, state.profile.equipment)),
    constraints,
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
  state.adjustmentDraft = clone(state.quickAdjustment || defaultAdjustment());
  renderAdjustment();
}

function renderAdjustment() {
  state.view = 'adjust';
  const adjustment = state.adjustmentDraft || defaultAdjustment();
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
      <div class="field-label">Anything different today?</div>
      <p class="helper" style="margin-top:0">Optional. These changes apply to this workout only.</p>
      <div class="option-grid two-column">
        ${todayConstraintChoices.map(([value, label]) => optionButton(
          label,
          adjustment.constraints.includes(value),
          `toggleAdjustmentConstraint('${value}')`,
          true
        )).join('')}
      </div>
      ${adjustment.constraints.length ? `<div class="context-summary"><strong>For this workout</strong><span>${escapeHtml(constraintSummary(adjustment.constraints))}</span></div>` : ''}
    </section>
    <section class="card">
      <div class="field-label">Avoid today</div>
      <p class="helper" style="margin-top:0">Temporary body-area cautions apply only to the next workout.</p>
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
      <button class="primary-button" onclick="saveAdjustment()">Apply changes</button>
      <button class="text-button centered" onclick="resetAdjustmentDraft()">Clear changes</button>
    </div>`;
}

function setAdjustmentTime(value) {
  state.adjustmentDraft.time = Number(value);
  renderAdjustment();
}

function setAdjustmentIntensity(value) {
  state.adjustmentDraft.intensity = value;
  renderAdjustment();
}

function toggleAdjustmentAvoid(value) {
  let array = [...state.adjustmentDraft.temporaryAvoid];
  if (value === 'None') {
    array = ['None'];
  } else {
    array = array.filter(item => item !== 'None');
    array = array.includes(value) ? array.filter(item => item !== value) : [...array, value];
    if (!array.length) array = ['None'];
  }
  state.adjustmentDraft.temporaryAvoid = array;
  renderAdjustment();
}

function toggleAdjustmentConstraint(value) {
  const constraints = [...state.adjustmentDraft.constraints];
  state.adjustmentDraft.constraints = constraints.includes(value)
    ? constraints.filter(item => item !== value)
    : [...constraints, value];
  renderAdjustment();
}

function constraintSummary(constraints) {
  const labels = new Map(todayConstraintChoices);
  return constraints.map(value => labels.get(value) || value).join(' · ');
}

function saveAdjustment() {
  state.quickAdjustment = clone(state.adjustmentDraft || defaultAdjustment());
  state.adjustmentDraft = null;
  if (state.adjustmentReturn === 'focus') renderFocusPicker();
  else renderHome();
}

function cancelAdjustment() {
  state.adjustmentDraft = null;
  if (state.adjustmentReturn === 'focus') renderFocusPicker();
  else renderHome();
}

function resetAdjustmentDraft() {
  state.adjustmentDraft = defaultAdjustment();
  renderAdjustment();
}

function adjustmentLabel() {
  const adjustment = state.quickAdjustment;
  if (!adjustment) return `Adjust workout · ${state.profile.duration} min`;
  const parts = [`${adjustment.time} min`];
  if (adjustment.intensity !== 'Standard') parts.push(adjustment.intensity);
  if (!adjustment.temporaryAvoid.includes('None')) parts.push('temporary caution');
  if (adjustment.constraints?.length) parts.push(`${adjustment.constraints.length} setup change${adjustment.constraints.length === 1 ? '' : 's'}`);
  return `Adjusted · ${parts.join(' · ')}`;
}

function consumeAdjustment() {
  const adjustment = clone(state.quickAdjustment || defaultAdjustment());
  state.quickAdjustment = null;
  state.adjustmentDraft = null;
  return adjustment;
}

function resolveFocuses(selected) {
  if (selected.includes('Full body')) {
    return rankFocusesByNeed(['Legs', 'Chest', 'Back', 'Glutes', 'Core', 'Shoulders']);
  }
  if (selected.includes('Upper body')) {
    return rankFocusesByNeed(['Back', 'Chest', 'Shoulders', 'Arms']);
  }
  if (selected.includes('Pick for me')) {
    return pickFocusesFromHistory();
  }
  return [...selected];
}

function recentFocusExposure(limit = 5) {
  const pool = ['Glutes', 'Legs', 'Quads', 'Hamstrings', 'Calves', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'];
  const counts = Object.fromEntries(pool.map(focus => [focus, 0]));

  state.history.slice(0, limit).forEach((workout, index) => {
    const recencyWeight = Math.max(1, limit - index);
    let usedDetails = false;

    (workout.details || []).forEach(detail => {
      const completedSets = (detail.sets || []).filter(set => set.done).length;
      if (!completedSets) return;
      const exercise = exerciseLibrary.find(item => item.id === detail.id || (!detail.id && item.name === detail.name));
      if (!exercise) return;
      usedDetails = true;
      [...new Set(exercise.focuses)].forEach(focus => {
        if (counts[focus] !== undefined) counts[focus] += recencyWeight * Math.min(2, completedSets / 2);
      });
    });

    if (!usedDetails) {
      (workout.focuses || []).forEach(focus => {
        if (counts[focus] !== undefined) counts[focus] += recencyWeight;
      });
    }
  });

  return counts;
}

function rankFocusesByNeed(pool) {
  const counts = recentFocusExposure(5);
  const priorities = new Set(state.profile.musclePriorities || []);
  return [...pool].sort((a, b) => {
    const aScore = (counts[a] || 0) - (priorities.has(a) ? 2 : 0);
    const bScore = (counts[b] || 0) - (priorities.has(b) ? 2 : 0);
    return aScore - bScore;
  });
}

function pickFocusesFromHistory() {
  const pool = ['Glutes', 'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core'];
  const ranked = rankFocusesByNeed(pool);
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

  const warmup = getWarmupMinutes(state.answers.time, resolvedFocuses);
  const cooldown = getCooldownMinutes(state.answers.time, resolvedFocuses);
  const prescription = getBasePrescription();
  const initiallyPrescribed = selectedExercises.map((item, index) =>
    prescribeExercise(item, prescription, index, selectedExercises.length, warmup, cooldown)
  );
  const exercises = fitWorkoutToTime(initiallyPrescribed, state.answers.time, warmup, cooldown, resolvedFocuses);
  const limitationNote = buildLimitationNote();
  const goalNote = state.answers.goal === 'Lose fat / get leaner'
    ? 'This workout supports fitness and energy expenditure. Fat loss cannot be targeted to one body area.'
    : '';
  const estimatedMinutes = estimateWorkoutMinutes(exercises, warmup, cooldown);

  state.workout = {
    id: `workout-${Date.now()}`,
    title: state.answers.planTitle || workoutTitle(state.answers.focuses),
    note: `${state.answers.goal} · ${equipmentSummary(state.answers.equipment)}${state.answers.constraints?.length ? ` · ${constraintSummary(state.answers.constraints)}` : ''}`,
    focuses: [...state.answers.focuses],
    resolvedFocuses,
    source: state.answers.source,
    planIndex: state.answers.planIndex,
    planName: state.answers.planName || null,
    constraints: [...(state.answers.constraints || [])],
    targetMinutes: state.answers.time,
    estimatedMinutes,
    warmup,
    cooldown,
    guidance: [goalNote, limitationNote, buildTimeNote(resolvedFocuses, estimatedMinutes)].filter(Boolean),
    exercises,
    swaps: [],
    skipped: [],
    rejectedFamilies: [],
    completedSegments: []
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

function detailAvailable(token, answers) {
  const details = answers.equipmentDetails || {};
  const constraints = answers.constraints || [];
  const dumbbellsOnly = constraints.includes('dumbbells-only');

  if (token === 'floor') return details.floor !== false && !constraints.includes('no-floor') && !constraints.includes('standing-only');
  if (token === 'bench') return Boolean(details.bench) && !constraints.includes('no-bench') && !dumbbellsOnly;
  if (token === 'chair') return Boolean(details.chair) && !dumbbellsOnly;
  if (token === 'step') return Boolean(details.step) && !dumbbellsOnly;
  if (token === 'wall') return details.wall !== false;
  if (token === 'sliders') return Boolean(details.sliders) && !dumbbellsOnly;
  if (token === 'stabilityBall') return Boolean(details.stabilityBall) && !dumbbellsOnly;
  if (token === 'jumpRope') return Boolean(details.jumpRope) && !dumbbellsOnly;
  if (token === 'rack') return Boolean(details.rack) && !dumbbellsOnly;
  if (token === 'landmine') return Boolean(details.landmine) && !dumbbellsOnly;
  if (token === 'dualCable') return Boolean(details.dualCable) && answers.equipment.includes('cable');
  if (token === 'cableRowStation') return Boolean(details.cableRowStation) && answers.equipment.includes('cable');
  if (token === 'ankleCuff') return Boolean(details.ankleCuff) && answers.equipment.includes('cable');
  if (token === 'bandAnchorHigh') return Boolean(details.bandAnchorHigh) && !constraints.includes('no-band-anchor');
  if (token === 'bandAnchorMid') return Boolean(details.bandAnchorMid) && !constraints.includes('no-band-anchor');
  if (token.startsWith('machine:')) return answers.equipment.includes('machine') && Boolean(details[token.slice(8)]);
  if (token.startsWith('cardio:')) return answers.equipment.includes('cardio') && Boolean(details[token.slice(7)]);
  return true;
}

function anyDetailAvailable(group, answers) {
  return group.some(token => detailAvailable(token, answers));
}

function constraintsAllow(item, answers) {
  const constraints = answers.constraints || [];
  const requirements = item.requirements || {};
  const postures = requirements.postures || [];

  if (constraints.includes('no-floor') && requirements.floorContact) return false;
  if (constraints.includes('standing-only') && postures.some(value => ['seated','kneeling','supine','prone','sideLying'].includes(value))) return false;
  if (constraints.includes('no-kneeling') && postures.includes('kneeling')) return false;
  if (constraints.includes('no-overhead') && postures.includes('overhead')) return false;
  if (constraints.includes('no-jumping') && requirements.jumping) return false;
  if (constraints.includes('quiet') && requirements.noiseLevel === 'high') return false;
  if (constraints.includes('small-space') && requirements.spaceClass === 'large') return false;
  if (constraints.includes('no-leg-press') && ['leg-press','leg-press-calf-raise'].includes(item.id)) return false;
  if (constraints.includes('no-hack-squat') && item.id === 'hack-squat') return false;
  return true;
}

function isEligible(item, answers) {
  if (!item.requires.every(required => answers.equipment.includes(required))) return false;
  if (!constraintsAllow(item, answers)) return false;

  const requirements = item.requirements || { needs: [], needsAny: [] };
  if ((requirements.needs || []).some(token => !detailAvailable(token, answers))) return false;
  if ((requirements.needsAny || []).some(group => !anyDetailAvailable(group, answers))) return false;

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
  if (focuses.length === 1 && focuses[0] === 'Cardio') return 1;
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return minutes <= 20 ? 6 : 8;

  // Start with a slightly deeper candidate pool. fitWorkoutToTime() then trims
  // sets or lower-priority movements so the final prescription respects time.
  let count = estimateExerciseCount(minutes, focuses) + 1;
  count = Math.max(count, Math.min(focuses.length, 6));

  const singleFocus = state.answers.focuses.length === 1 ? state.answers.focuses[0] : '';
  if (['Calves', 'Arms'].includes(singleFocus)) count = Math.min(count, 5);
  if (state.answers.intensity === 'Easier') count = Math.max(Math.min(focuses.length, 4), count - 1);
  return Math.min(count, 8);
}

function getWarmupMinutes(minutes, focuses) {
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return 2;
  return minutes <= 20 ? 3 : minutes <= 35 ? 4 : 5;
}

function getCooldownMinutes(minutes, focuses) {
  if (focuses.length === 1 && focuses[0] === 'Mobility + recovery') return 2;
  return minutes <= 20 ? 2 : 3;
}

function buildTimeNote(resolvedFocuses, estimatedMinutes) {
  if (state.answers.time <= 20 && resolvedFocuses.length >= 3) {
    return 'Form kept the highest-value movements and adjusted working sets to fit the shorter session.';
  }
  if (Math.abs(estimatedMinutes - state.answers.time) >= 5) {
    return `This session is estimated at about ${estimatedMinutes} minutes based on its sets and rest periods.`;
  }
  return '';
}

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
  const usedFamilies = new Set();
  const queues = focuses.map(focus => ({
    focus,
    items: rankedForFocus(eligible, focus)
  }));

  function add(item) {
    selected.push(item);
    used.add(item.id);
    usedFamilies.add(item.family);
  }

  // First cover each requested area. If an already-selected compound movement
  // covers the area, do not add a redundant exercise just to satisfy the label.
  for (const queue of queues) {
    if (selected.length >= desiredCount) break;
    if (selected.some(item => item.focuses.includes(queue.focus))) continue;
    const next = queue.items.find(item => !used.has(item.id) && !usedFamilies.has(item.family))
      || queue.items.find(item => !used.has(item.id));
    if (next) add(next);
  }

  const focusSet = new Set(focuses);
  const remaining = eligible
    .filter(item => !used.has(item.id) && item.focuses.some(focus => focusSet.has(focus)))
    .sort((a, b) => {
      const familyPenaltyA = usedFamilies.has(a.family) ? 2.5 : 0;
      const familyPenaltyB = usedFamilies.has(b.family) ? 2.5 : 0;
      return (exercisePriority(b, focuses[0]) - familyPenaltyB) - (exercisePriority(a, focuses[0]) - familyPenaltyA);
    });

  for (const item of remaining) {
    if (selected.length >= desiredCount) break;
    // Prefer movement-family variety while enough alternatives remain.
    if (usedFamilies.has(item.family)) {
      const diverseAlternative = remaining.find(other =>
        !used.has(other.id) && !usedFamilies.has(other.family) && other.focuses.some(focus => focusSet.has(focus))
      );
      if (diverseAlternative) continue;
    }
    add(item);
  }

  // If family diversity caused an earlier candidate to be skipped, fill any
  // remaining slots only after the diverse options have been considered.
  for (const item of remaining) {
    if (selected.length >= desiredCount) break;
    if (!used.has(item.id)) add(item);
  }

  return selected.slice(0, desiredCount);
}

function exercisePriority(item, focus) {
  let score = 0;
  if (item.focuses[0] === focus) score += 3;
  if (item.kind === 'strength') score += 2;
  if (item.role === 'compound') score += 4;
  if (['Build muscle', 'Get stronger'].includes(state.answers.goal) && item.tracking === 'weight') score += 1;
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
  // These are broad defaults only. prescribeExercise() further adjusts by
  // exercise role so a heavy compound and a small accessory are not treated alike.
  return {
    goal: state.answers.goal,
    experience: state.answers.experience,
    intensity: state.answers.intensity,
    time: state.answers.time
  };
}

function strengthPrescription(item, base) {
  const compound = item.role === 'compound';
  const accessoryHighRep = ['shoulder-accessory', 'elbow-flexion', 'elbow-extension', 'calf-raise', 'hip-abduction', 'chest-fly'].includes(item.family);
  let sets = 3;
  let reps = compound ? '6–10' : (accessoryHighRep ? '10–15' : '8–12');
  let rest = compound ? 105 : 75;

  if (base.goal === 'Get stronger') {
    if (compound) {
      sets = base.experience === 'Beginner' ? 3 : 4;
      reps = '4–6';
      rest = base.experience === 'Advanced' ? 180 : base.experience === 'Intermediate' ? 150 : 120;
    } else {
      sets = 2;
      reps = accessoryHighRep ? '10–15' : '8–12';
      rest = 75;
    }
  } else if (base.goal === 'Build muscle') {
    sets = compound ? 3 : 3;
    reps = compound ? '6–12' : (accessoryHighRep ? '10–15' : '8–15');
    rest = compound ? 120 : 75;
  } else if (base.goal === 'Lose fat / get leaner') {
    // Fat-loss goals do not require turning every resistance exercise into a
    // short-rest, high-rep circuit. Keep the lifting productive and sustainable.
    sets = compound ? 3 : 2;
    reps = compound ? '6–12' : (accessoryHighRep ? '10–15' : '8–15');
    rest = compound ? 90 : 60;
  } else if (base.goal === 'Maintain') {
    sets = compound ? 3 : 2;
    reps = compound ? '6–12' : (accessoryHighRep ? '10–15' : '8–15');
    rest = compound ? 90 : 60;
  } else {
    sets = compound ? 3 : 2;
    reps = compound ? '6–12' : (accessoryHighRep ? '10–15' : '8–15');
    rest = compound ? 90 : 60;
  }

  if (item.unilateral && !reps.includes('/ side')) reps = `${reps} / side`;
  if (base.experience === 'Beginner') sets = Math.min(sets, 3);
  if (base.intensity === 'Easier') sets = Math.max(1, sets - 1);
  if (base.intensity === 'Harder' && base.time >= 40) sets += 1;

  return { sets, reps, rest };
}

function cardioPrescription(item, activeMinutes) {
  const minutes = Math.max(8, Math.round(activeMinutes));
  return { sets: 1, reps: `${minutes} min`, rest: 0 };
}

function mobilityPrescription(item, base) {
  const staticHold = /stretch|child-pose|side-bend/.test(item.id);
  const sideToSide = /9090|thoracic-rotation|hamstring-sweep|ankle-rock/.test(item.id);
  const reps = staticHold ? '30–45 sec / side' : (sideToSide ? '6–8 / side' : '6–8 slow reps');
  let sets = base.time <= 30 ? 2 : 3;
  if (base.intensity === 'Easier') sets = Math.max(1, sets - 1);
  if (base.intensity === 'Harder' && base.time >= 40) sets += 1;
  return { sets, reps, rest: 0 };
}

function timePrescription(item, base) {
  let sets = base.time <= 20 ? 2 : 3;
  if (base.intensity === 'Easier') sets = Math.max(1, sets - 1);
  if (base.intensity === 'Harder' && base.time >= 40) sets += 1;
  return { sets, reps: '25–40 sec', rest: 60 };
}

function prescribeExercise(item, base, index, totalExercises, warmup, cooldown) {
  const activeMinutes = Math.max(5, state.answers.time - warmup - cooldown);
  let prescribed;

  if (item.kind === 'mobility') prescribed = mobilityPrescription(item, base);
  else if (item.kind === 'cardio') prescribed = cardioPrescription(item, activeMinutes / Math.max(1, totalExercises));
  else if (item.kind === 'time') prescribed = timePrescription(item, base);
  else prescribed = strengthPrescription(item, base);

  if (index > 2 && state.answers.time <= 30 && item.kind === 'strength') {
    prescribed.sets = Math.max(1, prescribed.sets - 1);
  }

  const performance = getPreviousPerformance(item, prescribed.reps);
  const prefillWeight = item.tracking === 'weight'
    ? (performance?.recommendedWeight ?? performance?.lastWeight ?? '')
    : '';

  return {
    ...item,
    ...prescribed,
    doseCap: prescribed.sets,
    previousPerformance: performance?.summary || '',
    recommendedWeight: performance?.recommendedWeight || '',
    setData: Array.from({ length: prescribed.sets }, () => ({
      weight: item.tracking === 'weight' ? String(prefillWeight || '') : '',
      reps: '',
      done: false
    }))
  };
}

function parseRepMidpoint(value) {
  const numbers = String(value).match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (!numbers.length) return 10;
  return numbers.length >= 2 ? (numbers[0] + numbers[1]) / 2 : numbers[0];
}

function estimateExerciseSeconds(item) {
  const setupSeconds = item.kind === 'strength'
    ? (item.tracking === 'weight' ? 40 : 20)
    : item.kind === 'cardio' ? 20 : 12;

  if (item.kind === 'cardio') {
    const minutes = parseRepMidpoint(item.reps);
    return setupSeconds + minutes * 60;
  }

  let workPerSet;
  if (item.kind === 'mobility') {
    workPerSet = String(item.reps).includes('/ side') ? 70 : 45;
  } else if (item.kind === 'time') {
    workPerSet = parseRepMidpoint(item.reps);
  } else {
    const reps = parseRepMidpoint(item.reps);
    const repCount = item.unilateral ? reps * 2 : reps;
    workPerSet = Math.max(20, repCount * 3.2);
  }

  const rests = Math.max(0, item.sets - 1) * item.rest;
  return setupSeconds + (item.sets * workPerSet) + rests;
}

function estimateWorkoutMinutes(exercises, warmup, cooldown) {
  const exerciseSeconds = exercises.reduce((sum, item) => sum + estimateExerciseSeconds(item), 0);
  const transitionSeconds = Math.max(0, exercises.length - 1) * 20;
  return Math.max(1, Math.round(warmup + cooldown + (exerciseSeconds + transitionSeconds) / 60));
}

function minimumSetsFor(item, focuses) {
  if (item.kind === 'cardio' || item.kind === 'mobility') return 1;
  if (state.answers.time <= 20 && focuses.length >= 3) return 1;
  return 2;
}

function maximumSetsFor(item) {
  if (Number.isFinite(Number(item.doseCap))) return Number(item.doseCap);
  if (item.kind === 'cardio' || item.kind === 'mobility') return 1;
  if (item.role === 'compound' && state.answers.goal === 'Get stronger') return 5;
  if (item.role === 'compound') return 4;
  return 3;
}

function resizeSetData(item, sets) {
  const existing = Array.isArray(item.setData) ? item.setData : [];
  const seedWeight = existing[0]?.weight || '';
  item.sets = sets;
  item.setData = Array.from({ length: sets }, (_, index) => existing[index] || {
    weight: item.tracking === 'weight' ? seedWeight : '',
    reps: '',
    done: false
  });
}

function focusWouldBeLost(exercises, removeIndex, focuses) {
  const remaining = exercises.filter((_, index) => index !== removeIndex);
  return focuses.some(focus =>
    exercises[removeIndex].focuses.includes(focus) && !remaining.some(item => item.focuses.includes(focus))
  );
}

function fitWorkoutToTime(exercises, targetMinutes, warmup, cooldown, focuses) {
  const fitted = exercises.map(item => ({ ...item, setData: item.setData.map(set => ({ ...set })) }));
  const upperTarget = targetMinutes + 2;
  const lowerTarget = Math.max(8, targetMinutes - 4);

  // First reduce lower-priority accessory volume before deleting movements.
  let guard = 0;
  while (estimateWorkoutMinutes(fitted, warmup, cooldown) > upperTarget && guard++ < 50) {
    let changed = false;
    for (let index = fitted.length - 1; index >= 0; index--) {
      const item = fitted[index];
      const minimum = minimumSetsFor(item, focuses);
      if (item.sets > minimum && (item.role === 'accessory' || index >= 2)) {
        resizeSetData(item, item.sets - 1);
        changed = true;
        break;
      }
    }
    if (changed) continue;

    for (let index = fitted.length - 1; index >= 0; index--) {
      if (fitted.length <= 1) break;
      if (!focusWouldBeLost(fitted, index, focuses)) {
        fitted.splice(index, 1);
        changed = true;
        break;
      }
    }
    if (changed) continue;

    for (let index = fitted.length - 1; index >= 0; index--) {
      const item = fitted[index];
      const minimum = minimumSetsFor(item, focuses);
      if (item.sets > minimum) {
        resizeSetData(item, item.sets - 1);
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }

  // If there is meaningful unused time, add productive volume to the highest-value
  // movements rather than adding filler exercises.
  guard = 0;
  while (estimateWorkoutMinutes(fitted, warmup, cooldown) < lowerTarget && guard++ < 20) {
    const candidate = fitted.find(item => item.sets < maximumSetsFor(item) && item.kind !== 'cardio' && item.kind !== 'mobility');
    if (!candidate) break;
    const before = candidate.sets;
    resizeSetData(candidate, before + 1);
    if (estimateWorkoutMinutes(fitted, warmup, cooldown) > upperTarget) {
      resizeSetData(candidate, before);
      break;
    }
  }

  // A single cardio modality should fill the active time budget directly.
  if (fitted.length === 1 && fitted[0].kind === 'cardio') {
    const activeMinutes = Math.max(8, targetMinutes - warmup - cooldown);
    fitted[0].reps = `${Math.round(activeMinutes)} min`;
    fitted[0].sets = 1;
    resizeSetData(fitted[0], 1);
  }

  return fitted;
}

function getPreviousPerformance(item, currentRepRange) {
  const record = findLastExerciseRecord(item.id, item.name);
  if (!record) return null;

  const completed = (record.detail.sets || []).filter(set => set && set.done);
  if (!completed.length) return null;

  const mode = item.tracking;
  const lastCompleted = completed.at(-1);
  const lastWeight = mode === 'weight' ? Number(lastCompleted?.weight) || null : null;
  const lastReps = Number(lastCompleted?.reps);
  let summary = '';

  if (mode === 'weight' && lastWeight && Number.isFinite(lastReps)) summary = `${formatNumber(lastWeight)} lb × ${lastReps}`;
  else if (mode === 'bodyweight' && Number.isFinite(lastReps)) summary = `Bodyweight × ${lastReps}`;
  else if (mode === 'band' && lastCompleted?.weight && Number.isFinite(lastReps)) summary = `${lastCompleted.weight} band × ${lastReps}`;
  else if (Number.isFinite(lastReps)) summary = `${lastReps} reps`;
  else if (lastWeight) summary = `${formatNumber(lastWeight)} lb`;
  else if (mode === 'band' && lastCompleted?.weight) summary = `${lastCompleted.weight} band`;
  else if (lastCompleted?.reps) summary = String(lastCompleted.reps);

  let recommendedWeight = null;
  const upper = repRangeUpper(currentRepRange);
  const weighted = completed.filter(set => Number(set.weight) > 0 && Number.isFinite(Number(set.reps)));
  const weights = weighted.map(set => Number(set.weight));
  const workingWeight = weights.length ? modeWeight(weights) : null;
  const workingSets = workingWeight
    ? weighted.filter(set => Number(set.weight) === workingWeight)
    : [];
  const intendedSets = Math.max(1, Number(record.detail.prescription?.sets) || completed.length);
  const minimumComparableSets = Math.min(2, intendedSets);
  const allAtTop = upper && workingSets.length >= minimumComparableSets && workingSets.every(set => Number(set.reps) >= upper);
  const hardLastTime = record.workout.feedback === 'Too hard';

  if (mode === 'weight' && workingWeight && allAtTop && !hardLastTime) {
    const increment = progressionIncrement(item);
    recommendedWeight = roundToIncrement(workingWeight + increment, increment);
  }

  return {
    summary,
    lastWeight: workingWeight || lastWeight,
    lastReps: Number.isFinite(lastReps) ? lastReps : null,
    recommendedWeight
  };
}

function modeWeight(values) {
  const counts = new Map();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || values.lastIndexOf(b[0]) - values.lastIndexOf(a[0]))[0]?.[0] || null;
}

function findLastExerciseRecord(id, name) {
  for (const workout of state.history) {
    const detail = (workout.details || []).find(item => {
      const matches = item.id ? item.id === id : item.name === name;
      return matches && (item.sets || []).some(set => set && set.done);
    });
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
    ['shoulder-accessory', 'elbow-flexion', 'elbow-extension', 'calf-raise', 'hip-abduction', 'chest-fly'].includes(item.family)
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

function prescriptionText(item) {
  const sets = `${item.sets} ${item.sets === 1 ? 'set' : 'sets'}`;
  if (!item.rest) return `${sets} · ${item.reps}`;
  return `${sets} · ${item.reps} · ${item.rest}s rest`;
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
      <div class="exercise-prescription">${escapeHtml(prescriptionText(item))}</div>
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

function prescribeReplacementForRemaining(replacement, current, index) {
  const completedSets = current.setData.filter(set => set.done);
  const remainingCount = Math.max(1, current.sets - completedSets.length);
  const base = getBasePrescription();
  const prescribed = prescribeExercise(
    replacement,
    base,
    index,
    state.workout.exercises.length,
    state.workout.warmup,
    state.workout.cooldown
  );
  resizeSetData(prescribed, Math.min(remainingCount, prescribed.sets));
  prescribed.doseCap = prescribed.sets;
  return prescribed;
}

function archiveCompletedSwapWork(current, index) {
  const completedSets = current.setData.filter(set => set.done).map(set => ({ ...set }));
  if (!completedSets.length) return;
  state.workout.completedSegments = state.workout.completedSegments || [];
  state.workout.completedSegments.push({
    id: current.id,
    name: current.name,
    family: current.family,
    pattern: current.pattern,
    muscle: current.muscle,
    kind: current.kind,
    tracking: current.tracking,
    unilateral: Boolean(current.unilateral),
    sideBasis: current.sideBasis || '',
    loadBasis: current.loadBasis || '',
    prescription: { sets: current.sets, reps: current.reps, rest: current.rest },
    sets: completedSets,
    order: index,
    swappedOut: true
  });
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
  safeSave(STORAGE.behavior, state.behavior);
}

function applySwapAt(index, replacement) {
  const current = state.workout.exercises[index];
  archiveCompletedSwapWork(current, index);
  recordSwap(current, replacement);
  state.workout.exercises[index] = prescribeReplacementForRemaining(replacement, current, index);
  state.restUntil = null;
  state.workout.estimatedMinutes = estimateWorkoutMinutes(state.workout.exercises, state.workout.warmup, state.workout.cooldown);
  persistCurrent();
}

function swapExercise(index) {
  const replacement = findSwap(index);
  if (!replacement) return;
  applySwapAt(index, replacement);
  showWorkout();
}

const howToOverrides = {
  "barbell-hip-thrust": [
    "Brace a stable bench and position a padded bar across the hip crease.",
    "Lift the hips until the torso and thighs align.",
    "Keep the bench still and finish without leaning back through the spine."
  ],
  "dumbbell-glute-bridge": [
    "Lie on the floor with knees bent and secure one weight across the hips.",
    "Press through the feet and raise the hips.",
    "Hold the weight securely and avoid arching at the top."
  ],
  "bodyweight-glute-bridge": [
    "Lie on your back with knees bent and feet flat.",
    "Lift the hips, pause briefly, then lower.",
    "Keep the ribs down rather than lifting by arching your back."
  ],
  "single-leg-glute-bridge": [
    "Lie on your back and lift one foot while keeping the other planted.",
    "Raise the hips using the planted leg; repeat on the other side.",
    "Stop the set when the pelvis twists or drops."
  ],
  "cable-kickback": [
    "Attach a cuff to one ankle and face a low pulley in a steady stance.",
    "Move the working leg back from the hip, then return slowly.",
    "Do not swing the leg or arch the lower back to gain range."
  ],
  "banded-lateral-walk": [
    "Place a loop band above the knees and take a small comfortable squat.",
    "Step sideways with short controlled steps, then return.",
    "Keep tension without rocking the torso or letting the knees collapse inward."
  ],
  "frog-pump": [
    "Lie on your back with soles together and knees open comfortably.",
    "Lift and lower the hips through a small controlled range.",
    "Do not force the knees wide or extend through the lower back."
  ],
  "reverse-lunge": [
    "Stand with feet apart and clear the space behind you.",
    "Step one foot back, lower comfortably, and push through the front foot to return.",
    "Keep the front foot planted and use support or a shorter range if balance is poor."
  ],
  "dumbbell-reverse-lunge": [
    "Hold a matched pair at your sides with room to step back.",
    "Step back and lower, then return through the front leg.",
    "Keep the weights still and do not rush the change of direction."
  ],
  "step-up": [
    "Use a stable exercise step at a manageable height and place the full foot on it.",
    "Drive through the elevated leg and lower slowly.",
    "Avoid launching off the trailing foot or using an unstable chair."
  ],
  "dumbbell-bulgarian-split-squat": [
    "Place the rear foot on a stable suitable support and set a balanced split stance.",
    "Lower under control and drive through the front foot.",
    "Choose a lower support or floor split squat if balance or position is not controlled."
  ],
  "machine-hip-abduction": [
    "Adjust the seat and pads so the hips stay comfortable and supported.",
    "Open the legs smoothly and return slowly.",
    "Keep the pelvis still and avoid bouncing the pads."
  ],
  "bodyweight-squat": [
    "Stand in a comfortable stance with the whole foot on the floor.",
    "Sit down between the hips, then stand.",
    "Use a range you control without heels lifting or balance shifting abruptly."
  ],
  "goblet-squat": [
    "Hold one weight securely at your chest with feet in a comfortable stance.",
    "Lower between the hips and stand through the whole foot.",
    "Keep the weight close and stop before posture or balance is lost."
  ],
  "barbell-back-squat": [
    "Set rack and safeties to appropriate heights and establish a secure bar position.",
    "Brace, lower within control, then stand.",
    "Practice unracking and reracking; do not work beyond a safely managed effort."
  ],
  "leg-press": [
    "Adjust the seat and stops so the hips stay supported through a comfortable range.",
    "Bend the knees, then press the platform away smoothly.",
    "Do not let the pelvis roll off the pad or force the knees into lockout."
  ],
  "hack-squat": [
    "Set the machine stops and place shoulders and back securely against the pads.",
    "Lower with feet planted, then stand smoothly.",
    "Stay within a controlled depth and learn the release and return mechanism first."
  ],
  "leg-extension": [
    "Align the knee with the machine pivot and set the pad above the ankle.",
    "Straighten the knees smoothly, then lower.",
    "Keep the hips down and avoid kicking or snapping into the end range."
  ],
  "wall-sit": [
    "Lean against a clear wall and slide to a comfortable knee bend.",
    "Hold while breathing steadily.",
    "Use a shallower position if needed and stop before sliding or straining."
  ],
  "heel-elevated-squat": [
    "Place heels on a stable low wedge with the forefoot planted.",
    "Squat and stand with controlled knee travel.",
    "Keep the support from shifting and do not force extra depth."
  ],
  "split-squat": [
    "Set a split stance with both feet on the floor.",
    "Lower straight down and rise mainly through the front leg.",
    "Widen the stance slightly or shorten the range if balance is poor."
  ],
  "dumbbell-split-squat": [
    "Hold a matched pair at your sides and place both feet in a steady split stance.",
    "Lower and rise mainly through the front leg.",
    "Keep the front foot flat and do not use a stance you cannot balance."
  ],
  "dumbbell-rdl": [
    "Stand with soft knees and hold the weights close to the thighs.",
    "Send the hips back, then return to standing.",
    "Stop where the hinge remains controlled; do not reach lower by rounding the back."
  ],
  "barbell-rdl": [
    "Start standing with a securely loaded bar, using a taught safe pickup or rack.",
    "Hinge the hips back with the bar close, then stand.",
    "Keep knees softly bent and stop before the torso position changes to gain depth."
  ],
  "conventional-deadlift": [
    "Set the bar at an appropriate height over the midfoot and establish a braced grip.",
    "Push through the floor and stand tall with the bar close.",
    "Lower under control; avoid jerking from the floor or leaning back at the top."
  ],
  "cable-pull-through": [
    "Face away from a low pulley and hold the rope between the legs with cable tension.",
    "Hinge back, then drive the hips forward to stand.",
    "Keep the arms quiet and do not overextend the lower back."
  ],
  "slider-hamstring-curl": [
    "Lie with heels on suitable sliders and raise the hips to a controlled bridge.",
    "Slide the feet out and draw them back while controlling the hips.",
    "Shorten the range if the hips drop or the sliding surface is unpredictable."
  ],
  "stability-ball-curl": [
    "Lie with heels on a stable ball and arms positioned for balance.",
    "Lift the hips and roll the ball toward you, then extend slowly.",
    "Stop if the ball rolls away or you cannot keep the hips controlled."
  ],
  "lying-leg-curl": [
    "Align the knees with the pivot and place the roller above the heels.",
    "Curl the heels toward the hips, then lower slowly.",
    "Keep the hips against the pad and avoid kicking the load."
  ],
  "seated-leg-curl": [
    "Adjust the knee pivot, ankle roller and thigh pad for a secure seat.",
    "Bend the knees against the resistance and return smoothly.",
    "Keep the hips against the seat and avoid lifting under the thigh pad."
  ],
  "single-leg-rdl": [
    "Balance on one foot with a soft knee and space behind you.",
    "Reach the free leg back while hinging, then stand.",
    "Keep hips facing the floor and use support if balance limits the movement."
  ],
  "standing-calf-raise": [
    "Stand with both feet on level ground and establish balance.",
    "Rise onto the balls of the feet, pause, and lower.",
    "Move slowly without bouncing or rolling to the outer feet."
  ],
  "single-leg-calf-raise": [
    "Stand on one foot on level ground and lightly hold a stable support.",
    "Raise and lower the heel with control.",
    "Use the support for balance, not to pull yourself upward."
  ],
  "dumbbell-calf-raise": [
    "Stand on level ground with a matched pair at your sides.",
    "Lift both heels, pause, and lower slowly.",
    "Keep balance and avoid bouncing or dropping the weights."
  ],
  "seated-calf-raise": [
    "Place the forefeet on the machine support and set the thigh pad securely.",
    "Raise the heels, pause, and lower through a comfortable range.",
    "Keep the pads secure and avoid bouncing at the bottom."
  ],
  "leg-press-calf-raise": [
    "Use a machine designed for this movement and secure the forefeet on its platform.",
    "Move at the ankles while keeping the knee position steady.",
    "Do not let the feet slip off the edge or use a setup without suitable stops."
  ],
  "reverse-snow-angel": [
    "Lie face down with comfortable head support and room for the arms.",
    "Sweep the arms slowly through a small controlled arc.",
    "Do not shrug or lift the chest to force the arms farther."
  ],
  "prone-w-raise": [
    "Lie face down with elbows bent into a comfortable W.",
    "Lift hands and elbows slightly and lower with control.",
    "Keep the neck comfortable and avoid lifting by arching the back."
  ],
  "one-arm-row": [
    "Brace one hand on a stable suitable surface and hold the weight in the other.",
    "Draw the elbow back, then lower until the arm is long.",
    "Keep the torso steady rather than twisting to lift the weight."
  ],
  "chest-supported-row": [
    "Set a stable incline bench and lie chest-down with feet planted and arms clear.",
    "Pull elbows back and lower smoothly.",
    "Keep the chest supported without craning the neck or shrugging."
  ],
  "band-row": [
    "Secure a suitable band to a mid-height anchor and take a stable stance.",
    "Pull the elbows back, then return under tension.",
    "Check the anchor and band; do not lean backward to finish each rep."
  ],
  "band-pulldown": [
    "Fix the band to a suitable high anchor and stand where tension is manageable.",
    "Pull the elbows down toward the ribs and return slowly.",
    "Do not arch the back or use an unverified door attachment."
  ],
  "lat-pulldown": [
    "Adjust the seat and thigh pad and take a comfortable grip on the bar.",
    "Pull toward the upper chest, then let the arms extend under control.",
    "Keep the torso quiet and do not pull behind the neck."
  ],
  "seated-cable-row": [
    "Sit at a low-row station with feet braced and arms extended comfortably.",
    "Pull the handle toward the lower ribs, then return.",
    "Avoid rocking far backward or rounding forward to gain range."
  ],
  "machine-row": [
    "Set the seat so the chest rests securely on the pad and handles are reachable.",
    "Pull the elbows back and let the arms return slowly.",
    "Keep the chest on the pad and avoid shrugging."
  ],
  "inverted-row": [
    "Use a securely fixed suitable bar and choose a body angle you can control.",
    "Keep the body aligned and pull the chest toward the bar.",
    "Check the bar cannot roll or shift; do not improvise an unstable setup."
  ],
  "dumbbell-pullover": [
    "Lie fully supported on a stable bench and hold one weight securely above the chest.",
    "Lower the arms through a comfortable arc and return.",
    "Keep ribs controlled and do not chase depth beyond your shoulder control."
  ],
  "straight-arm-pulldown": [
    "Face a high pulley with a soft elbow bend and stable stance.",
    "Bring the handle toward the thighs while keeping the elbow angle steady.",
    "Do not turn the movement into a pressdown or arch the lower back."
  ],
  "incline-pushup": [
    "Place hands on a stable elevated surface and step back into a straight body line.",
    "Lower the chest toward the support and press away.",
    "Ensure the support cannot slide and keep the body moving as one unit."
  ],
  "pushup": [
    "Place hands on the floor and establish a straight body line.",
    "Lower and press the body as one unit.",
    "Use an easier version if the hips sag or full controlled reps are not possible."
  ],
  "dumbbell-floor-press": [
    "Lie on the floor with knees bent and weights securely above the elbows.",
    "Press up and lower until upper arms gently meet the floor.",
    "Avoid bouncing the arms or dropping the weights after the set."
  ],
  "dumbbell-bench-press": [
    "Sit and position the weights safely on a stable flat bench, then lie back with feet planted.",
    "Lower smoothly and press above the chest.",
    "Use a manageable load for getting into and out of position; avoid uncontrolled depth."
  ],
  "barbell-bench-press": [
    "Set bench and safety equipment and take a stable grip with feet planted.",
    "Lower the bar under control and press upward.",
    "Do not approach failure without a safe assistance arrangement; learn reracking first."
  ],
  "cable-chest-fly": [
    "Set two pulleys around chest height and stand balanced with a soft elbow bend.",
    "Bring the hands together in a controlled arc.",
    "Avoid reaching so far back that the shoulders roll forward or lose control."
  ],
  "pec-deck": [
    "Adjust the seat and starting position so the arms open comfortably.",
    "Bring the pads or handles together and return slowly.",
    "Keep the upper back supported without forcing an excessive stretch."
  ],
  "machine-chest-press": [
    "Set the seat so the handles begin near mid-chest in a comfortable position.",
    "Press forward and return with control.",
    "Keep the torso supported and avoid rolling the shoulders forward at the finish."
  ],
  "band-chest-press": [
    "Secure the band behind you at chest height and take a balanced split stance.",
    "Press the hands forward and return slowly.",
    "Check the anchor and keep the ribs from flaring as the arms extend."
  ],
  "dumbbell-squeeze-press": [
    "Lie on the floor holding a matched pair together above the chest.",
    "Keep light inward pressure while pressing and lowering.",
    "Keep the grip secure; do not choose this if the weight shapes make contact unstable."
  ],
  "seated-shoulder-press": [
    "Sit securely with feet planted and weights near shoulder height.",
    "Press through a comfortable overhead range and lower.",
    "Keep ribs controlled and choose a setup that does not require leaning back."
  ],
  "machine-shoulder-press": [
    "Adjust the seat so handles start comfortably near shoulder height.",
    "Press upward and return under control.",
    "Keep the torso supported and do not force a painful starting position."
  ],
  "cable-lateral-raise": [
    "Hold a low-pulley handle in one hand and stand steadily with cable clearance.",
    "Raise the arm out to the side and lower slowly.",
    "Avoid swinging the torso or pulling the shoulder toward the ear."
  ],
  "lateral-raise": [
    "Stand with light weights at your sides and soft elbows.",
    "Raise the arms out to the sides through a controlled range.",
    "Use a load that avoids swinging and shrugging; heavier is not required."
  ],
  "band-lateral-raise": [
    "Stand securely on a long band and hold both ends with soft elbows.",
    "Raise the arms sideways and lower with control.",
    "Keep the band secure under the feet and avoid shrugging."
  ],
  "rear-delt-fly": [
    "Hinge forward with soft knees and let light weights hang beneath the shoulders.",
    "Open the arms outward and lower slowly.",
    "Keep the hinge steady; choose another variant if the lower back limits control."
  ],
  "face-pull": [
    "Set a rope near upper-chest or face height and take a stable stance.",
    "Pull toward the face while separating the hands comfortably.",
    "Do not lean back or force the shoulders into a range you cannot control."
  ],
  "band-pull-apart": [
    "Hold a band in front at a comfortable chest height.",
    "Spread the hands while keeping the torso still, then return.",
    "Keep the shoulders relaxed and do not pull farther by arching the back."
  ],
  "wall-slide": [
    "Stand against a clear wall with the arms in a comfortable starting position.",
    "Slide the arms upward only as far as you control.",
    "Avoid forcing the hands flat or flaring the ribs to reach higher."
  ],
  "landmine-press": [
    "Secure the bar in a proper landmine and take a steady half-kneeling position.",
    "Press the free end forward and upward with one arm.",
    "Keep the torso square; do not improvise an unsecured corner anchor."
  ],
  "dumbbell-curl": [
    "Stand with weights at your sides and elbows near the ribs.",
    "Curl both weights and lower under control.",
    "Keep the torso still and avoid driving the elbows forward to lift more."
  ],
  "hammer-curl": [
    "Stand holding weights with palms facing inward.",
    "Curl while keeping that grip, then lower slowly.",
    "Keep the wrists steady and avoid swinging the torso."
  ],
  "band-curl": [
    "Stand securely on a long band and hold the ends with elbows by the ribs.",
    "Curl the hands upward and lower under tension.",
    "Check the band cannot slip from under the feet."
  ],
  "cable-curl": [
    "Attach a suitable bar to a low pulley and stand balanced.",
    "Curl without moving the upper arms much, then lower.",
    "Keep shoulders and torso from swinging forward and back."
  ],
  "concentration-curl": [
    "Sit on a stable seat and brace the upper arm against the inner thigh.",
    "Curl the weight and lower slowly.",
    "Keep the shoulder still and avoid pushing with the thigh to finish the rep."
  ],
  "triceps-kickback": [
    "Hinge in a steady split stance and hold the working upper arm alongside the torso.",
    "Straighten the elbow and return slowly.",
    "Keep the upper arm still and avoid swinging the shoulder."
  ],
  "overhead-triceps-extension": [
    "Stand steadily and hold one weight securely above the head with both hands.",
    "Bend and straighten the elbows through a comfortable range.",
    "Keep ribs controlled and use a weight you can safely position and remove."
  ],
  "band-pressdown": [
    "Secure a suitable band overhead and place elbows beside the ribs.",
    "Straighten the elbows downward and return slowly.",
    "Check the band and anchor; keep the upper arms from swinging."
  ],
  "cable-pressdown": [
    "Use a suitable high-pulley handle with elbows near your sides.",
    "Press downward by straightening the elbows and return under control.",
    "Avoid leaning body weight onto the handle or moving the shoulders to finish."
  ],
  "overhead-cable-triceps-extension": [
    "Face away from a low pulley with the rope held above the shoulders in a steady stance.",
    "Extend the elbows overhead, then return slowly.",
    "Keep the upper arms steady and avoid arching to overcome the load."
  ],
  "close-grip-pushup": [
    "Place hands somewhat closer together on a stable elevated surface.",
    "Lower the chest and press away while keeping the body aligned.",
    "Use a comfortable wrist and elbow position rather than forcing an extreme narrow grip."
  ],
  "dead-bug": [
    "Lie on your back with hips and knees bent and arms raised.",
    "Slowly extend opposite arm and leg, return, and switch sides.",
    "Shorten the reach if the lower back lifts or breathing becomes strained."
  ],
  "heel-taps": [
    "Lie on your back with knees bent above the hips.",
    "Lower one heel gently to the floor, return, and alternate.",
    "Keep the trunk steady and stop the lowering before the back arches."
  ],
  "reverse-crunch": [
    "Lie on your back with knees bent and arms resting by the sides.",
    "Gently curl the pelvis upward and lower slowly.",
    "Move the pelvis rather than swinging the legs for momentum."
  ],
  "bird-dog": [
    "Start on hands and knees in a comfortable stable position.",
    "Reach one arm and the opposite leg long, return, and switch.",
    "Keep the pelvis level and avoid lifting the limbs by arching the back."
  ],
  "forearm-plank": [
    "Place forearms on the floor and choose a foot or knee-supported version.",
    "Hold a steady body line while breathing.",
    "End the hold before the lower back sags or the shoulders lose support."
  ],
  "side-plank": [
    "Lie on one side with forearm under the shoulder and choose knees or feet for support.",
    "Lift the hips and hold, then change sides.",
    "Keep the shoulder supported and lower before the hips twist or sag."
  ],
  "pallof-press": [
    "Stand side-on to a chest-height pulley and hold the handle at the chest.",
    "Press the hands forward, resist rotation, then return.",
    "Keep hips and ribs facing ahead; repeat with the other side toward the pulley."
  ],
  "band-pallof-press": [
    "Secure a band at chest height and stand side-on holding it near the chest.",
    "Press forward without turning and return slowly.",
    "Check the anchor and repeat with the other side facing it."
  ],
  "hollow-hold": [
    "Lie on your back with knees bent and choose a short controllable arm and leg position.",
    "Lift into a small braced hold and breathe.",
    "Shorten the lever or stop when the lower back lifts."
  ],
  "brisk-walk": [
    "Choose a suitable clear walking route and start at an easy pace.",
    "Build to a pace that increases breathing while conversation remains possible.",
    "Adjust for footing, conditions and symptoms; do not chase a rigid pace."
  ],
  "low-impact-circuit": [
    "Clear room for marching and side steps; keep reaches below overhead if restricted.",
    "Alternate marching, side steps and controlled arm reaches using a stated timer.",
    "Stay low impact and reduce pace before movement control deteriorates."
  ],
  "shadow-boxing": [
    "Stand balanced with clear arm space and begin with easy punches.",
    "Alternate controlled punch combinations with easy movement during stated recovery.",
    "Do not snap elbows into lockout or twist faster than you can control."
  ],
  "incline-walk": [
    "Learn the treadmill controls and start at a low speed and incline.",
    "Walk at a controlled pace and adjust gradually.",
    "Keep the safety stop accessible and reduce settings if you must hang on the rails."
  ],
  "bike-intervals": [
    "Adjust the saddle and handles for a comfortable position and begin easily.",
    "Alternate controlled harder pedaling with easy recovery on a stated timer.",
    "Keep pedaling smooth and avoid resistance that makes the hips rock."
  ],
  "rower-intervals": [
    "Set the foot straps and learn an easy rowing stroke before intervals.",
    "Drive legs, then torso, then arms; return arms, torso, then legs.",
    "Avoid rounding or rushing the recovery; use a different mode if technique is unfamiliar."
  ],
  "elliptical-intervals": [
    "Step on carefully, hold the handles and start at an easy setting.",
    "Alternate controlled effort with easy movement using stated intervals.",
    "Stay upright and lower resistance before losing smooth movement."
  ],
  "jump-rope": [
    "Use a suitable rope and clear the full arc on a stable surface.",
    "Make low controlled jumps during short work bouts and recover between them.",
    "Stop before landings become heavy; do not use for no-jumping or quiet sessions."
  ],
  "hip-9090": [
    "Sit on the floor with bent knees and hands available for support.",
    "Move the knees gently from one side to the other.",
    "Do not force the knees toward the floor or twist through discomfort."
  ],
  "thoracic-rotation": [
    "Lie on one side with knees bent and stacked, head comfortable.",
    "Open the upper arm and rotate the upper trunk, then return.",
    "Keep the knees together and do not force the hand to reach the floor."
  ],
  "cat-cow": [
    "Start on hands and knees in a comfortable position.",
    "Gently alternate a rounded and extended spine with the breath.",
    "Avoid pushing into either end range or treating pain as a stretch target."
  ],
  "hamstring-sweep": [
    "Step one heel slightly forward with a soft supporting knee.",
    "Hinge gently and sweep the hands downward, then change sides.",
    "Do not bounce or round farther to reach the toes."
  ],
  "ankle-rock": [
    "Stand in a short split stance with the front heel planted.",
    "Guide the front knee forward gently and return; change sides.",
    "Keep the heel down and knee moving comfortably over the foot."
  ],
  "hip-flexor-stretch": [
    "Take a cushioned half-kneeling position and gently tuck the pelvis.",
    "Shift slightly forward until a mild front-hip stretch is felt.",
    "Avoid arching the lower back or pressing through knee discomfort."
  ],
  "child-pose-reach": [
    "Kneel on a comfortable surface and sit back only as far as tolerated.",
    "Reach hands gently to one side and breathe, then change sides.",
    "Do not force the hips to the heels or pull through shoulder discomfort."
  ],
  "standing-side-bend": [
    "Stand tall with arms relaxed; raise an arm only if that variant is allowed.",
    "Bend gently to one side and return, then switch.",
    "Avoid twisting or collapsing forward to make the bend larger."
  ]
  ,
  "standing-dumbbell-row": ["Stand with a soft knee bend and hinge until your torso is steady.", "Row both dumbbells toward your hips without jerking the torso.", "Keep the back neutral and stop the set if you cannot hold the hinge."],
  "standing-dumbbell-press": ["Stand tall with the dumbbells at shoulder height and brace your trunk.", "Press overhead through a comfortable path, then lower with control.", "Keep the ribs stacked and avoid turning the press into a backbend."],
  "wall-pushup": ["Place your hands on a clear wall and step back until your body forms a straight line.", "Lower your chest toward the wall, then press away.", "Keep the hips and ribs moving together instead of sagging or folding."],
  "standing-hip-flexor-mobility": ["Take a comfortable split stance and keep both feet planted.", "Tuck the pelvis gently and shift forward until you feel the front of the rear hip.", "Keep the movement small and avoid arching the lower back."]
};

function showTip(index) {
  const item = state.workout.exercises[index];
  const cues = howToOverrides[item.id] || cueSteps(item.cue);
  showModal(
    item.name,
    '',
    `<ol class="cue-list">${cues.map(cue => `<li>${escapeHtml(cue)}</li>`).join('')}</ol>
     ${item.video ? `<button class="secondary-button field-gap-small" onclick="openExerciseVideo('${escapeJs(item.video)}')">Watch demo</button>` : ''}
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

function openExerciseVideo(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
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
          <p class="workout-meta">${escapeHtml(prescriptionText(item))}</p>
        </div>
      </div>
      ${item.previousPerformance ? `<div class="previous-line">Last time: ${escapeHtml(item.previousPerformance)}</div>` : ''}
      ${item.recommendedWeight ? `<div class="suggestion-line">Suggested today: ${escapeHtml(formatNumber(Number(item.recommendedWeight)))} lb</div>` : ''}
      <div class="exercise-actions active-card-actions">
        <button class="pill-button" onclick="showTip(${state.activeIndex})">How to</button>
        <button class="pill-button" ${findSwap(state.activeIndex) ? '' : 'disabled'} onclick="swapActive()">Swap</button>
      </div>
      <div class="set-label-row">
        <span>Set</span><span>${loadColumnLabel(item)}</span><span>${repColumnLabel(item)}</span><span>Done</span>
      </div>
      <div>${item.setData.map((set, index) => setRow(index, set, item)).join('')}</div>
    </section>
    <div class="active-actions">
      <button class="${completedCount ? 'primary-button' : 'ghost-button'}" onclick="advanceExercise()">${advanceLabel}</button>
      <button class="text-button centered" onclick="finishEarly()">Finish early</button>
    </div>`;

  startUiTimer();
  updateTimers();
}

function loadColumnLabel(item) {
  if (item.tracking === 'weight') return 'Weight';
  if (item.tracking === 'band') return 'Band';
  if (item.kind === 'cardio') return 'Effort';
  return 'Load';
}

function repColumnLabel(item) {
  return item.kind === 'time' || item.kind === 'cardio' || (item.kind === 'mobility' && String(item.reps).includes('sec')) ? 'Time' : 'Reps';
}

function setLoadControl(index, set, item) {
  if (item.tracking === 'bodyweight') {
    return '<div class="set-static" aria-label="Bodyweight">BW</div>';
  }
  if (item.tracking === 'none') {
    return '<div class="set-static" aria-label="No load needed">—</div>';
  }
  if (item.tracking === 'band') {
    return `<input
      inputmode="text"
      value="${escapeHtml(set.weight)}"
      placeholder="Band"
      aria-label="Band or resistance for set ${index + 1}"
      oninput="updateSetValue(${index}, 'weight', this.value)"
    />`;
  }
  if (item.kind === 'cardio') {
    return `<input
      inputmode="text"
      value="${escapeHtml(set.weight)}"
      placeholder="Easy–hard"
      aria-label="Effort for set ${index + 1}"
      oninput="updateSetValue(${index}, 'weight', this.value)"
    />`;
  }
  return `<input
    inputmode="decimal"
    value="${escapeHtml(set.weight)}"
    placeholder="lb"
    aria-label="Weight for set ${index + 1}"
    oninput="updateSetValue(${index}, 'weight', this.value)"
  />`;
}

function setRow(index, set, item) {
  const timeEntry = item.kind === 'time' || item.kind === 'cardio' || (item.kind === 'mobility' && String(item.reps).includes('sec'));
  return `<div class="set-row">
    <div style="font-weight:780;text-align:center">${index + 1}</div>
    ${setLoadControl(index, set, item)}
    <input
      inputmode="${timeEntry ? 'text' : 'numeric'}"
      value="${escapeHtml(set.reps)}"
      placeholder="${timeEntry ? item.reps : 'Reps'}"
      aria-label="${timeEntry ? 'Time' : 'Repetitions'} for set ${index + 1}"
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
  const hasLaterWork = item.setData.slice(setIndex + 1).some(set => !set.done);
  if (item.setData[setIndex].done && item.rest > 0 && hasLaterWork) {
    state.restUntil = Date.now() + (item.rest * 1000);
  } else {
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
  applySwapAt(state.activeIndex, replacement);
  state.session.startedAt = Date.now();
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

function completedSetCount() {
  if (!state.workout) return 0;
  return state.workout.exercises.reduce((sum, item) => sum + item.setData.filter(set => set.done).length, 0)
    + (state.workout.completedSegments || []).reduce((sum, item) => sum + (item.sets || []).filter(set => set.done).length, 0);
}

function finishEarly() {
  pauseSessionClock();
  stopUiTimer();
  const completedSets = completedSetCount();
  if (!completedSets) {
    showModal(
      'End this workout?',
      'No completed sets will be added to History.',
      `<div class="modal-actions">
        <button class="danger-button" onclick="closeCurrentModal(); discardWorkoutWithoutHistory()">Discard workout</button>
        <button class="ghost-button" onclick="closeCurrentModal(); resumeWorkout()">Keep working</button>
      </div>`
    );
    return;
  }

  if (state.workout.source === 'plan') {
    showModal(
      'Finish early?',
      'Your completed work will be saved. Choose what Form should do with this plan step.',
      `<div class="modal-actions">
        <button class="primary-button" onclick="closeCurrentModal(); finishWorkout(false)">Save · keep this step</button>
        <button class="secondary-button" onclick="closeCurrentModal(); finishWorkout(true)">Save · move to next</button>
        <button class="ghost-button" onclick="closeCurrentModal(); resumeWorkout()">Keep working</button>
      </div>`
    );
  } else {
    showModal(
      'Finish early?',
      'Your completed work will be saved as a partial workout.',
      `<div class="modal-actions">
        <button class="primary-button" onclick="closeCurrentModal(); finishWorkout(false)">Save partial workout</button>
        <button class="ghost-button" onclick="closeCurrentModal(); resumeWorkout()">Keep working</button>
      </div>`
    );
  }
}

function discardWorkoutWithoutHistory() {
  state.workout = null;
  state.answers = null;
  state.session = { active: false, startedAt: null, elapsedMs: 0 };
  state.activeIndex = 0;
  state.restUntil = null;
  safeRemove(STORAGE.current);
  renderHome();
}

function finishWorkout(forcePlanAdvance = null) {
  pauseSessionClock();
  stopUiTimer();
  if (!state.workout) return;

  const completedSets = completedSetCount();
  if (!completedSets) {
    discardWorkoutWithoutHistory();
    return;
  }

  const currentCompletedExercises = state.workout.exercises.filter(item => item.setData.some(set => set.done)).length;
  const archivedCompletedExercises = (state.workout.completedSegments || []).filter(item => (item.sets || []).some(set => set.done)).length;
  const completedExercises = currentCompletedExercises + archivedCompletedExercises;
  const prescribedSets = state.workout.exercises.reduce((sum, item) => sum + item.sets, 0)
    + (state.workout.completedSegments || []).reduce((sum, item) => sum + Number(item.prescription?.sets || 0), 0);
  const automaticAdvance = completedExercises >= Math.max(1, Math.ceil(state.workout.exercises.length / 2))
    && completedSets >= Math.max(1, Math.ceil(prescribedSets / 2));
  const qualifiesForPlanAdvance = forcePlanAdvance === null ? automaticAdvance : Boolean(forcePlanAdvance);
  const planIdentityMatches = state.workout.source === 'plan'
    && state.workout.planName === state.profile.splitName
    && Number(state.workout.planIndex) === Number(state.profile.splitIndex);
  const shouldAdvance = Boolean(qualifiesForPlanAdvance && planIdentityMatches);
  const recordId = `history-${state.workout.id}`;

  const currentDetails = state.workout.exercises.map((item, index) => ({
    id: item.id,
    name: item.name,
    family: item.family,
    pattern: item.pattern,
    muscle: item.muscle,
    kind: item.kind,
    tracking: item.tracking,
    unilateral: Boolean(item.unilateral),
    sideBasis: item.sideBasis || '',
    loadBasis: item.loadBasis || '',
    order: index,
    prescription: { sets: item.sets, reps: item.reps, rest: item.rest },
    skipped: state.workout.skipped.includes(item.id),
    sets: item.setData.map(set => ({ ...set }))
  }));

  const allDetails = [...(state.workout.completedSegments || []).map(item => ({ ...clone(item), skipped: false })), ...currentDetails]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  const record = {
    id: recordId,
    date: new Date().toISOString(),
    title: state.workout.title,
    minutes: Math.max(1, Math.round(state.session.elapsedMs / 60000)),
    exercises: allDetails.length,
    completedSets,
    completedExercises,
    prescribedSets,
    partial: forcePlanAdvance === false || !automaticAdvance,
    planAdvanced: state.workout.source === 'plan' ? shouldAdvance : null,
    focuses: [...state.workout.focuses],
    source: state.workout.source,
    planName: state.workout.planName || null,
    constraints: [...(state.workout.constraints || [])],
    feedback: 'Not rated',
    swaps: clone(state.workout.swaps || []),
    skipped: [...(state.workout.skipped || [])],
    details: allDetails
  };

  const newHistory = [record, ...state.history.filter(item => item.id !== recordId)];
  if (!safeSave(STORAGE.history, newHistory)) {
    showStorageFailure('Form could not save this workout. Your current workout is still open so nothing is lost.');
    resumeWorkout();
    return;
  }

  if (shouldAdvance) {
    const updatedProfile = clone(state.profile);
    updatedProfile.splitIndex = (updatedProfile.splitIndex + 1) % updatedProfile.splitSequence.length;
    updatedProfile.updatedAt = new Date().toISOString();
    if (!safeSave(STORAGE.profile, updatedProfile)) {
      showStorageFailure('Your workout was saved, but Form could not safely advance the training plan. Try again before closing the app.');
      resumeWorkout();
      return;
    }
    state.profile = updatedProfile;
  }

  state.history = newHistory;
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
      ${record.source === 'plan' && record.planAdvanced === false ? '<p class="inline-note">Saved as a partial workout. Your training plan will keep this session next so you can continue the sequence.</p>' : ''}
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
  if (!state.workout) return safeRemove(STORAGE.current);
  return safeSave(STORAGE.current, {
    answers: state.answers,
    workout: state.workout,
    activeIndex: state.activeIndex,
    restUntil: state.restUntil,
    session: {
      active: state.session.active,
      elapsedMs: getElapsedMs()
    }
  });
}

function showStorageFailure(message) {
  storageIssue = true;
  showModal('Could not save', message || 'Form could not save to this device. Keep the app open and export a backup if possible.');
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
  const sourceExercise = exerciseLibrary.find(item => item.id === detail.id || (!detail.id && item.name === detail.name));
  const tracking = detail.tracking || sourceExercise?.tracking || 'weight';
  const kind = detail.kind || sourceExercise?.kind || 'strength';
  return `<article class="exercise-card">
    <div class="exercise-main">
      <div class="exercise-number">${String(index + 1).padStart(2, '0')} · ${escapeHtml(detail.muscle || detail.pattern || '')}</div>
      <div class="exercise-name">${escapeHtml(detail.name)}</div>
      ${detail.skipped ? '<div class="skip-label">Skipped</div>' : ''}
      ${completed.length
        ? `<div class="set-summary-list">${completed.map((set, setIndex) => {
            const pieces = [];
            if (set.weight) {
              if (tracking === 'weight') pieces.push(`${escapeHtml(set.weight)} lb`);
              else if (tracking === 'band') pieces.push(`${escapeHtml(set.weight)} band`);
              else if (kind === 'cardio') pieces.push(`${escapeHtml(set.weight)} effort`);
            } else if (tracking === 'bodyweight') {
              pieces.push('Bodyweight');
            }
            if (set.reps) pieces.push(escapeHtml(set.reps) + (kind === 'strength' ? ' reps' : ''));
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
      ${menuItem('Data & Backup', 'Export or restore your Form data', 'showDataBackup()')}
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
    <div class="option-grid settings-block">
      ${optionButton('Let Form choose for me', draft.splitMode === 'form', "setPlanMode('form')", false, `Recommended: ${recommendation}`)}
    </div>
    <div class="focus-section settings-block">
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

function renderDetailOptions(choices, draft) {
  return choices.map(([value, label]) => optionButton(
    label,
    Boolean(draft.equipmentDetails?.[value]),
    `toggleSettingsEquipmentDetail('${value}')`,
    true
  )).join('');
}

function renderEquipmentSettings() {
  const draft = state.settingsDraft;
  draft.equipmentDetails = normalizeEquipmentDetails(draft.equipmentDetails, draft.setup, draft.equipment);
  app.innerHTML = `
    ${settingsHeader('Equipment')}
    <section class="hero">
      <h2 class="question-title">Available equipment</h2>
      <p class="question-copy">Tell Form what is actually available. Supports and machines are checked separately so a dumbbell does not imply a bench.</p>
    </section>
    <div class="option-grid settings-block">
      ${Object.entries(setupPresets).filter(([key]) => key !== 'custom').map(([key, preset]) =>
        optionButton(preset.label, draft.setup === key, `setSettingsSetup('${key}')`)
      ).join('')}
    </div>
    <section class="card">
      <div class="field-label">Main equipment</div>
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
    <section class="card">
      <div class="field-label">Setup details</div>
      <p class="helper" style="margin-top:0">Only choose things you can actually use for a workout.</p>
      <div class="option-grid two-column">${renderDetailOptions(setupDetailChoices, draft)}</div>
      ${draft.equipment.includes('barbell') ? `<div class="field-label field-gap">Barbell setup</div><div class="option-grid two-column">${renderDetailOptions(strengthSetupChoices, draft)}</div>` : ''}
      ${draft.equipment.includes('bands') ? `<div class="field-label field-gap">Band anchors</div><div class="option-grid two-column">${renderDetailOptions(bandSetupChoices, draft)}</div>` : ''}
      ${draft.equipment.includes('cable') ? `<div class="field-label field-gap">Cable setup</div><div class="option-grid two-column">${renderDetailOptions(cableSetupChoices, draft)}</div>` : ''}
      ${draft.equipment.includes('cardio') ? `<div class="field-label field-gap">Cardio machines</div><div class="option-grid two-column">${renderDetailOptions(cardioSetupChoices, draft)}</div>` : ''}
      ${draft.equipment.includes('machine') ? `<div class="field-label field-gap">Machines</div><div class="option-grid two-column">${renderDetailOptions(machineSetupChoices, draft)}</div>` : ''}
    </section>
    ${settingsSaveBar("saveSettings('equipment')")}`;
}

function setSettingsSetup(value) {
  state.settingsDraft.setup = value;
  state.settingsDraft.equipment = [...setupPresets[value].equipment];
  state.settingsDraft.equipmentDetails = defaultEquipmentDetails(value, state.settingsDraft.equipment);
  renderEquipmentSettings();
}

function toggleSettingsEquipment(value) {
  const equipment = [...state.settingsDraft.equipment];
  state.settingsDraft.equipment = equipment.includes(value)
    ? equipment.filter(item => item !== value)
    : [...equipment, value];
  state.settingsDraft.equipment = [...new Set(['bodyweight', ...state.settingsDraft.equipment])];
  state.settingsDraft.setup = findMatchingSetup(state.settingsDraft.equipment) || 'custom';
  state.settingsDraft.equipmentDetails = normalizeEquipmentDetails(state.settingsDraft.equipmentDetails, state.settingsDraft.setup, state.settingsDraft.equipment);
  renderEquipmentSettings();
}

function toggleSettingsEquipmentDetail(value) {
  state.settingsDraft.equipmentDetails = normalizeEquipmentDetails(state.settingsDraft.equipmentDetails, state.settingsDraft.setup, state.settingsDraft.equipment);
  state.settingsDraft.equipmentDetails[value] = !state.settingsDraft.equipmentDetails[value];
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
  return `<div class="builder-actions settings-save-bar">
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

function showDataBackup() {
  stopUiTimer();
  state.view = 'data-backup';
  app.innerHTML = `
    ${settingsHeader('Data & Backup')}
    <section class="hero">
      <h2 class="question-title">Keep your data recoverable</h2>
      <p class="question-copy">Form stores your profile and workout history on this device. Export a backup before clearing browser data or moving phones.</p>
    </section>
    <section class="card">
      <button class="primary-button" onclick="exportFormBackup()">Export backup</button>
      <button class="secondary-button field-gap-small" onclick="document.getElementById('backupFile').click()">Import backup</button>
      <input id="backupFile" type="file" accept="application/json,.json" class="visually-hidden" onchange="importFormBackup(this.files?.[0])" />
      <p class="helper">Import replaces the current Form data only after the file is checked. Form keeps a temporary pre-import backup on this device.</p>
    </section>
    <section class="card">
      <div class="field-label">Stored here</div>
      <p class="helper">${state.history.length} workout${state.history.length === 1 ? '' : 's'} · profile · training plan · preferences${state.workout ? ' · current workout' : ''}</p>
    </section>`;
}

function formBackupEnvelope() {
  return {
    product: 'Form',
    backupSchema: 1,
    appVersion: VERSION,
    exportedAt: new Date().toISOString(),
    profile: clone(state.profile),
    history: clone(state.history),
    behavior: clone(state.behavior),
    current: state.workout ? {
      answers: clone(state.answers),
      workout: clone(state.workout),
      activeIndex: state.activeIndex,
      restUntil: state.restUntil,
      session: { active: state.session.active, elapsedMs: getElapsedMs() }
    } : null
  };
}

async function exportFormBackup() {
  const data = JSON.stringify(formBackupEnvelope(), null, 2);
  const fileName = `form-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([data], { type: 'application/json' });
  const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'application/json' }) : null;

  try {
    if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Form backup' });
      return;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function validateBackupEnvelope(data) {
  if (!data || typeof data !== 'object') return 'This file is not a Form backup.';
  if (data.product !== 'Form' || data.backupSchema !== 1) return 'This backup format is not supported.';
  if (!data.profile || typeof data.profile !== 'object') return 'The backup is missing a profile.';
  if (!Array.isArray(data.history)) return 'The backup history is invalid.';
  if (data.history.some(item => !validHistoryRecord(item))) return 'The backup contains an invalid workout record.';
  if (data.current && (typeof data.current !== 'object' || !data.current.workout)) return 'The current-workout data is invalid.';
  return '';
}

async function importFormBackup(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showModal('Backup too large', 'Choose a Form backup smaller than 5 MB.');
    return;
  }

  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    showModal('Could not read backup', 'That file is not valid JSON. Your current Form data was not changed.');
    return;
  }

  const error = validateBackupEnvelope(data);
  if (error) {
    showModal('Could not import backup', `${error} Your current Form data was not changed.`);
    return;
  }

  const currentEnvelope = formBackupEnvelope();
  if (!safeSave(STORAGE.preImport, currentEnvelope)) {
    showStorageFailure('Form could not create a safety copy, so the import was cancelled.');
    return;
  }

  const importedProfile = normalizeProfile(data.profile);
  const importedHistory = data.history.filter(validHistoryRecord);
  const importedBehavior = normalizeBehavior(data.behavior);
  const writes = [
    safeSave(STORAGE.profile, importedProfile),
    safeSave(STORAGE.history, importedHistory),
    safeSave(STORAGE.behavior, importedBehavior)
  ];
  if (data.current) writes.push(safeSave(STORAGE.current, data.current));
  else writes.push(safeRemove(STORAGE.current));

  if (writes.some(result => !result)) {
    showStorageFailure('The import could not be completed safely. Your pre-import backup is still stored on this device.');
    return;
  }

  state.profile = importedProfile;
  state.history = importedHistory;
  state.behavior = importedBehavior;
  state.workout = data.current?.workout || null;
  state.answers = data.current?.answers || null;
  state.activeIndex = data.current?.activeIndex || 0;
  state.restUntil = data.current?.restUntil || null;
  state.session = { active: Boolean(data.current?.session?.active), startedAt: null, elapsedMs: data.current?.session?.elapsedMs || 0 };
  showModal('Backup restored', 'Your Form data has been restored on this device.', `<div class="modal-actions"><button class="primary-button" onclick="closeCurrentModal(); renderHome()">Done</button></div>`);
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

let modalReturnFocus = null;

function showModal(title, text, customContent = '') {
  closeCurrentModal(false);
  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  app.setAttribute('aria-hidden', 'true');
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" id="modal" onclick="closeModalFromBackdrop(event)">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
        <h3 id="modalTitle">${escapeHtml(title)}</h3>
        ${text ? `<p>${escapeHtml(text)}</p>` : ''}
        ${customContent || '<div class="modal-actions"><button class="primary-button" onclick="closeCurrentModal()">Got it</button></div>'}
      </div>
    </div>`);
  const dialog = document.querySelector('#modal .modal');
  dialog?.focus();
  document.addEventListener('keydown', handleModalKeydown);
}

function handleModalKeydown(event) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeCurrentModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...modal.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.disabled && element.offsetParent !== null);
  if (!focusable.length) {
    event.preventDefault();
    modal.querySelector('.modal')?.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function closeModalFromBackdrop(event) {
  if (event.target.id === 'modal') closeCurrentModal();
}

function closeCurrentModal(restoreFocus = true) {
  const modal = document.getElementById('modal');
  if (modal) modal.remove();
  document.removeEventListener('keydown', handleModalKeydown);
  app.removeAttribute('aria-hidden');
  if (restoreFocus && modalReturnFocus?.isConnected) modalReturnFocus.focus();
  modalReturnFocus = null;
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

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistCurrent();
});

let reloadingForUpdate = false;
async function registerServiceWorker() {
  if (location.protocol !== 'https:' || !('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    const offerUpdate = worker => {
      if (!worker || state.session.active || document.getElementById('modal')) return;
      showModal(
        'Update ready',
        'A newer version of Form is ready. Your current data will stay on this device.',
        `<div class="modal-actions">
          <button class="primary-button" onclick="applyWaitingUpdate()">Update Form</button>
          <button class="ghost-button" onclick="closeCurrentModal()">Later</button>
        </div>`
      );
    };
    window.formServiceWorkerRegistration = registration;
    if (registration.waiting) offerUpdate(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker);
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      location.reload();
    });
  } catch {}
}

function applyWaitingUpdate() {
  persistCurrent();
  const registration = window.formServiceWorkerRegistration;
  if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  closeCurrentModal(false);
}

registerServiceWorker();
renderInitial();
