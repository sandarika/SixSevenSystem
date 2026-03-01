# ChallengeU - University of Nebraska Lincoln
*Raikes Hacks 2026*

Get active, Huskers! 💪 ChallengeU connects UNL students with recreation opportunities, social events, and fitness communities across campus, all in one unified platform!

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- macOS with Xcode (for iOS builds)
- CocoaPods (`sudo gem install cocoapods` if not installed)

### Installation

1. Navigate to the ChallengeU folder:
   ```bash
   cd ChallengeU
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Run as iOS Development Build (recommended to get Apple Health data for syncing)

1. Generate native iOS files:
   ```bash
   npx expo prebuild --platform ios
   ```

2. Build and install on iOS simulator or connected device:
   ```bash
   npx expo run:ios
   ```
   Or target a specific simulator/device:
   ```bash
   npx expo run:ios --device 
   ```

3. Start Metro for the development client:
   ```bash
   lsof -ti :8081 | xargs kill -9 2>/dev/null || true
   npx expo start --dev-client --host lan --port 8081 --clear
   ```

4. Open the installed ChallengeU app.

If app does not auto-connect, open by URL:
```bash
exp://<YOUR_LOCAL_IP>:8081
```

### Optional: Expo Go (UI-only, no Apple Health integration)

Some native features (for example Apple Health/Calendar behavior) require a development build.

```bash
npx expo start
```

---

## About ChallengeU

ChallengeU is the all-in-one app for UNL students looking to stay active and connected. Whether you want to hit the gym, join a pickup game, find your next adventure, or connect with club sports teams, ChallengeU makes it easy.

The current repository includes a frontend scaffold with a login screen and tabbed navigation. Tabs correspond to the major features described below (Activity Hub, Meetup, Activity Feed, Teams) and are styled in the scarlet‑and‑cream brand palette.

### Features

🏋️ **Real-Time Activity Hub** - Check the live status and busyness of recreation facilities across campus:
- Rec Center, Outdoor Adventure Center, and various court capacity and trend insights to guide student decisions
- Gym busy times and hours

💬 **Pickup and Social Events Platform** - Start and organize games with other students:
- Create and discover events (basketball, soccer, tennis, etc.)
- Built-in calendar integration that syncs with Apple Calendars
- RSVP and participant tracking, including notifications that friends are attending a pickup game

📊 **Activity Feed** - Stay motivated and social:
- Share your workouts and activities
- Upload images of your pump
- Follow friends and see what they're up to
- Celebrate milestones together and comment on workouts

🏆 **Club & Intramural Sport Teams** - Find your team:
- Browse and join current club and intramural sports teams
- View team schedules
- Event information and registration

❤️ **Personal Activity Hub** - Keep track of your health:
- View your real-time scan-ins per campus facility
- Sync with Apple Health to conveniently view step count, calories burned, and distance travelled
- Personal profile with name, profile picture, and friends list that easily integrates into feed

---

## Project Structure

```
├── App.tsx             # Main app component (TypeScript)
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── assets/             # App icons and images
├── server/             # Node.js backend
│   └── index.js        # Express server setup
└── README.md           # This file
```

---

## Tech Stack

**Frontend:**
- React Native with Expo
- TypeScript
- Platforms: iOS

**Backend:**
- Node.js with Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- REST API

---

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- Questions? Check out [Snack.expo.dev](https://snack.expo.dev/) for quick examples
