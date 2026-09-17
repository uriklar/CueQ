# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Expo SDK 57

CueQ targets Expo SDK 57 (`expo` 57.0.23), React Native 0.86.3, and
React 19.2.3. Use Node.js 22.13+ and install the lockfile with `npm ci`.
Open the project with an Expo Go build that supports SDK 57.

Validation commands:

```bash
npm test -- --watchAll=false --runInBand
npm run typecheck
npm run lint
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

SDK 57's newer ESLint rules report existing effect/state patterns in the app
(`react-hooks/set-state-in-effect` and `react-hooks/immutability`); these are
not suppressed by this upgrade. The older lint configuration reported 29
warnings and no errors. The upgraded configuration reports those warnings
and 11 errors in unchanged application code. Effect refactoring is separate
from this SDK compatibility change.

### Publishing

Pushes to `main` publish through the existing **EAS Update** GitHub Actions
workflow, using the repository's `EXPO_TOKEN` and Gemini configuration. The
workflow installs the lockfile, runs tests, typechecks, and runs Expo Doctor
before publishing Android and iOS updates to the existing `production` branch
in `@uriklar/CueQ` (project `d74f216f-55c5-49e6-8109-d8b5cbab162a`).
SDK 57 requires an explicit EAS environment; the workflow uses `production`.
It reads the published update back and refreshes the existing preview redirect.

The `appVersion` runtime policy is preserved, with the app version bumped to
**1.1.0** so SDK 54 binaries on runtime 1.0.0 cannot download an incompatible
SDK 57 update. Standalone/development builds need rebuilding for the new native
runtime; an EAS Update does not upgrade their native code. No native build is
started by this workflow. Physical Expo Go testing is still required for
end-to-end device verification.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
