const app = document.getElementById('app');

const state = {
  view: 'home',
  step: 0,
  answers: {
    focus: 'Legs + glutes',
    goal: 'Build muscle',
    time: 45,
    place: 'Home gym',
    energy: 'Good',
    limitations: 'None'
  },
  workout: null,
  activeIndex: 0,
  startedAt: null,
  timerId: null,
  history: (() => { try { return JSON.parse(localStorage.getItem('form-history') || '[]'); } catch { return []; } })()
};

const exerciseLibrary = {
  'Legs + glutes': [
    { name: 'Barbell hip thrust', muscle: 'Glutes', home: true, gym: true, kneeFriendly: true, swap: 'Dumbbell glute bridge' },
    { name: 'Romanian deadlift', muscle: 'Hamstrings', home: true, gym: true, kneeFriendly: true, swap: 'Dumbbell RDL' },
    { name: 'Bulgarian split squat', muscle: 'Glutes + quads', home: true, gym: true, kneeFriendly: false, swap: 'Reverse lunge' },
    { name: 'Goblet squat', muscle: 'Quads + glutes', home: true, gym: true, kneeFriendly: false, swap: 'Box squat' },
    { name: 'Cable kickback', muscle: 'Glutes', home: false, gym: true, kneeFriendly: true, swap: 'Dumbbell kickback' },
    { name: 'Step-up', muscle: 'Glutes + quads', home: true, gym: true, kneeFriendly: false, swap: 'Single-leg glute bridge' },
    { name: 'Banded abduction', muscle: 'Glute medius', home: true, gym: true, kneeFriendly: true, swap: 'Side-lying leg raise' }
  ],
  'Upper body': [
    { name: 'Dumbbell bench press', muscle: 'Chest + triceps', home: true, gym: true, swap: 'Push-up' },
    { name: 'One-arm dumbbell row', muscle: 'Back', home: true, gym: true, swap: 'Chest-supported row' },
    { name: 'Seated shoulder press', muscle: 'Shoulders', home: true, gym: true, swap: 'Arnold press' },
    { name: 'Lat pulldown', muscle: 'Back', home: false, gym: true, swap: 'Band pulldown' },
    { name: 'Lateral raise', muscle: 'Shoulders', home: true, gym: true, swap: 'Lean-away raise' },
    { name: 'Hammer curl', muscle: 'Biceps', home: true, gym: true, swap: 'Alternating curl' },
    { name: 'Triceps extension', muscle: 'Triceps', home: true, gym: true, swap: 'Close-grip push-up' }
  ],
  'Core': [
    { name: 'Dead bug', muscle: 'Deep core', home: true, gym: true, swap: 'Heel taps' },
    { name: 'Plank', muscle: 'Core', home: true, gym: true, swap: 'Incline plank' },
    { name: 'Reverse crunch', muscle: 'Lower abs', home: true, gym: true, swap: 'Knee tuck' },
    { name: 'Pallof press', muscle: 'Obliques', home: false, gym: true, swap: 'Band Pallof press' },
    { name: 'Side plank', muscle: 'Obliques', home: true, gym: true, swap: 'Knee side plank' },
    { name: 'Bird dog', muscle: 'Core + stability', home: true, gym: true, swap: 'Quadruped hold' }
  ],
  'Full body': [
    { name: 'Goblet squat', muscle: 'Lower body', home: true, gym: true, swap: 'Box squat' },
    { name: 'Dumbbell bench press', muscle: 'Chest', home: true, gym: true, swap: 'Push-up' },
    { name: 'Romanian deadlift', muscle: 'Posterior chain', home: true, gym: true, swap: 'Dumbbell RDL' },
    { name: 'One-arm dumbbell row', muscle: 'Back', home: true, gym: true, swap: 'Band row' },
    { name: 'Walking lunge', muscle: 'Legs + glutes', home: true, gym: true, swap: 'Reverse lunge' },
    { name: 'Shoulder press', muscle: 'Shoulders', home: true, gym: true, swap: 'Arnold press' },
    { name: 'Dead bug', muscle: 'Core', home: true, gym: true, swap: 'Heel taps' }
  ],
  'Cardio': [
    { name: 'Incline walk', muscle: 'Conditioning', home: true, gym: true, swap: 'Brisk outdoor walk' },
    { name: 'Bike intervals', muscle: 'Conditioning', home: false, gym: true, swap: 'Marching intervals' },
    { name: 'Low-impact circuit', muscle: 'Full body', home: true, gym: true, swap: 'Steady walk' },
    { name: 'Rowing intervals', muscle: 'Conditioning', home: false, gym: true, swap: 'Shadow boxing' }
  ]
};

