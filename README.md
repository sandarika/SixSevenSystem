# ChallengeU - University of Nebraska Lincoln
*Raikes Hacks 2026*

Get out there! 💪 ChallengeU connects UNL students with recreation opportunities, social events, and fitness communities across campus.

---

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- **Expo Go app** (download from [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation & Running

1. Navigate to the ChallengeU folder:
   ```bash
   cd ChallengeU
   ```

2. Install dependencies:
   ```bash
   npm install -g expo-cli
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start --tunnel
   ```

4. **Using Expo Go (Recommended for Development):**
   - Open the **Expo Go** app on your iOS or Android device
   - Scan the QR code displayed in your terminal

---

## About ChallengeU

ChallengeU is the all-in-one app for UNL students looking to stay active and connected. Whether you want to hit the gym, join a pickup game, find your next adventure, or connect with club sports teams, ChallengeU makes it easy.

The current repository includes a frontend scaffold with a login screen and tabbed navigation. Tabs correspond to the major features described below (Activity Hub, Meetup, Activity Feed, Teams) and are styled in the scarlet‑and‑cream brand palette.

### Features

🏋️ **Real-Time Activity Hub** - Check the live status and busyness of recreation facilities across campus:
- Rec Center capacity and available equipment
- Outdoor Adventure Center schedules
- Sand volleyball courts and tennis court availability
- Gym busy times

💬 **Social Events Platform** - Start and organize games with other students:
- Create and discover events (basketball, soccer, hiking, etc.)
- Built-in calendar integration
- RSVP and participant tracking
- Real-time messaging with event organizers and teammates

📊 **Activity Feed & Fitness Tracking** - Stay motivated and social:
- Share your workouts and activities
- View in-app fitness progress snapshots
- Follow friends and see what they're up to
- Celebrate milestones together

🏆 **Club & Intramural Sports** - Find your team:
- Browse UNL club and intramural sports teams
- Team schedules and rosters
- Event information and registration
- Connect with teammates

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
- Platforms: iOS, Android, Web

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
