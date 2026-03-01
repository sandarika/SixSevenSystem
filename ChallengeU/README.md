# ChallengeU

ChallengeU is a mobile app for campus recreation: finding meetups, tracking team games on a calendar, and connecting with activity communities.

## Features

- Capacity + activity view for recreation spaces
- Meetup feed with like-to-calendar flow
- Teams calendar with joined team games + liked meetup events
- iOS Apple Calendar sync for liked meetups and joined team games

## Judge Testing on Phone

### Important notes

- For full feature testing (calendar sync), use a custom iOS development build (not Expo Go).
- Expo Go can run core UI, but native calendar behavior may be limited.

### Option A (recommended): iPhone with full native features

Prerequisites:

- Mac with Xcode
- iPhone connected by USB for first install, trusted device
- Same Wi-Fi network for Mac and iPhone after install

Steps:

1. Install dependencies

   ```bash
   npm install
   ```

2. Generate iOS native project

   ```bash
   npx expo prebuild --platform ios
   ```

3. Install app on iPhone

   ```bash
   npx expo run:ios --device
   ```

4. Start Metro for dev client (keep this terminal open)

   ```bash
   lsof -ti :8081 | xargs kill -9 2>/dev/null || true
   npx expo start --dev-client --host lan --port 8081 --clear
   ```

5. Open the installed ChallengeU app on iPhone.

If the app does not auto-connect:

- Shake phone → open dev menu → open by URL
- Use: `exp://<your-mac-local-ip>:8081`

### Option B: Quick UI-only check with Expo Go

```bash
npx expo start
```

Scan QR with Expo Go.

## Apple Calendar Verification (iOS)

1. Open Meetup tab and like an event.
2. Open Teams tab and join a team.
3. Confirm events are added to Apple Calendar.

## Project Scripts

```bash
npm run start
npm run ios
npm run android
npm run web
npm run lint
```
