# Form v3.2 Programming Notes

This file documents the beta programming and product rules used in v3.2. It is not medical advice and is not a claim that Form creates an objectively optimal workout.

## Core principle

The user should provide only information that materially changes the workout. Form should handle the complexity behind the interface.

## Literal requirements

Exercise eligibility now evaluates two separate layers:

1. **Main equipment** such as dumbbells, bands, barbell, cable, machines, or cardio equipment.
2. **Literal setup requirements** such as floor access, bench, chair, elevated support, wall, rack, landmine, fixed band anchor, specific machine type, or specific cardio machine.

Temporary constraints always outrank preference and variety. Form must not quietly relax a stated restriction to fill the workout.

## Today's context

Temporary constraints live in Adjust Workout and expire after the generated workout is consumed. The normal profile remains unchanged.

Examples include Dumbbells only, No bench, Standing only, No floor, No jumping, Quiet, and unavailable machine/cable conditions.

## Progression

v3.2 retains conservative load progression. A normal multi-set exercise requires at least two comparable completed working sets at the top of the current rep range before an increase is suggested. Blank or skipped work is not treated as successful performance.

Progression remains editable and optional. Holding load steady or progressing repetitions is valid.

## Dose and timing

The v3.1 role-aware programming remains in place, with a v3.2 correction: the time-fitting pass may reduce work to fit the session but may not add sets beyond the exercise's original prescribed dose cap.

Rest is counted between working sets, not after the final remaining set.

## Swaps

A swap replaces only remaining work. Completed sets from the old movement are preserved as an immutable completed segment for History and future performance review. The replacement is re-prescribed using its own movement metadata.

## Evidence context

The v3.1 research pass reviewed current ACSM resistance-training guidance and peer-reviewed evidence on load, volume, rest, progression, time-efficient training, and variation. The v3.2 independent audit additionally reviewed the complete exercise inventory and identified data-model, persistence, and usability risks.

Before a broad commercial release, the complete exercise library and representative generated programs should receive qualified exercise-professional review.
