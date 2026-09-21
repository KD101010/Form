# Form v3.2 Changelog

## Today's setup

- Added optional **Anything different today?** controls inside Adjust Workout.
- Added temporary session constraints for Dumbbells only, No bench, No floor, Standing only, No jumping, Quiet workout, Small space, No kneeling, No overhead, No band anchor, No cable, No machines, No leg press, and No hack squat.
- Temporary setup changes apply only to the next workout and are summarized before use.
- Adjust Workout now uses a draft so Cancel genuinely discards changes.

## Literal exercise requirements

- Added audited requirement metadata for all 104 exercises carried forward from v3.1.
- Exercises can now declare floor, bench, chair, step, wall, sliders, stability ball, rack, landmine, jump rope, band-anchor, cable-station, machine-type, cardio-machine, posture, impact/noise, and space requirements.
- Dumbbells no longer imply a bench, seat, elevated support, or rear-foot support.
- Bodyweight no longer automatically means equipment-free.
- Fixed several exercise identity classifications identified in the independent v3.1 audit.
- Added four targeted gap-filling movements: Standing dumbbell row, Standing dumbbell shoulder press, Wall push-up, and Standing hip-flexor mobility.

## Equipment settings

- Expanded Equipment so users can confirm literal setup details behind the existing settings menu.
- Added support for common supports, barbell setup, band anchors, cable details, cardio machine types, and specific machine types.
- Existing v3 storage keys are preserved and older profiles receive conservative defaults.

## Swaps and workout integrity

- Swapping after completed sets no longer erases completed work.
- Completed work from a swapped-out exercise is archived into the workout history.
- Replacement exercises are re-prescribed for the remaining work instead of inheriting an unrelated prescription.
- A swap clears stale rest time and recalculates estimated session time.

## Progression and timing correctness

- Progression now requires at least two comparable completed working sets for normal multi-set exercises before suggesting an increase.
- The previous-performance search skips unusable occurrences that contain no completed work.
- Time fitting can no longer add sets above the prescription's original dose cap.
- Rest no longer starts after the final remaining set of an exercise.

## Partial workouts and plan safety

- Added **Finish early** to the active workout screen.
- Zero-work sessions are discarded instead of inflating History.
- Partial planned sessions can be saved while keeping the current plan step, or deliberately moved to the next step.
- Plan advancement is bound to the originating plan name and slot so changing a plan mid-workout does not advance the wrong plan.
- Finish records use a stable workout-based ID to reduce duplicate-history risk on retries.

## Data reliability and backup

- Storage helpers now report write failure instead of silently swallowing it.
- Current-workout persistence now includes the active rest deadline.
- Form saves current state when the page becomes hidden as well as before unload.
- Added **Data & Backup** with versioned JSON export and validated restore.
- Import creates a local pre-import safety copy and rejects malformed backups before replacing live data.
- History loading now filters malformed records instead of trusting any parsed array.

## Exercise guidance

- Added curated Set up / Do it / Watch for instructions for all 108 currently shipped exercises, based on the v3.1 audit drafts plus the four new variants.
- Video fields remain placeholders. No unlicensed third-party exercise video was added.

## PWA and accessibility reliability

- Service-worker cache cleanup is now limited to Form-owned caches.
- Failed HTTP responses are no longer written into runtime cache.
- Updates wait until the user explicitly accepts an **Update ready** prompt instead of immediately taking control during an active session.
- Removed the whole-app polite live region.
- Added modal focus containment, Escape handling, focus return, and background hiding while dialogs are open.
- Increased set-completion controls to 44 px and improved muted-text contrast while preserving the existing visual palette.

## Validation performed for this release

- `node --check app.js`
- `node --check sw.js`
- Focused v3.2 regression harness covering literal requirements, session constraints, band anchors, machine availability, dose caps, progression, swap preservation, and backup validation.
- 10,800 generated workout scenarios across equipment presets, goals, durations, focus choices, and temporary constraints. 10,500 produced workouts and 300 intentionally returned no match where the requested combination had no honest eligible pool. All generated exercises passed their current eligibility rules.
- Dedicated acceptance checks for dumbbells-only, dumbbells + no floor, standing-only, bands without anchors, and specific machine exclusions.

Physical iPhone Home Screen, VoiceOver, and real-world session-duration testing still require device use after deployment.
