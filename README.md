# Form Workout App v2

## What changed

- Glutes and legs are now separate choices.
- The first screen now has 14 training choices.
- Up to four areas can be selected together.
- Full body and Surprise me remain one-tap choices.
- Equipment filtering now works for bodyweight, dumbbells, bands, home gyms, and full gyms.
- Multiple caution areas can be selected.
- Exercise substitutions respect the selected equipment and caution areas.
- Weight and rep entries no longer disappear after checking off a set.
- Each exercise has specific form guidance.
- A rest timer starts after a completed set.
- In-progress workouts are saved locally and can be resumed.
- Workout history includes difficulty feedback.
- The service worker was changed so GitHub Pages updates are less likely to remain stuck on an older cached version.
- Home-screen icons are included.

## Replace the current GitHub Pages version

1. Download and extract this ZIP on a computer.
2. Open the extracted `form-workout-app-v2` folder.
3. In GitHub, open the same repository currently hosting Form.
4. Click **Add file**, then **Upload files**.
5. Drag every file from this folder into the upload area:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `sw.js`
   - `manifest.webmanifest`
   - `icon-192.png`
   - `icon-512.png`
   - `apple-touch-icon.png`
   - `.nojekyll`
   - `README.md`
6. GitHub will warn that the existing files have the same names. That is expected. The new files will replace them.
7. Enter a commit message such as `Update Form to version 2`.
8. Commit directly to the `main` branch.
9. Wait one to five minutes for GitHub Pages to redeploy.
10. Open the live Form page and refresh it.

## If the iPhone still shows the old version

The old app may still be cached.

1. Open the live GitHub Pages address directly in Safari.
2. Refresh the page.
3. Close Form completely and reopen it from the Home Screen.
4. If it still shows the old version, delete the Form Home Screen icon.
5. Open the live address again in Safari.
6. Tap **Share**, then **Add to Home Screen**.

Your GitHub Pages setting should remain:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

You do not need to create a new repository, change the Pages setting, or keep the computer running.

## Important public-use limitations

This is a polished static prototype reviewed as version 2.1. It stores data only in the current browser and does not yet include user accounts, cloud backup, coaching oversight, exercise videos, subscription billing, analytics, or a legal privacy policy/terms flow. It provides general fitness information and is not a medical product.