function saveHistory() {
  try { localStorage.setItem('form-history', JSON.stringify(state.history)); } catch {}
}

function nav(active = state.view) {
  return `<nav class="nav">
    <button class="${active === 'home' ? 'active' : ''}" onclick="goHome()">Home</button>
    <button class="${active === 'workout' || active === 'active' ? 'active' : ''}" onclick="openLatest()">Workout</button>
    <button class="${active === 'history' ? 'active' : ''}" onclick="showHistory()">History</button>
  </nav>`;
}

function renderHome() {
  state.view = 'home';
  const total = state.history.length;
  const streak = calculateStreak();
  app.innerHTML = `
    <div class="topbar"><div class="brand">FORM</div><button class="icon-button" aria-label="Settings" onclick="showAbout()">···</button></div>
    <section class="hero">
      <div class="eyebrow">Your workout, simplified</div>
      <h1>What feels good today?</h1>
      <p class="lede">Tell Form what you want to train. It handles the exercises, sets, reps, and pacing.</p>
    </section>
    <section class="card">
      <button class="primary-button" onclick="startBuilder()">Build my workout</button>
      <div class="quick-stats">
        <div class="stat"><strong>${total}</strong><span>workouts</span></div>
        <div class="stat"><strong>${streak}</strong><span>day streak</span></div>
        <div class="stat"><strong>${state.history.reduce((a,b)=>a+(b.minutes||0),0)}</strong><span>minutes</span></div>
      </div>
    </section>
    ${state.workout ? `<section class="card"><div class="eyebrow">Ready when you are</div><h2 style="margin:0 0 8px;font-size:26px;letter-spacing:-.04em">${state.workout.title}</h2><p class="question-copy">${state.workout.exercises.length} movements · ${state.answers.time} min</p><button class="secondary-button" onclick="showWorkout()">Open workout</button></section>` : ''}
    ${nav('home')}`;
}

