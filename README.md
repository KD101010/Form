# Form Beta v3.0

Form is a mobile-first workout app built to remove workout decision fatigue.

**Simple on the surface. Thoughtful underneath.**

## What is new in v3.0

- One-time onboarding for first name, goal, experience, normal schedule, equipment, limitations, muscle priorities, exercise dislikes, and training plan.
- Time-based greeting using the user's first name.
- A simple home screen with the next workout in the user's training sequence.
- Training plans advance only when a planned workout is completed. Missing a day does not skip the sequence.
- Daily goal, equipment, limitation, and energy questions were removed.
- Optional **Adjust workout** controls for less time, easier/harder sessions, and temporary caution areas.
- Profile, Training Plan, Equipment, Preferences, History, About Me, and Help / Send Feedback screens behind the three-dot menu.
- Smarter exercise selection using equipment, experience, recent history, priorities, dislikes, limitations, and prior behavior.
- Smarter swaps that move to a different exercise family instead of cycling through nearly identical variations.
- Repeated swaps and skips quietly reduce how often those exercises are prescribed.
- Prior weight and rep performance is remembered.
- Previous performance is shown when useful.
- Conservative weight progression can be suggested after completing the top of a rep range.
- Completed workouts are tappable and show exercises, sets, reps, weights, swaps, and skipped exercises.
- Body-weight entries are preserved as history rather than overwritten.
- Optional post-workout difficulty feedback.
- Interrupted workouts remain resumable.
- The rest timer disappears immediately when **Skip** is tapped.
- A beta feedback action uses the iPhone share sheet when supported.
- The approved Form F icon is included for iPhone Home Screen installation.

## Existing user data

The update uses new v3 storage keys. Existing v2 workout history is automatically copied into the v3 history the first time the new version opens.

The one-time onboarding will still appear because the previous version did not have a complete user profile or training plan.

Uploading the new files to GitHub does not delete browser data. Clearing Safari website data, using a different browser, or using another device will not carry the local history over.

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
- professional medical or coaching oversight

The workout rules are structured and personalized, but a qualified fitness professional should review the programming before a broad commercial release.

Form provides general fitness information, not medical advice. Stop if a movement causes pain. People with an injury, pregnancy, chronic condition, or concerning symptoms should obtain guidance from a qualified professional.
