# Form v3.1 Changelog

## Workout timing

- Added session-time estimation using warm-up, setup, set duration, rest, transitions, and cooldown.
- Added time-fitting logic that reduces lower-priority volume before removing important movements.
- Added productive volume when useful time remains instead of adding filler exercises.
- Cardio-only workouts now use one clear modality for the active time budget.
- Mobility programming now uses purposeful rounds with no unnecessary rest timer.

## Programming

- Replaced blanket goal prescriptions with exercise-role-aware strength prescriptions.
- Strength compounds now use lower rep ranges and longer rest than accessories.
- Build-muscle programming now uses broader rep ranges with longer rest for demanding compound work.
- Fat-loss strength training no longer uses a universal 45-second rest rule.
- Added per-side prescriptions for unilateral movements where appropriate.

## Selection and exercise library

- Full-body focus order now responds to recent completed exercise exposure.
- Pick for me uses actual completed exercise exposure when available.
- Added movement-family diversity during workout generation.
- Added a modest preference for externally loadable exercises for strength and muscle-building goals when equipment permits.
- Expanded the exercise library past 100 movements, including additional lower-body, posterior-chain, chest, shoulder, back, and arm options.

## Tracking and progression

- Added tracking modes for weighted, bodyweight, band, cardio-effort, and non-load movements.
- Bodyweight exercises no longer ask for pounds.
- Band and cardio history no longer display their entries as pounds.
- Fixed previous-performance summaries so load and reps always come from the same actual set.
- Progression suggestions now use a consistent working load rather than combining unrelated sets.

## Training plans

- Planned sessions must be meaningfully completed before the split sequence advances.
- Partial planned sessions are saved without advancing the plan.

## Instructions

- Added manually curated three-step How to instructions for common high-value movements.
- Preserved concise fallback instructions for the rest of the library.
- Video fields remain ready for future properly licensed or owned demonstrations.

## Reliability

- Preserved v3 localStorage keys for data compatibility.
- Updated app version, asset query strings, and service-worker cache key.
- Added expanded automated regression and generator matrix testing.
