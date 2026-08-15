# Form Beta v3.1

Form is a mobile-first workout app built to remove workout decision fatigue.

**Simple on the surface. Thoughtful underneath.**

## What is new in v3.1

### Smarter time-based programming

- Workout generation now estimates the actual session time from warm-up, exercise setup, working sets, rest periods, transitions, and cooldown.
- Short sessions reduce lower-priority volume before removing important movements.
- If useful time remains, Form adds productive volume to higher-value movements instead of adding filler exercises.
- Cardio-only sessions now use one clear modality for the available active time instead of several unrelated cardio movements.
- Mobility sessions use purposeful rounds and avoid unnecessary rest timers.

### More exercise-aware prescriptions

- Strength compounds and accessories no longer receive the same rep and rest prescription just because they share the same goal.
- Strength-focused plans use lower rep ranges and longer rest for compound lifts while keeping accessory work in more appropriate rep ranges.
- Build-muscle programming uses broader evidence-informed rep ranges and longer rest for demanding compound work.
- Fat-loss goals no longer force every resistance exercise into a short-rest, high-rep circuit.
- Unilateral movements are labeled per side where appropriate.

### Better exercise selection

- Full-body and Pick for me choices now use actual recently completed exercises to estimate recent focus exposure.
- Movement-family variety is preferred when building a session.
- Loadable movements receive a modest preference for muscle-building and strength goals when the user's equipment allows them.
- The structured exercise library was expanded from about 91 to more than 100 exercises.

### Better tracking and progression

- Bodyweight movements no longer ask the user to type pounds.
- Band exercises can record a band or resistance description.
- Cardio can record effort without pretending the value is a weight.
- Previous-performance summaries now keep weight and reps tied to the same actual set.
- Conservative load progression is only suggested when the recorded working sets support it.

### Better plan integrity

- A planned workout must now be meaningfully completed before the training sequence advances.
- Very partial sessions are still saved to history, but the planned workout remains next in the sequence.

### Better instructions

- High-value common movements now use manually curated three-step How to instructions.
- Other exercises keep the existing concise cue system.
- Video support remains prepared in the data model but no unlicensed internet videos were added.

## Existing v3 features preserved

- One-time onboarding.
- Time-based greeting using the user's first name.
- Sequence-based training plans.
- Optional Adjust workout controls.
- Profile, Training Plan, Equipment, Preferences, History, About Me, and Help / Send Feedback screens.
- Smart swapping to a different movement family when possible.
- Behavior learning from repeated swaps and skips.
- Previous-performance recall and editable progression suggestions.
- Resumable active workouts.
- Tappable workout history.
- Body-weight history.
- Optional post-workout difficulty feedback.
- Immediate rest-timer dismissal when Skip is tapped.
- Approved Form F Home Screen icon.

## Data compatibility

Form v3.1 intentionally keeps the existing v3 localStorage keys. Existing v3 profiles, history, behavior data, and resumable workouts remain compatible.

Uploading the updated files to GitHub does not erase browser data. Clearing browser website data, switching browsers, or moving to another device can still remove or separate local data because Form does not yet use accounts or cloud synchronization.

## Programming approach

The v3.1 programming changes were reviewed against current resistance-training evidence, including the 2026 ACSM resistance-training position stand and peer-reviewed research on load, rest intervals, and time-efficient resistance training.

The engine remains a rule-based beta rather than a replacement for individualized coaching. See `PROGRAMMING-NOTES.md` for the design rationale and sources used for this release.

## GitHub Pages upload

See `GITHUB-UPLOAD-GUIDE.txt` for the exact steps.

The GitHub Pages configuration remains:

- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

## Public beta limitations

This remains a static beta stored in the current browser. It does not yet include:

- accounts or cloud synchronization
- licensed exercise demonstration videos
- a hosted feedback database
- analytics or crash reporting
- subscription billing
- Apple Health integration
- App Store or TestFlight distribution
- professional medical or coaching oversight

The workout rules are more structured in v3.1, but the complete programming system has not been formally reviewed by a qualified fitness professional for commercial release.

Form provides general fitness information, not medical advice. Stop if a movement causes pain. People with an injury, pregnancy, chronic condition, or concerning symptoms should obtain guidance from a qualified professional.
