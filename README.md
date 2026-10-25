# AURA WAY 🚗
**Your road-trip companion — built with Expo and React Native.**

AURA WAY is a mobile-first road-trip companion starter with a dark midnight/navy interface and mint accents.

## Included in this first build
- Home dashboard and destination entry.
- Interactive map using `react-native-maps`, with **Standard / Satellite / Hybrid** map modes.
- Foreground location permission and current-location marker.
- Driving directions opened in Google Maps.
- Nearby search shortcuts for scenic viewpoints, budget hotels, restaurants, fuel, EV charging, rest stops, hospitals, police, fire stations and roadside assistance.
- Trip budget calculator and expense history.
- Saved-stop list, trip name, and trip notes persisted locally on the device.
- Safety quick links, India emergency number 112 confirmation flow, and official IMD weather link.
- Quick links to YouTube Music and weather.

## Run it
Requires Node.js and npm.

```bash
npm install
npx expo start
```

Install Expo Go on an Android phone and scan the QR code from the Expo development server. If native dependencies or map support require a development build, use an Expo development build instead of Expo Go.

## Satellite map notes
The app exposes satellite and hybrid map modes through `react-native-maps`. Android's native Google map imagery in a standalone build typically needs a Google Maps Platform API key enabled for Maps SDK for Android and restricted to the app. This repo has an `app.config.js` hook that reads `GOOGLE_MAPS_API_KEY` from the build environment. Configure it as an environment variable or EAS secret before building. API usage may be subject to Google billing/quotas. Never commit a private API key into this public repository. Map imagery, coverage and availability are supplied by the map provider; the app does not own satellite imagery.

## Features that still need real services / secure implementation
This is a working starter, not yet a release-ready app. The following need additional implementation, testing and often a provider/API key:
- Accurate live traffic, route alternatives and scenic-route ranking.
- In-app turn-by-turn navigation and voice assistant.
- Live weather radar and push alerts.
- Live hotel, restaurant, fuel and charging availability/prices.
- Spotify integration / audiobook providers.
- Offline downloadable map tiles and offline routing.
- Battery-range estimates tailored to a vehicle.
- Family live-location sharing, SOS contact notifications, crash detection and background tracking.
- User accounts, cloud sync, multilingual UI, and persistent local storage.

These are deliberately not represented as already-working features. Location is requested only when the user chooses to use it. The SOS shortcut asks for confirmation before opening a phone call; it does not silently call anyone.

## Security
- Do not add API keys, access tokens, passwords, or personal data to Git.
- Before publishing, configure app identifiers, privacy disclosures, data retention, and provider terms.
- Test location, calling, map modes, navigation links, and accessibility on real devices.
