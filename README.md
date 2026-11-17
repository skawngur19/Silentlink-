# SilentLink — classroom prototype

A high-fidelity, tablet-first prototype of **SilentLink**, an ASL reference and practice
platform for Philippine SPED teachers and Deaf/Hard-of-Hearing kindergarten learners.
Built as a static site with plain HTML, CSS and JavaScript — no build step. Firebase
Authentication and Firestore are used for sign-in and the shared sign reference catalog.

## Run it

```powershell
py -m http.server 3000
# open http://localhost:3000
```

Firebase's web SDK is loaded from Google's CDN, so an internet connection is required to sign
in and access Firestore. Fonts and Lucide icons remain bundled in `assets/`.

## Firebase setup

1. In Firebase Console, enable **Authentication → Email/Password** and create accounts under
   **Authentication → Users**.
2. Open **Firestore Database → Rules**, replace the rules with the contents of
   [`firestore.rules`](./firestore.rules), and publish them.
3. In **Firestore Database → Data**, create a `users` collection. For each account, create a
   document whose ID is that account's Authentication **UID**. Add a string `role` field with
   `teacher`, `learner`, or `consultant`. You can optionally add a `name` string. The app does not
   let users choose their role at sign-in.
4. Open the site and sign in using the account's Firebase email and password. On the first
   teacher sign-in, the built-in reference signs are added to Firestore if the `signs` collection
   is empty.

The Firebase web API key in `firebase.js` is a public client identifier, not a service-account
secret. Firestore rules—not hiding this value—protect database access.

## What currently uses Firebase

- Email/password authentication and role lookup from `users/{uid}`.
- Shared sign-reference reads. Teacher sign-in seeds the built-in reference signs only when the
  catalog is empty. Consultant review updates are saved to Firestore.
- Teacher-owned learner profiles store only a classroom nickname and grade. The Progress screen
  reads each teacher's profiles and their attempts collection from Firestore.
- Firestore access is restricted by role in [`firestore.rules`](./firestore.rules). The rules do
  not allow access to lessons or activity collections.

Add learner profiles from **Teacher → Progress → Add learner**. Use a classroom nickname rather
than a full name. Profiles are scoped to the signed-in teacher account.

The learner practice camera feedback remains simulated and does not write practice attempts or
mastery scores. Those remain blank rather than showing fabricated progress.
The `learners/{learnerId}/attempts` subcollection is read-only until genuine recognition and a
privacy-reviewed progress workflow are implemented. Lesson assignments, teacher notes, consent
records, and recent activity are not saved to Firebase. Do not enter real student or sensitive
information.

## Getting around

The screens remain clickable:

- **Teacher** — Dashboard, Repository, Sign detail, Lesson Builder, Progress, Recognition (Prototype), Sign-to-Search (Beta), Settings & Privacy
- **Learner** — Home, Sign Practice, Reward, My Stars
- **Consultant** — Validation Queue, Review Sign, Record Sign

The round dark button at the bottom-right opens the **prototype panel**:

- Jump to any screen
- Pin camera feedback states **A–E** (waiting, tracking, close, match, camera issue)
- Toggle the offline notice, list loading state, video error and reduced motion
- Reset the mock data

## Prototype behaviours

- Search, filters, sign selection, drag-and-drop reordering and quiz checking use prototype data.
- Sign-to-Search runs a 3-second countdown and a 2-second analysis, then returns three mocked matches.
- Learner practice feedback and Sign-to-Search remain simulated.
- **Teacher → Recognition (Prototype)** uses MediaPipe hand landmarks to capture labeled samples
  and compare live hand movement with at least five examples per sign. It is an experimental
  nearest-example comparison, not validated sign recognition or suitable for grading. It loads
  MediaPipe and its hand-landmark model from a CDN when started, so an internet connection is
  required for this feature.
- Validated signs can be added to lessons; Under Review, Draft and Archived signs are gated.
- Approving or requesting changes on a review updates the sign catalog in Firestore.

## Camera and privacy

The learner practice flow does not access the webcam. The separate Recognition prototype starts
the camera only after the teacher confirms school approval and guardian consent. Camera video is
processed in-browser and is not saved or uploaded. Landmark samples stay in memory until explicitly
exported as JSON; refreshing the page clears them. Imported/exported sample files can contain
movement data, so store them only in an approved, access-controlled location. Recognition output
is experimental and is never saved as learner progress.

## Prototype content

13 kindergarten sign references (hello, thank you, please, yes, no, mom, dad, eat, drink, happy,
sad, more, sorry) and seeded consultant credits. Learner profiles start empty. Camera feedback
and sign-search results are simulated.
