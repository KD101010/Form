# Form Beta v3.2

Form is a mobile-first workout app built to remove workout decision fatigue.

**Simple on the surface. Thoughtful underneath.**

## v3.2: Today's Setup + Reliability

The visible headline in v3.2 is simple: Form can now understand what is different **today** without making the normal start flow longer.

Open **Adjust workout** and use **Anything different today?** for temporary constraints such as:

- Dumbbells only
- No bench
- No floor
- Standing only
- No jumping
- Quiet workout
- Small space
- No kneeling
- No overhead
- No band anchor
- No cable
- No machines
- No leg press
- No hack squat

These changes expire after the workout and do not overwrite the user's normal setup.

## Smarter equipment eligibility

v3.2 separates the main training implement from the literal setup an exercise needs. A dumbbell exercise may still require a bench, seat, floor, step, or other support, so those requirements are now checked explicitly.

The Equipment screen can fine-tune:

- floor, wall, chair, bench, step, sliders, stability ball, and jump rope
- rack and landmine setup
- fixed band anchors
- cable details such as dual towers, seated-row station, and ankle cuff
- treadmill, bike, rower, and elliptical
- common machine types such as leg press, hack squat, curls/extensions, hip abduction, pulldown, row, pec deck, chest press, and shoulder press

## Reliability improvements

- Completed work survives exercise swaps.
- Replacement exercises receive their own prescription.
- Progression uses stronger completed-set evidence.
- Time fitting respects dose limits.
- Rest does not start after the last remaining set.
- Finish Early can save a partial workout without trapping the user in the plan sequence.
- Zero-work sessions are not recorded as completed workouts.
- Plan advancement is tied to the plan that actually generated the workout.
- Current rest state is recoverable after an interruption.
- Storage failures are no longer silently treated as success.

## Backup and restore

Open the three-dot menu and choose **Data & Backup**.

Form can export a versioned JSON backup containing the user's profile, plan state, workout history, behavior preferences, and current workout. Import validates the file before replacing local data and creates a temporary pre-import safety copy first.

This is still a local-first beta. It does not provide an account, automatic cloud backup, or cross-device sync.

## Exercise library

Form v3.2 contains 108 exercises. Every shipped exercise has structured requirement metadata and a concise three-part How To guide.

The new targeted variants are:

- Standing dumbbell row
- Standing dumbbell shoulder press
- Wall push-up
- Standing hip-flexor mobility

Video support remains planned for a future owned or properly licensed demonstration library.

## Current architecture

- Static HTML, CSS, and JavaScript
- GitHub Pages deployment
- Progressive Web App / iPhone Home Screen installation
- Local browser storage
- Service worker for offline reopening and controlled updates
- No backend or external AI API

## Important beta limitations

Form does not currently provide:

- accounts or authentication
- automatic cloud backup or cross-device sync
- Apple Health integration
- an owned exercise-video library
- native App Store / TestFlight distribution
- medical screening, diagnosis, or rehabilitation
- professional coaching oversight of every generated workout

The workout engine is evidence-informed, but it should not be described as producing an objectively perfect workout.