function calculateStreak() {
  if (!state.history.length) return 0;
  const days = [...new Set(state.history.map(h => new Date(h.date).toDateString()))];
  let streak = 0;
  let d = new Date();
  for (;;) {
    if (days.includes(d.toDateString())) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

const steps = [
  { key: 'focus', title: 'What do you want to train?', copy: 'Choose the area that sounds best today.', options: ['Legs + glutes','Upper body','Core','Full body','Cardio'] },
  { key: 'goal', title: 'What is the goal?', copy: 'This changes the rep range, rest, and pace.', options: ['Slim + tone','Build muscle','Maintain','Get stronger'] },
  { key: 'time', title: 'How much time do you have?', copy: 'We will keep the workout inside this window.', range: true },
  { key: 'place', title: 'Where are you training?', copy: 'The workout will only use equipment that fits.', options: ['Home gym','Full gym','Bodyweight only'] },
  { key: 'energy', title: 'How is your energy?', copy: 'Be honest. The best workout is the one that fits today.', options: ['Low','Good','High'] },
  { key: 'limitations', title: 'Anything bothering you?', copy: 'We will make sensible substitutions.', options: ['None','Knees','Lower back','Shoulders'] }
];

function startBuilder() { state.step = 0; renderBuilder(); }
function renderBuilder() {
  const s = steps[state.step];
  state.view = 'builder';
  let body = '';
  if (s.range) {
    body = `<div class="range-wrap"><div class="range-value"><span id="timeValueBig">${state.answers.time}</span><span>min</span></div><input aria-label="Workout duration" type="range" min="15" max="75" step="5" value="${state.answers.time}" oninput="updateTime(this.value)"></div>`;
  } else {
    body = `<div class="option-grid">${s.options.map(o => `<button class="option ${state.answers[s.key]===o?'selected':''}" onclick="choose('${s.key}', '${o.replaceAll("'", "\\'")}')"><span>${o}${optionSubtext(s.key,o)}</span><span class="check">✓</span></button>`).join('')}</div>`;
  }
  app.innerHTML = `
    <div class="step-header"><button class="icon-button" onclick="builderBack()">←</button><div class="progress-track"><div class="progress-fill" style="width:${((state.step+1)/steps.length)*100}%"></div></div></div>
    <section class="hero"><h2 class="question-title">${s.title}</h2><p class="question-copy">${s.copy}</p></section>
    ${body}
    <div class="footer-actions ${state.step===0?'single':''}">${state.step>0?'<button class="ghost-button" onclick="builderBack()">Back</button>':''}<button class="primary-button" onclick="builderNext()">${state.step===steps.length-1?'Create workout':'Continue'}</button></div>`;
}

function optionSubtext(key, value) {
  const map = {
    'Slim + tone': 'Moderate reps and a steady pace',
    'Build muscle': 'Focused sets with progressive overload',
    'Maintain': 'Balanced volume and intensity',
    'Get stronger': 'Lower reps and longer rest',
    'Low': 'Gentle volume, no guilt',
    'Good': 'Balanced and productive',
    'High': 'A little more challenge'
  };
  return map[value] ? `<small>${map[value]}</small>` : '';
}

function choose(key, value) { state.answers[key] = value; renderBuilder(); }
function updateTime(value) { state.answers.time = Number(value); document.getElementById('timeValueBig').textContent = value; }
function builderBack() { if (state.step===0) renderHome(); else { state.step--; renderBuilder(); } }
function builderNext() { if (state.step < steps.length-1) { state.step++; renderBuilder(); } else generateWorkout(); }

function generateWorkout() {
  const a = state.answers;
  const source = exerciseLibrary[a.focus] || exerciseLibrary['Full body'];
  let items = source.filter(x => a.place === 'Full gym' ? x.gym : a.place === 'Bodyweight only' ? ['Dead bug','Plank','Reverse crunch','Side plank','Bird dog','Low-impact circuit'].includes(x.name) : x.home);
  if (a.limitations === 'Knees') items = items.filter(x => x.kneeFriendly !== false);
  if (!items.length) items = source.slice();

  let count = a.time <= 25 ? 4 : a.time <= 45 ? 5 : 6;
  if (a.energy === 'Low') count = Math.max(3, count-1);
  if (a.energy === 'High') count = Math.min(items.length, count+1);
  items = items.slice(0, count);

  const prescription = getPrescription(a.goal, a.energy);
  state.workout = {
    title: a.focus === 'Legs + glutes' ? 'Lower body focus' : a.focus,
    note: `${a.goal} · ${a.place}`,
    warmup: a.energy === 'Low' ? 4 : 6,
    exercises: items.map((x, i) => ({ ...x, sets: prescription.sets + (i===0 && a.goal==='Build muscle' ? 1 : 0), reps: prescription.reps, rest: prescription.rest, completed: [] }))
  };
  showWorkout();
}

function getPrescription(goal, energy) {
  const base = {
    'Slim + tone': { sets: 3, reps: '12–15', rest: 45 },
    'Build muscle': { sets: 3, reps: '8–12', rest: 75 },
    'Maintain': { sets: 3, reps: '10–12', rest: 60 },
    'Get stronger': { sets: 4, reps: '5–8', rest: 120 }
  }[goal];
  if (energy === 'Low') return { ...base, sets: Math.max(2, base.sets-1) };
  return base;
}

function showWorkout() {
  if (!state.workout) return renderHome();
  state.view = 'workout';
  const w = state.workout;
  app.innerHTML = `
    <div class="topbar"><button class="icon-button" onclick="renderHome()">←</button><div class="brand">FORM</div><button class="icon-button" onclick="regenerate()">↻</button></div>
    <section class="workout-head"><div><div class="eyebrow">Today</div><h2>${w.title}</h2><div class="workout-meta">${w.note} · ${state.answers.time} min</div></div><div class="badge">${w.exercises.length} moves</div></section>
    <section class="card" style="margin-bottom:14px"><div class="eyebrow">Warm up</div><strong>${w.warmup} minutes</strong><p class="helper">Easy movement, then one light practice set of the first exercise.</p></section>
    <section class="exercise-list">${w.exercises.map((x,i)=>exercisePreview(x,i)).join('')}</section>
    <div class="footer-actions single"><button class="primary-button" onclick="startWorkout()">Start workout</button></div>
    ${nav('workout')}`;
}

function exercisePreview(x,i) {
  return `<article class="exercise-card"><div class="exercise-main"><div class="exercise-number">${String(i+1).padStart(2,'0')} · ${x.muscle}</div><div class="exercise-name">${x.name}</div><div class="exercise-prescription">${x.sets} sets · ${x.reps} reps · ${x.rest}s rest</div></div><div class="exercise-actions"><button class="pill-button" onclick="showTip(${i})">How to</button><button class="pill-button" onclick="swapExercise(${i})">Swap</button></div></article>`;
}

function regenerate() { generateWorkout(); }
function swapExercise(i) {
  const x = state.workout.exercises[i];
  const old = x.name;
  x.name = x.swap;
  x.swap = old;
  showWorkout();
}
function showTip(i) {
  const x = state.workout.exercises[i];
  showModal(x.name, `Move slowly, keep the working muscle under control, and stop the set with about two good reps left. Choose a weight that lets the final reps feel challenging without losing form.`);
}

function startWorkout() {
  state.view = 'active';
  state.activeIndex = 0;
  state.startedAt = Date.now();
  clearInterval(state.timerId);
  state.timerId = setInterval(updateTimer, 1000);
  renderActive();
}

function renderActive() {
  const x = state.workout.exercises[state.activeIndex];
  app.innerHTML = `
    <div class="topbar"><button class="icon-button" onclick="pauseWorkout()">←</button><div class="brand">FORM</div><div class="timer" id="timer">00:00</div></div>
    <section class="card active-card">
      <div class="active-top"><div><div class="eyebrow">Exercise ${state.activeIndex+1} of ${state.workout.exercises.length}</div><h2>${x.name}</h2><p class="workout-meta">${x.reps} reps · ${x.rest}s rest</p></div></div>
      <p class="helper">Use a weight that leaves roughly two solid reps in reserve.</p>
      <div>${Array.from({length:x.sets},(_,i)=>setRow(i,x)).join('')}</div>
    </section>
    <div class="footer-actions"><button class="ghost-button" onclick="swapActive()">Swap</button><button class="primary-button" onclick="nextExercise()">${state.activeIndex===state.workout.exercises.length-1?'Finish':'Next exercise'}</button></div>`;
  updateTimer();
}

function setRow(i,x) {
  const done = x.completed[i];
  return `<div class="set-row"><div style="font-weight:750;text-align:center">${i+1}</div><input inputmode="decimal" placeholder="Weight" aria-label="Weight for set ${i+1}"><input inputmode="numeric" placeholder="Reps" aria-label="Reps for set ${i+1}"><button class="set-check ${done?'done':''}" onclick="toggleSet(${i})">${done?'✓':'○'}</button></div>`;
}
function toggleSet(i) { const x=state.workout.exercises[state.activeIndex]; x.completed[i]=!x.completed[i]; renderActive(); }
function updateTimer() { const el=document.getElementById('timer'); if(!el||!state.startedAt)return; const s=Math.floor((Date.now()-state.startedAt)/1000); el.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function swapActive() { swapExercise(state.activeIndex); renderActive(); }
function pauseWorkout() { clearInterval(state.timerId); showWorkout(); }
function nextExercise() { if(state.activeIndex < state.workout.exercises.length-1){ state.activeIndex++; renderActive(); } else finishWorkout(); }

function finishWorkout() {
  clearInterval(state.timerId);
  const minutes = Math.max(1, Math.round((Date.now()-state.startedAt)/60000));
  state.history.unshift({ date:new Date().toISOString(), title:state.workout.title, minutes, exercises:state.workout.exercises.length, focus:state.answers.focus });
  saveHistory();
  app.innerHTML = `<div class="topbar"><div class="brand">FORM</div></div><section class="hero"><div class="eyebrow">Complete</div><h1>Nicely done.</h1><p class="lede">${minutes} minutes. ${state.workout.exercises.length} movements. No overthinking required.</p></section><section class="card"><button class="primary-button" onclick="renderHome()">Back home</button></section>`;
}

function showHistory() {
  state.view = 'history';
  app.innerHTML = `<div class="topbar"><div class="brand">FORM</div></div><section class="hero"><div class="eyebrow">Progress</div><h2 class="question-title">Workout history</h2><p class="question-copy">Simple proof that you showed up.</p></section><section class="card">${state.history.length ? state.history.map(h=>`<div class="history-item"><div><strong>${h.title}</strong><span>${new Date(h.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</span></div><div style="text-align:right"><strong>${h.minutes} min</strong><span>${h.exercises} moves</span></div></div>`).join('') : '<div class="empty">Your completed workouts will appear here.</div>'}</section>${nav('history')}`;
}

function openLatest() { state.workout ? showWorkout() : startBuilder(); }
function goHome() { renderHome(); }
function showAbout() { showModal('Designed to stay simple', 'Form makes one workout at a time. It avoids crowded dashboards and keeps every screen focused on the next decision.'); }
function showModal(title, text) {
  document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="modal" onclick="closeModal(event)"><div class="modal"><h3>${title}</h3><p>${text}</p><button class="primary-button" onclick="document.getElementById('modal').remove()">Got it</button></div></div>`);
}
function closeModal(e){ if(e.target.id==='modal') e.target.remove(); }

if (location.protocol === 'https:' && 'serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }
renderHome();
