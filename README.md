# Coral Vision

**A Mobile-based Coral Species Identification System Using EfficientNet-B0 Algorithm, Conservation Information Retrieval and Geo-tag Monitoring**

Coral Vision is a mobile app that identifies coral species from a photo, shows each species' conservation profile, and records where every find was made. It was built as an undergraduate thesis project at West Visayas State University, using coral species from the Capiz Provincial Environment and Natural Resources Office (PENRO).

## Features

- **Species identification** – take a photo or pick one from the gallery; the app returns the top 3 matching species with confidence scores.
- **Conservation profiles** – taxonomy, characters, colors, similar species, habitat, abundance, distribution, health condition, threats, IUCN status and references, plus an offline QR code for each species.
- **Geo-tagging** – each find is located from the photo's own location data, or the phone's GPS as a fallback.
- **Dashboard** – totals, a mini map, a crown-of-thorns alert, conservation status breakdown, finds per species and a low-confidence review list.
- **History and map** – every saved identification, filterable, and plotted on a map.

## Tech stack

| Part | Tools |
|---|---|
| Mobile app | React Native, Expo, React Navigation, react-native-maps, react-native-svg |
| Storage | expo-file-system (local JSON + image copies) |
| Location | expo-location, expo-media-library, photo EXIF |
| Model | EfficientNet-B0 (transfer learning) in TensorFlow/Keras, exported to TensorFlow Lite |
| Training | Python, Google Colab |

## Project status

The app runs end to end, but identification currently uses a **mock model** (`USE_MOCK_MODEL` in `src/services/inference.js`) while the PENRO dataset is being collected. The species list in `src/config/species.js` is a placeholder until PENRO's final list is confirmed. Running the real TFLite model on-device will require a development build (not Expo Go).

## Getting started

Requirements: [Node.js](https://nodejs.org) (LTS) and the **Expo Go** app on your phone.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

## Project structure

```
App.js                  app entry, intro splash + navigator
src/
  screens/              Dashboard, Capture, Result, History, HistoryDetail, Map
  components/           shared UI (header, buttons, cards, species profile, mini map…)
  services/             inference, location / geo-tag, storage, sample data
  config/species.js     species list + conservation profiles
  theme/                colors and type styles
training/               EfficientNet-B0 training pipeline (see training/README.md)
assets/                 icon, logo, splash
```

## Training the model

See [`training/README.md`](training/README.md). In short: put images in `training/data/raw/<species_id>/`, then run the Colab notebook in `training/colab/`. Dataset images and trained models are not stored in this repository.

## Evaluation

The system is evaluated with an accuracy test on a held-out image set and the Post-Study System Usability Questionnaire (PSSUQ).

## Author

Mhel Bustamante – West Visayas State University
